import { promises as fs } from "fs";
import os from "os";
import path from "path";
import type { HouseholdState } from "./types";
import { DEFAULT_SETTINGS } from "./types";

/**
 * Where household lists live on the server.
 *
 *  - If a Redis REST endpoint is configured (Upstash / Vercel KV env vars),
 *    lists are stored there and survive deploys and multiple server instances.
 *  - Otherwise lists are kept in memory and mirrored to JSON files in a temp
 *    folder. That is perfect for local development (both phones talk to the
 *    same dev server) but on a serverless host the data can disappear.
 */

export interface Storage {
  get(code: string): Promise<HouseholdState | null>;
  /** Save `next` only if the stored version still equals `expectedVersion`. Returns false on conflict. */
  compareAndSet(code: string, expectedVersion: number, next: HouseholdState): Promise<boolean>;
  /**
   * Read-modify-write in one go. `change` gets the current list (or null if it
   * doesn't exist) and returns the new one, or null to leave it untouched.
   * Two phones saving at the same instant can never overwrite each other.
   */
  update(
    code: string,
    change: (current: HouseholdState | null) => HouseholdState | null
  ): Promise<{ state: HouseholdState | null; saved: boolean }>;
  kind: "redis" | "file";
}

const MAX_UPDATE_ATTEMPTS = 12;

/** Generic retry loop for storages whose only primitive is compare-and-set. */
async function updateWithCas(
  storage: Pick<Storage, "get" | "compareAndSet">,
  code: string,
  change: (current: HouseholdState | null) => HouseholdState | null
): Promise<{ state: HouseholdState | null; saved: boolean }> {
  for (let attempt = 0; attempt < MAX_UPDATE_ATTEMPTS; attempt++) {
    const current = await storage.get(code);
    const next = change(current);
    if (next === null || next === current) return { state: current, saved: false };
    const ok = await storage.compareAndSet(code, current?.version ?? 0, next);
    if (ok) return { state: next, saved: true };
    // Someone else saved first; wait a moment and try again on top of their copy.
    await new Promise((r) => setTimeout(r, 15 + Math.random() * 60 * (attempt + 1)));
  }
  throw new Error("Too many concurrent updates");
}

const KEY_PREFIX = "grocery:household:";
const TTL_SECONDS = 60 * 60 * 24 * 180; // forget a list after 6 months of no changes

// ---------- Redis (REST) ----------

const CAS_SCRIPT = `
local current = redis.call('GET', KEYS[2])
if (current == false and ARGV[1] == '0') or current == ARGV[1] then
  redis.call('SET', KEYS[1], ARGV[2], 'EX', ARGV[4])
  redis.call('SET', KEYS[2], ARGV[3], 'EX', ARGV[4])
  return 1
end
return 0
`;

class RedisStorage implements Storage {
  kind = "redis" as const;
  constructor(private url: string, private token: string) {}

  private async command<T>(args: (string | number)[]): Promise<T> {
    const res = await fetch(this.url, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(args),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Redis error ${res.status}: ${await res.text()}`);
    const data = (await res.json()) as { result?: T; error?: string };
    if (data.error) throw new Error(`Redis error: ${data.error}`);
    return data.result as T;
  }

  async get(code: string): Promise<HouseholdState | null> {
    const raw = await this.command<string | null>(["GET", KEY_PREFIX + code]);
    if (!raw) return null;
    try {
      return withDefaults(JSON.parse(raw));
    } catch {
      return null;
    }
  }

  async compareAndSet(code: string, expectedVersion: number, next: HouseholdState): Promise<boolean> {
    const result = await this.command<number>([
      "EVAL",
      CAS_SCRIPT,
      2,
      KEY_PREFIX + code,
      KEY_PREFIX + code + ":v",
      String(expectedVersion),
      JSON.stringify(next),
      String(next.version),
      String(TTL_SECONDS),
    ]);
    return result === 1;
  }

  update(code: string, change: (current: HouseholdState | null) => HouseholdState | null) {
    return updateWithCas(this, code, change);
  }
}

// ---------- In-memory + JSON files ----------

class FileStorage implements Storage {
  kind = "file" as const;
  private cache = new Map<string, HouseholdState>();
  private dir: string;
  private queue: Promise<unknown> = Promise.resolve();

  constructor(dir: string) {
    this.dir = dir;
  }

  private file(code: string) {
    return path.join(this.dir, `${code}.json`);
  }

  async get(code: string): Promise<HouseholdState | null> {
    const cached = this.cache.get(code);
    if (cached) return cached;
    try {
      const raw = await fs.readFile(this.file(code), "utf8");
      const state = withDefaults(JSON.parse(raw));
      this.cache.set(code, state);
      return state;
    } catch {
      return null;
    }
  }

  /** Runs `task` after every earlier task has finished, so writes never interleave. */
  private serialized<T>(task: () => Promise<T>): Promise<T> {
    const run = this.queue.then(task);
    this.queue = run.catch(() => undefined);
    return run;
  }

  private async write(code: string, next: HouseholdState) {
    this.cache.set(code, next);
    try {
      await fs.mkdir(this.dir, { recursive: true });
      const tmp = this.file(code) + ".tmp";
      await fs.writeFile(tmp, JSON.stringify(next));
      await fs.rename(tmp, this.file(code));
    } catch {
      // Keep going with the in-memory copy if the disk is read-only.
    }
  }

  compareAndSet(code: string, expectedVersion: number, next: HouseholdState): Promise<boolean> {
    return this.serialized(async () => {
      const current = await this.get(code);
      if ((current?.version ?? 0) !== expectedVersion) return false;
      await this.write(code, next);
      return true;
    });
  }

  update(code: string, change: (current: HouseholdState | null) => HouseholdState | null) {
    return this.serialized(async () => {
      const current = await this.get(code);
      const next = change(current);
      if (next === null || next === current) return { state: current, saved: false };
      await this.write(code, next);
      return { state: next, saved: true };
    });
  }
}

function withDefaults(state: HouseholdState): HouseholdState {
  return {
    ...state,
    items: Array.isArray(state.items) ? state.items : [],
    settings: { ...DEFAULT_SETTINGS, ...(state.settings ?? {}) },
  };
}

// ---------- Selection ----------

declare global {
  var __groceryStorage: Storage | undefined;
}

export function getStorage(): Storage {
  // (The typeof check protects against a stale copy after a dev hot-reload.)
  if (globalThis.__groceryStorage && typeof globalThis.__groceryStorage.update === "function") {
    return globalThis.__groceryStorage;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  let storage: Storage;
  if (url && token) {
    storage = new RedisStorage(url, token);
  } else {
    const dir = process.env.GROCERY_DATA_DIR || path.join(os.tmpdir(), "in-season-grocery");
    storage = new FileStorage(dir);
  }
  globalThis.__groceryStorage = storage;
  return storage;
}

// ---------- Household codes ----------

/** Unambiguous characters: no 0/O, 1/I/L so codes are easy to read out loud. */
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const CODE_LENGTH = 6;

export function makeHouseholdCode(): string {
  const bytes = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(bytes);
  let code = "";
  for (const b of bytes) code += CODE_ALPHABET[b % CODE_ALPHABET.length];
  return code;
}

export function normalizeCode(raw: string): string | null {
  const code = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (code.length !== CODE_LENGTH) return null;
  return code;
}
