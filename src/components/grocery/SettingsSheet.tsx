"use client";

import { useEffect, useState } from "react";
import type { HouseholdSettings } from "@/lib/grocery/types";
import type { FlyerStore } from "@/lib/grocery/flyers";
import Sheet from "./Sheet";
import { C } from "./theme";

interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
  code: string;
  name: string;
  settings: HouseholdSettings;
  onChangeName: (name: string) => void;
  onChangeSettings: (patch: Partial<HouseholdSettings>) => void;
  onLeave: () => void;
}

/** Your name, the invite code, your zip, and which stores' flyers to check. */
export default function SettingsSheet({
  open,
  onClose,
  code,
  name,
  settings,
  onChangeName,
  onChangeSettings,
  onLeave,
}: SettingsSheetProps) {
  // Stores are remembered together with the zip they were fetched for, so a
  // stale list is never shown for a different zip.
  const [storesResult, setStoresResult] = useState<{ zip: string; stores: FlyerStore[] | null; error: string | null }>({
    zip: "",
    stores: null,
    error: null,
  });
  const [copied, setCopied] = useState(false);
  const zipOk = /^\d{5}$/.test(settings.zip);

  // Load the stores that publish flyers for this zip.
  useEffect(() => {
    if (!open || !zipOk) return;
    let cancelled = false;
    fetch(`/api/flyers?zip=${settings.zip}`)
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Could not load stores");
        return (await res.json()) as { stores: FlyerStore[] };
      })
      .then((data) => {
        if (!cancelled) setStoresResult({ zip: settings.zip, stores: data.stores, error: null });
      })
      .catch((err) => {
        if (!cancelled) {
          setStoresResult({
            zip: settings.zip,
            stores: null,
            error: err instanceof Error ? err.message : "Could not load stores",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open, zipOk, settings.zip]);

  const stores = storesResult.zip === settings.zip ? storesResult.stores : null;
  const storesError = storesResult.zip === settings.zip ? storesResult.error : null;
  const loadingStores = zipOk && storesResult.zip !== settings.zip;

  const commitZip = (draft: string) => {
    const zip = draft.replace(/\D/g, "").slice(0, 5);
    if (zip !== settings.zip && (zip.length === 5 || zip.length === 0)) {
      onChangeSettings({ zip, storeIds: [], storeNames: {} });
    }
  };

  const toggleStore = (store: FlyerStore) => {
    const ids = new Set(settings.storeIds);
    const names = { ...settings.storeNames };
    if (ids.has(store.id)) {
      ids.delete(store.id);
      delete names[String(store.id)];
    } else {
      ids.add(store.id);
      names[String(store.id)] = store.name;
    }
    onChangeSettings({ storeIds: [...ids], storeNames: names });
  };

  const inviteLink =
    typeof window !== "undefined" ? `${window.location.origin}/grocery?join=${code}` : `/grocery?join=${code}`;

  const share = async () => {
    const text = `Join our grocery list! Code: ${code}\n${inviteLink}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Our grocery list", text, url: inviteLink });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <Sheet open={open} onClose={onClose} title="Settings">
      <Section label="Your name">
        <TextField
          key={name}
          initial={name}
          maxLength={40}
          onCommit={(value) => value.trim() && value.trim() !== name && onChangeName(value)}
        />
      </Section>

      <Section label="Share this list" hint="Your partner enters this code (or opens the link) to join.">
        <div className="flex items-center gap-2">
          <div
            className="flex-1 rounded-2xl px-4 py-3 text-xl font-extrabold tracking-[0.3em] text-center select-text"
            style={{ background: C.card, color: C.brown, border: `1.5px solid ${C.line}` }}
          >
            {code}
          </div>
          <button
            onClick={share}
            className="rounded-2xl px-4 py-3 text-sm font-extrabold"
            style={{ background: C.brown, color: C.cream }}
          >
            {copied ? "Copied!" : "Share"}
          </button>
        </div>
      </Section>

      <Section label="Zip code" hint="Used to find the weekly flyers near you. Shared with your partner.">
        <TextField
          key={settings.zip}
          initial={settings.zip}
          maxLength={5}
          numeric
          placeholder="e.g. 19103"
          onCommit={commitZip}
        />
      </Section>

      <Section
        label="Your stores"
        hint={
          settings.storeIds.length
            ? "Only these stores' flyers count as deals."
            : "Pick the chains you actually shop at. Until you do, deals from every major grocery chain nearby are shown."
        }
      >
        {!zipOk && (
          <p className="text-sm" style={{ color: C.earthLight }}>
            Enter a zip code first.
          </p>
        )}
        {loadingStores && (
          <p className="text-sm" style={{ color: C.earthLight }}>
            Finding stores…
          </p>
        )}
        {storesError && (
          <p className="text-sm font-semibold" style={{ color: C.danger }}>
            {storesError}
          </p>
        )}
        {stores && stores.length === 0 && (
          <p className="text-sm" style={{ color: C.earthLight }}>
            No major grocery chain flyers found for this zip.
          </p>
        )}
        {stores && stores.length > 0 && (
          <ul className="rounded-2xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.line}` }}>
            {stores.map((store) => {
              const on = settings.storeIds.includes(store.id);
              return (
                <li key={store.id} style={{ borderBottom: `1px solid ${C.line}` }}>
                  <button
                    onClick={() => toggleStore(store)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left"
                    aria-pressed={on}
                  >
                    <span
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-extrabold"
                      style={{
                        border: `2px solid ${on ? C.sale : C.earthLight}`,
                        background: on ? C.sale : "transparent",
                        color: "#fff",
                      }}
                    >
                      {on ? "✓" : ""}
                    </span>
                    <span className="flex-1 text-[15px] font-semibold" style={{ color: C.brown }}>
                      {store.name}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <div className="mt-6 mb-2">
        <button
          onClick={onLeave}
          className="w-full rounded-2xl py-3 text-sm font-bold"
          style={{ background: C.card, color: C.danger, border: `1.5px solid ${C.line}` }}
        >
          Leave this list on this phone
        </button>
        <p className="mt-2 text-[11px] text-center" style={{ color: C.earthLight }}>
          The list stays on the server; you can rejoin with the code.
        </p>
      </div>
    </Sheet>
  );
}

function Section({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: C.earth }}>
        {label}
      </label>
      {children}
      {hint && (
        <p className="mt-1.5 text-[11px] leading-relaxed" style={{ color: C.earthLight }}>
          {hint}
        </p>
      )}
    </div>
  );
}

/** A text box that keeps its own draft and hands the value back when you leave it. */
function TextField({
  initial,
  maxLength,
  numeric,
  placeholder,
  onCommit,
}: {
  initial: string;
  maxLength: number;
  numeric?: boolean;
  placeholder?: string;
  onCommit: (value: string) => void;
}) {
  const [draft, setDraft] = useState(initial);
  return (
    <input
      value={draft}
      onChange={(e) => setDraft(numeric ? e.target.value.replace(/\D/g, "").slice(0, maxLength) : e.target.value)}
      onBlur={() => onCommit(draft)}
      onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
      maxLength={maxLength}
      inputMode={numeric ? "numeric" : undefined}
      pattern={numeric ? "[0-9]*" : undefined}
      placeholder={placeholder}
      className="w-full rounded-2xl px-4 py-3 text-base font-semibold outline-none select-text"
      style={{ background: C.card, color: C.brown, border: `1.5px solid ${C.line}` }}
    />
  );
}
