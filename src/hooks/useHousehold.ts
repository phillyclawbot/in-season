"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

/**
 * Remembers which shared list this phone belongs to and what to call its owner.
 * Stored on the phone only; the list itself lives on the server.
 */

const STORAGE_KEY = "grocery-household";
const CHANGE_EVENT = "grocery-household-change";

export interface HouseholdProfile {
  code: string | null;
  name: string;
}

function readRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function parse(raw: string | null): HouseholdProfile {
  if (!raw) return { code: null, name: "" };
  try {
    const parsed = JSON.parse(raw) as Partial<HouseholdProfile>;
    return {
      code: typeof parsed.code === "string" ? parsed.code : null,
      name: typeof parsed.name === "string" ? parsed.name : "",
    };
  } catch {
    return { code: null, name: "" };
  }
}

export function useHousehold() {
  // On the server (and during the very first paint) we don't know the phone's
  // saved profile yet, so `loaded` stays false until the browser takes over.
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  const loaded = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const profile = useMemo(() => parse(raw), [raw]);

  const save = useCallback((next: HouseholdProfile) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const setName = useCallback(
    (name: string) => save({ ...parse(readRaw()), name: name.trim().slice(0, 40) }),
    [save]
  );

  const setCode = useCallback((code: string | null) => save({ ...parse(readRaw()), code }), [save]);

  const leave = useCallback(() => save({ ...parse(readRaw()), code: null }), [save]);

  return { profile, loaded, setName, setCode, leave };
}
