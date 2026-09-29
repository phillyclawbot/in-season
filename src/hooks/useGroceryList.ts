"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { applyOps, makeId } from "@/lib/grocery/apply";
import { categorize } from "@/lib/grocery/categorize";
import { parseItemText, splitItems } from "@/lib/grocery/parse";
import type { Category, GroceryItem, HouseholdSettings, HouseholdState, Op } from "@/lib/grocery/types";

/**
 * Keeps one phone's copy of the shared list in step with the server.
 *
 * How it works, in plain terms:
 *  - Every change you make is applied on your phone immediately and added to a
 *    small "to send" queue, so the app never feels slow.
 *  - The queue is sent to the server right away; if you're offline it waits
 *    and retries, and survives closing the app.
 *  - Every few seconds (while the app is on screen) the phone asks the server
 *    "anything new since version N?" and picks up your partner's changes.
 *  - If the server has forgotten the list (a host without a database can do
 *    that when it goes idle), the phone puts its own saved copy back.
 */

export type SyncStatus = "loading" | "synced" | "syncing" | "offline" | "missing";

const POLL_MS = 4000;
const FLUSH_DEBOUNCE_MS = 120;
const MAX_BACKOFF_MS = 30000;
const RESTORE_COOLDOWN_MS = 20000;

interface Persisted {
  server: HouseholdState | null;
  pending: Op[];
}

function storageKey(code: string) {
  return `grocery-list:${code}`;
}

function loadPersisted(code: string): Persisted {
  try {
    const raw = localStorage.getItem(storageKey(code));
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Persisted>;
      return {
        server: parsed.server ?? null,
        pending: Array.isArray(parsed.pending) ? parsed.pending : [],
      };
    }
  } catch {}
  return { server: null, pending: [] };
}

function savePersisted(code: string, data: Persisted) {
  try {
    localStorage.setItem(storageKey(code), JSON.stringify(data));
  } catch {}
}

