"use client";

import { useState } from "react";
import Link from "next/link";
import { C } from "./theme";

interface WelcomeScreenProps {
  initialName: string;
  initialCode?: string;
  onCreate: (name: string) => Promise<void>;
  onJoin: (name: string, code: string) => Promise<void>;
}

/** First-run screen: say who you are, then start a list or join your partner's. */
export default function WelcomeScreen({ initialName, initialCode = "", onCreate, onJoin }: WelcomeScreenProps) {
  const [name, setName] = useState(initialName);
  const [code, setCode] = useState(initialCode);
  const [mode, setMode] = useState<"pick" | "join">(initialCode ? "join" : "pick");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameOk = name.trim().length > 0;

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main
      className="flex flex-col h-dvh px-6 overflow-y-auto"
      style={{ background: C.cream, paddingTop: "max(24px, env(safe-area-inset-top))" }}
    >
      <div className="flex items-center justify-between">
        <Link href="/" className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.earth }}>
          ← Fruits
        </Link>
      </div>

      <div className="mt-10 mb-8">
        <div className="text-5xl mb-3">🛒</div>
        <h1 className="text-3xl font-extrabold" style={{ color: C.brown }}>
          Our grocery list
        </h1>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: C.earth }}>
          One list on both your phones. Items sort themselves by aisle, and we check the
          weekly flyers to tell you what&apos;s on sale nearby.
        </p>
      </div>

      <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: C.earth }}>
        Your name
      </label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Sam"
        maxLength={40}
        autoComplete="given-name"
        className="w-full rounded-2xl px-4 py-3 text-base font-semibold outline-none select-text"
        style={{ background: C.card, color: C.brown, border: `1.5px solid ${C.line}` }}
      />

      {mode === "pick" ? (
        <div className="mt-6 flex flex-col gap-3">
          <button
            disabled={!nameOk || busy}
            onClick={() => run(() => onCreate(name.trim()))}
            className="w-full rounded-2xl py-3.5 text-base font-extrabold disabled:opacity-40"
            style={{ background: C.brown, color: C.cream }}
          >
            {busy ? "Setting up…" : "Start a new list"}
          </button>
          <button
            disabled={!nameOk || busy}
            onClick={() => setMode("join")}
            className="w-full rounded-2xl py-3.5 text-base font-extrabold disabled:opacity-40"
            style={{ background: C.accentSoft, color: C.accent }}
          >
            Join my partner&apos;s list
          </button>
        </div>
      ) : (
        <div className="mt-6">
          <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: C.earth }}>
            List code
          </label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="6 letters, e.g. K7PQ2M"
            maxLength={8}
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            className="w-full rounded-2xl px-4 py-3 text-xl font-extrabold tracking-[0.3em] outline-none select-text"
            style={{ background: C.card, color: C.brown, border: `1.5px solid ${C.line}` }}
          />
          <p className="mt-2 text-xs" style={{ color: C.earthLight }}>
            Your partner can find this under Settings on their phone.
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <button
              disabled={!nameOk || code.replace(/[^A-Z0-9]/g, "").length < 6 || busy}
              onClick={() => run(() => onJoin(name.trim(), code))}
              className="w-full rounded-2xl py-3.5 text-base font-extrabold disabled:opacity-40"
              style={{ background: C.brown, color: C.cream }}
            >
              {busy ? "Joining…" : "Join list"}
            </button>
            <button
              disabled={busy}
              onClick={() => setMode("pick")}
              className="w-full rounded-2xl py-3 text-sm font-bold"
              style={{ color: C.earth }}
            >
              Back
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm font-semibold text-center" style={{ color: C.danger }}>
          {error}
        </p>
      )}
      <div className="h-10" />
    </main>
  );
}
