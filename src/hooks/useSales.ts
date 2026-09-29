"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { normalizeName } from "@/lib/grocery/categorize";
import type { GroceryItem } from "@/lib/grocery/types";
import type { SaleMatch } from "@/lib/grocery/flyers";

/**
 * Checks each item on the list against the local weekly flyers.
 * Results are cached on the phone for an hour so scrolling the list
 * doesn't hammer the flyer service, and lookups run two at a time.
 */

const CACHE_KEY = "grocery-sales-cache";
const CACHE_TTL_MS = 60 * 60 * 1000;
const CACHE_MAX = 300;
const CONCURRENCY = 2;

interface CacheEntry {
  at: number;
  matches: SaleMatch[];
}

type CacheMap = Record<string, CacheEntry>;

let memoryCache: CacheMap | null = null;

function loadCache(): CacheMap {
  if (memoryCache) return memoryCache;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    memoryCache = raw ? (JSON.parse(raw) as CacheMap) : {};
  } catch {
    memoryCache = {};
  }
  return memoryCache;
}

function saveCache(cache: CacheMap) {
  memoryCache = cache;
  try {
    const keys = Object.keys(cache);
    if (keys.length > CACHE_MAX) {
      keys
        .sort((a, b) => cache[a].at - cache[b].at)
        .slice(0, keys.length - CACHE_MAX)
        .forEach((k) => delete cache[k]);
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

/** What we actually search the flyers for: the item name without brand-ish noise. */
export function saleQueryFor(item: GroceryItem): string {
  return normalizeName(item.name).replace(/\b(organic|fresh|large|small|medium)\b/g, "").replace(/\s+/g, " ").trim();
}

function cacheKey(zip: string, query: string) {
  return `${zip}|${query}`;
}

export function useSales(items: GroceryItem[], zip: string, storeIds: number[], enabled: boolean) {
  const [results, setResults] = useState<Record<string, SaleMatch[]>>({});
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const inFlight = useRef<Set<string>>(new Set());
  const zipOk = /^\d{5}$/.test(zip);

  // Which items still need a lookup (unchecked, not cached, not already running)
  const wanted = useMemo(() => {
    if (!enabled || !zipOk) return [] as { query: string; key: string }[];
    const seen = new Set<string>();
    const out: { query: string; key: string }[] = [];
    for (const item of items) {
      if (item.checked) continue;
      const query = saleQueryFor(item);
      if (!query) continue;
      const key = cacheKey(zip, query);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ query, key });
    }
    return out;
  }, [items, zip, zipOk, enabled]);

  useEffect(() => {
    if (!enabled || !zipOk) return;
    let cancelled = false; // stops workers picking up new jobs after the list changes
    const cache = loadCache();
    const now = Date.now();

    // Serve whatever is fresh in the cache right away.
    const fresh: Record<string, SaleMatch[]> = {};
    const todo: { query: string; key: string }[] = [];
    for (const w of wanted) {
      const hit = cache[w.key];
      if (hit && now - hit.at < CACHE_TTL_MS) {
        fresh[w.key] = hit.matches;
      } else if (!inFlight.current.has(w.key)) {
        todo.push(w);
      }
    }
    if (Object.keys(fresh).length) setResults((prev) => ({ ...prev, ...fresh }));
    if (todo.length === 0) return;

    setLoading((prev) => {
      const next = new Set(prev);
      todo.forEach((t) => next.add(t.key));
      return next;
    });

    let index = 0;
    const worker = async () => {
      while (!cancelled && index < todo.length) {
        const job = todo[index++];
        inFlight.current.add(job.key);
        try {
          const res = await fetch(`/api/sales?zip=${zip}&q=${encodeURIComponent(job.query)}`);
          if (!res.ok) throw new Error(`Server responded ${res.status}`);
          const data = (await res.json()) as { matches: SaleMatch[] };
          const matches = Array.isArray(data.matches) ? data.matches : [];
          const c = loadCache();
          c[job.key] = { at: Date.now(), matches };
          saveCache(c);
          // Even if the list changed while this was running, the answer is still
          // valid for this item, so always record it.
          setResults((prev) => ({ ...prev, [job.key]: matches }));
          setError(null);
        } catch {
          setError("Couldn't check the flyers right now");
        } finally {
          inFlight.current.delete(job.key);
          setLoading((prev) => {
            const next = new Set(prev);
            next.delete(job.key);
            return next;
          });
        }
      }
    };
    const workers = Array.from({ length: Math.min(CONCURRENCY, todo.length) }, worker);
    void Promise.all(workers);

    return () => {
      cancelled = true;
    };
  }, [wanted, zip, zipOk, enabled, refreshNonce]);

  const storeFilter = useMemo(() => new Set(storeIds), [storeIds]);

  /** Deals for one item, limited to the household's chosen stores (or any store if none chosen). */
  const salesFor = useCallback(
    (item: GroceryItem): SaleMatch[] => {
      if (!zipOk) return [];
      const key = cacheKey(zip, saleQueryFor(item));
      const all = results[key] ?? [];
      const filtered = storeFilter.size ? all.filter((m) => storeFilter.has(m.storeId)) : all;
      return [...filtered].sort((a, b) => a.price - b.price || b.score - a.score);
    },
    [results, zip, zipOk, storeFilter]
  );

  const isLoading = useCallback(
    (item: GroceryItem) => zipOk && loading.has(cacheKey(zip, saleQueryFor(item))),
    [loading, zip, zipOk]
  );

  const refresh = useCallback(() => {
    // Wipe the cache for this zip so everything is looked up again.
    const cache = loadCache();
    for (const key of Object.keys(cache)) if (key.startsWith(`${zip}|`)) delete cache[key];
    saveCache(cache);
    setResults({});
    setRefreshNonce((n) => n + 1);
  }, [zip]);

  return { salesFor, isLoading, anyLoading: loading.size > 0, error, refresh };
}