export function useGroceryList(code: string | null, userName: string) {
  const [server, setServer] = useState<HouseholdState | null>(null);
  const [pending, setPending] = useState<Op[]>([]);
  const [status, setStatus] = useState<SyncStatus>("loading");
  const [hydrated, setHydrated] = useState(false);

  // Refs mirror state for use inside timers without stale closures.
  const serverRef = useRef<HouseholdState | null>(null);
  const pendingRef = useRef<Op[]>([]);
  const flushingRef = useRef(false);
  const dirtyRef = useRef(false);
  const failuresRef = useRef(0);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRestoreRef = useRef(0);

  const commit = useCallback(
    (next: Partial<Persisted>) => {
      if (!code) return;
      if (next.server !== undefined) {
        serverRef.current = next.server;
        setServer(next.server);
      }
      if (next.pending !== undefined) {
        pendingRef.current = next.pending;
        setPending(next.pending);
      }
      savePersisted(code, { server: serverRef.current, pending: pendingRef.current });
    },
    [code]
  );

  // ---- Putting the list back if the server lost it ----
  const restore = useCallback(async (): Promise<boolean> => {
    if (!code) return false;
    const copy = serverRef.current;
    if (!copy) return false; // nothing saved on this phone; the list really is gone
    if (Date.now() - lastRestoreRef.current < RESTORE_COOLDOWN_MS) return false;
    lastRestoreRef.current = Date.now();
    try {
      const res = await fetch(`/api/grocery/${code}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: copy }),
      });
      if (!res.ok) return false;
      const data = (await res.json()) as { state: HouseholdState };
      commit({ server: data.state });
      return true;
    } catch {
      return false;
    }
  }, [code, commit]);

  // ---- Sending our changes ----
  const flush = useCallback(async () => {
    if (!code) return;
    if (flushingRef.current) {
      dirtyRef.current = true;
      return;
    }
    const batch = pendingRef.current;
    if (batch.length === 0) return;

    flushingRef.current = true;
    setStatus("syncing");
    try {
      const res = await fetch(`/api/grocery/${code}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ops: batch }),
      });
      if (res.status === 404) {
        if (await restore()) {
          // The list is back; the wrap-up below sends our changes again.
          dirtyRef.current = true;
          return;
        }
        setStatus("missing");
        return;
      }
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data = (await res.json()) as { state: HouseholdState };
      // Drop exactly the ops we sent; anything queued meanwhile stays.
      const remaining = pendingRef.current.slice(batch.length);
      commit({ server: data.state, pending: remaining });
      failuresRef.current = 0;
      setStatus("synced");
    } catch {
      failuresRef.current += 1;
      setStatus("offline");
      const delay = Math.min(MAX_BACKOFF_MS, 2000 * 2 ** (failuresRef.current - 1));
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      retryTimerRef.current = setTimeout(() => void flush(), delay);
    } finally {
      flushingRef.current = false;
      if (dirtyRef.current || pendingRef.current.length > 0) {
        dirtyRef.current = false;
        if (pendingRef.current.length > 0 && failuresRef.current === 0) void flush();
      }
    }
  }, [code, commit, restore]);

  const scheduleFlush = useCallback(() => {
    if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    flushTimerRef.current = setTimeout(() => void flush(), FLUSH_DEBOUNCE_MS);
  }, [flush]);

  // ---- Pulling partner's changes ----
  const pull = useCallback(async () => {
    if (!code) return;
    if (flushingRef.current) return; // the flush reply carries the latest list anyway
    try {
      const since = serverRef.current?.version ?? 0;
      const res = await fetch(`/api/grocery/${code}?since=${since}`, { cache: "no-store" });
      if (res.status === 404) {
        if (await restore()) {
          if (pendingRef.current.length > 0) void flush();
          else setStatus("synced");
          return;
        }
        setStatus("missing");
        return;
      }
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data = (await res.json()) as { unchanged?: boolean; state?: HouseholdState };
      if (data.state) commit({ server: data.state });
      if (pendingRef.current.length > 0) {
        void flush();
      } else {
        failuresRef.current = 0;
        setStatus("synced");
      }
    } catch {
      setStatus("offline");
    }
  }, [code, commit, flush, restore]);

  // ---- Lifecycle: load from phone storage, then start syncing ----
  useEffect(() => {
    if (!code) {
      serverRef.current = null;
      pendingRef.current = [];
      setServer(null);
      setPending([]);
      setHydrated(true);
      setStatus("loading");
      return;
    }
    const persisted = loadPersisted(code);
    serverRef.current = persisted.server;
    pendingRef.current = persisted.pending;
    setServer(persisted.server);
    setPending(persisted.pending);
    setHydrated(true);
    setStatus(persisted.server ? "synced" : "loading");
    failuresRef.current = 0;

    void pull();

    const tick = () => {
      if (document.visibilityState === "visible") void pull();
    };
    const interval = setInterval(tick, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void pull();
    };
    const onOnline = () => {
      failuresRef.current = 0;
      void pull();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    window.addEventListener("online", onOnline);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
      window.removeEventListener("online", onOnline);
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, [code, pull]);

  // ---- What the screen shows: server copy + our not-yet-sent changes ----
  const state = useMemo(() => {
    if (!server) return null;
    return pending.length ? applyOps(server, pending) : server;
  }, [server, pending]);

  const dispatch = useCallback(
    (op: Op) => {
      if (!code) return;
      commit({ pending: [...pendingRef.current, op] });
      scheduleFlush();
    },
    [code, commit, scheduleFlush]
  );

  // ---- Friendly actions the UI calls ----
  const addItems = useCallback(
    (text: string) => {
      const now = Date.now();
      const existing = state?.items ?? [];
      const lines = splitItems(text);
      lines.forEach((line, i) => {
        const parsed = parseItemText(line);
        if (!parsed.name) return;
        // If the same thing is already on the list but checked off, bring it back instead of duplicating.
        const dup = existing.find(
          (it) => it.name.toLowerCase() === parsed.name.toLowerCase()
        );
        if (dup) {
          if (dup.checked || (parsed.qty && parsed.qty !== dup.qty)) {
            dispatch({
              type: "update",
              id: dup.id,
              patch: { checked: false, ...(parsed.qty ? { qty: parsed.qty } : {}) },
              at: now + i,
            });
          }
          return;
        }
        const item: GroceryItem = {
          id: makeId(),
          name: parsed.name,
          qty: parsed.qty,
          category: categorize(parsed.name),
          checked: false,
          addedBy: userName,
          createdAt: now + i,
          updatedAt: now + i,
        };
        dispatch({ type: "add", item });
      });
    },
    [dispatch, state, userName]
  );

  const toggleItem = useCallback(
    (id: string) => {
      const item = state?.items.find((i) => i.id === id);
      if (!item) return;
      dispatch({ type: "update", id, patch: { checked: !item.checked }, at: Date.now() });
    },
    [dispatch, state]
  );

  const updateItem = useCallback(
    (id: string, patch: { name?: string; qty?: string; category?: Category }) => {
      dispatch({ type: "update", id, patch, at: Date.now() });
    },
    [dispatch]
  );

  const removeItem = useCallback((id: string) => dispatch({ type: "remove", id }), [dispatch]);

  const clearChecked = useCallback(() => dispatch({ type: "clearChecked" }), [dispatch]);

  const updateSettings = useCallback(
    (patch: Partial<HouseholdSettings>) => dispatch({ type: "settings", patch }),
    [dispatch]
  );

  return {
    state,
    status,
    hydrated,
    pendingCount: pending.length,
    refresh: pull,
    addItems,
    toggleItem,
    updateItem,
    removeItem,
    clearChecked,
    updateSettings,
  };
}

/** Ask the server for a brand-new list. Returns its code. */
export async function createHousehold(): Promise<HouseholdState> {
  const res = await fetch("/api/grocery", { method: "POST" });
  if (!res.ok) throw new Error("Could not create a list");
  const data = (await res.json()) as { state: HouseholdState };
  return data.state;
}

/** Check that a list with this code exists before joining it. */
export async function lookupHousehold(code: string): Promise<HouseholdState | null> {
  const res = await fetch(`/api/grocery/${encodeURIComponent(code)}`, { cache: "no-store" });
  if (res.status === 404 || res.status === 400) return null;
  if (!res.ok) throw new Error("Could not reach the server");
  const data = (await res.json()) as { state: HouseholdState };
  return data.state;
}
