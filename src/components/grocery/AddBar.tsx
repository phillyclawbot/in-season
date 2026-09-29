"use client";

import { useState, useRef } from "react";
import { C } from "./theme";

interface AddBarProps {
  onAdd: (text: string) => void;
}

/** The typing bar pinned to the bottom of the list. */
export default function AddBar({ onAdd }: AddBarProps) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const value = text.trim();
    if (!value) return;
    onAdd(value);
    setText("");
    inputRef.current?.focus();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex items-center gap-2 px-4 pt-2"
      style={{
        background: C.cream,
        borderTop: `1px solid ${C.line}`,
        paddingBottom: "max(12px, env(safe-area-inset-bottom))",
      }}
    >
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add something… e.g. 2 lb chicken thighs"
        enterKeyHint="done"
        autoCapitalize="none"
        autoCorrect="on"
        className="flex-1 rounded-2xl px-4 py-3 text-base outline-none select-text"
        style={{ background: C.card, color: C.brown, border: `1.5px solid ${C.line}` }}
      />
      <button
        type="submit"
        disabled={!text.trim()}
        className="w-12 h-12 rounded-2xl text-xl font-extrabold disabled:opacity-40"
        style={{ background: C.brown, color: C.cream }}
        aria-label="Add to list"
      >
        +
      </button>
    </form>
  );
}
