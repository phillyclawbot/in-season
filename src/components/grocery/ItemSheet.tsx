"use client";

import { useState } from "react";
import { CATEGORIES, CATEGORY_EMOJI, type Category, type GroceryItem } from "@/lib/grocery/types";
import type { SaleMatch } from "@/lib/grocery/flyers";
import Sheet from "./Sheet";
import { formatPrice, formatValidTo } from "./price";
import { C } from "./theme";

interface ItemSheetProps {
  item: GroceryItem | null;
  matches: SaleMatch[];
  loading: boolean;
  salesEnabled: boolean;
  onClose: () => void;
  onUpdate: (id: string, patch: { name?: string; qty?: string; category?: Category }) => void;
  onRemove: (id: string) => void;
}

/** Tap an item to fix its name, amount or aisle, remove it, or see every deal for it. */
export default function ItemSheet({ item, matches, loading, salesEnabled, onClose, onUpdate, onRemove }: ItemSheetProps) {
  return (
    <Sheet open={item !== null} onClose={onClose} title={item?.name ?? ""}>
      {item && (
        <>
          {/* Keyed by id so the text fields start fresh whenever a different item is opened */}
          <NameAndQty key={item.id} item={item} onUpdate={onUpdate} />

          <label className="block text-xs font-bold uppercase tracking-wide mt-4 mb-1.5" style={{ color: C.earth }}>
            Aisle
          </label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => {
              const on = c === item.category;
              return (
                <button
                  key={c}
                  onClick={() => !on && onUpdate(item.id, { category: c })}
                  className="px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{
                    background: on ? C.brown : C.card,
                    color: on ? C.cream : C.earth,
                    border: `1.5px solid ${on ? C.brown : C.line}`,
                  }}
                  aria-pressed={on}
                >
                  {CATEGORY_EMOJI[c]} {c}
                </button>
              );
            })}
          </div>

          {salesEnabled && (
            <>
              <label className="block text-xs font-bold uppercase tracking-wide mt-5 mb-1.5" style={{ color: C.earth }}>
                In this week&apos;s flyers
              </label>
              {loading && matches.length === 0 && (
                <p className="text-sm" style={{ color: C.earthLight }}>
                  Checking flyers…
                </p>
              )}
              {!loading && matches.length === 0 && (
                <p className="text-sm" style={{ color: C.earthLight }}>
                  Not on sale at your stores this week.
                </p>
              )}
              {matches.length > 0 && (
                <ul className="rounded-2xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.line}` }}>
                  {matches.map((m) => (
                    <li key={m.id} className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: `1px solid ${C.line}` }}>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold truncate" style={{ color: C.brown }}>
                          {m.name}
                        </div>
                        <div className="text-[11px] truncate" style={{ color: C.earth }}>
                          {m.store}
                          {m.story ? ` · ${m.story}` : ""}
                          {m.validTo ? ` · thru ${formatValidTo(m.validTo)}` : ""}
                        </div>
                      </div>
                      <div className="text-sm font-extrabold shrink-0" style={{ color: C.sale }}>
                        {formatPrice(m)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          <div className="mt-5 mb-2 flex items-center justify-between text-[11px]" style={{ color: C.earthLight }}>
            <span>{item.addedBy ? `Added by ${item.addedBy}` : ""}</span>
            <button
              onClick={() => {
                onRemove(item.id);
                onClose();
              }}
              className="font-bold px-3 py-1.5 rounded-full"
              style={{ color: C.danger, background: C.card, border: `1.5px solid ${C.line}` }}
            >
              Remove from list
            </button>
          </div>
        </>
      )}
    </Sheet>
  );
}

function NameAndQty({
  item,
  onUpdate,
}: {
  item: GroceryItem;
  onUpdate: (id: string, patch: { name?: string; qty?: string }) => void;
}) {
  const [name, setName] = useState(item.name);
  const [qty, setQty] = useState(item.qty);

  const saveText = () => {
    const patch: { name?: string; qty?: string } = {};
    if (name.trim() && name.trim() !== item.name) patch.name = name.trim();
    if (qty.trim() !== item.qty) patch.qty = qty.trim();
    if (Object.keys(patch).length) onUpdate(item.id, patch);
  };

  return (
    <div className="flex gap-2 mt-1">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={saveText}
        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
        maxLength={120}
        aria-label="Item name"
        className="flex-1 min-w-0 rounded-2xl px-4 py-3 text-base font-semibold outline-none select-text"
        style={{ background: C.card, color: C.brown, border: `1.5px solid ${C.line}` }}
      />
      <input
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        onBlur={saveText}
        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
        maxLength={40}
        placeholder="qty"
        aria-label="Amount"
        className="w-24 rounded-2xl px-3 py-3 text-base font-semibold outline-none text-center select-text"
        style={{ background: C.card, color: C.brown, border: `1.5px solid ${C.line}` }}
      />
    </div>
  );
}
