"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, CATEGORY_EMOJI, type Category, type GroceryItem } from "@/lib/grocery/types";
import type { SaleMatch } from "@/lib/grocery/flyers";
import { bestDeal, formatPrice } from "./price";
import { C } from "./theme";

interface ListViewProps {
  items: GroceryItem[];
  salesFor: (item: GroceryItem) => SaleMatch[];
  isLoadingSale: (item: GroceryItem) => boolean;
  salesEnabled: boolean;
  onToggle: (id: string) => void;
  onOpen: (item: GroceryItem) => void;
  onClearChecked: () => void;
}

/** The main list: items grouped by aisle, with the checked-off ones tucked at the bottom. */
export default function ListView({
  items,
  salesFor,
  isLoadingSale,
  salesEnabled,
  onToggle,
  onOpen,
  onClearChecked,
}: ListViewProps) {
  const [showChecked, setShowChecked] = useState(true);

  const { sections, checked } = useMemo(() => {
    const byCat = new Map<Category, GroceryItem[]>();
    const done: GroceryItem[] = [];
    for (const item of items) {
      if (item.checked) {
        done.push(item);
        continue;
      }
      const list = byCat.get(item.category) ?? [];
      list.push(item);
      byCat.set(item.category, list);
    }
    const sections = CATEGORIES.filter((c) => byCat.has(c)).map((c) => ({
      category: c,
      items: (byCat.get(c) ?? []).sort((a, b) => a.createdAt - b.createdAt),
    }));
    done.sort((a, b) => b.updatedAt - a.updatedAt);
    return { sections, checked: done };
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 px-8 pb-16">
        <div className="text-5xl mb-1">🧺</div>
        <p className="text-base font-extrabold text-center" style={{ color: C.brown }}>
          Nothing on the list yet
        </p>
        <p className="text-sm text-center leading-relaxed" style={{ color: C.earth }}>
          Type something below. Try &ldquo;2 lb chicken thighs, milk, bananas&rdquo; to add several at once.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 pb-6">
      {sections.map((section) => (
        <section key={section.category} className="mb-4">
          <h3
            className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest px-1 mb-1.5"
            style={{ color: C.earth }}
          >
            <span className="text-sm">{CATEGORY_EMOJI[section.category]}</span>
            {section.category}
            <span className="font-semibold" style={{ color: C.earthLight }}>
              · {section.items.length}
            </span>
          </h3>
          <ul className="rounded-2xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.line}` }}>
            {section.items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                deal={salesEnabled ? bestDeal(salesFor(item)) : null}
                dealCount={salesEnabled ? salesFor(item).length : 0}
                loading={salesEnabled && isLoadingSale(item)}
                onToggle={() => onToggle(item.id)}
                onOpen={() => onOpen(item)}
              />
            ))}
          </ul>
        </section>
      ))}

      {checked.length > 0 && (
        <section className="mb-4">
          <div className="flex items-center justify-between px-1 mb-1.5">
            <button
              onClick={() => setShowChecked((v) => !v)}
              className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest"
              style={{ color: C.earth }}
            >
              <span className="text-sm">✓</span>
              In the cart
              <span className="font-semibold" style={{ color: C.earthLight }}>
                · {checked.length} {showChecked ? "▾" : "▸"}
              </span>
            </button>
            <button
              onClick={onClearChecked}
              className="text-[11px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: C.accentSoft, color: C.accent }}
            >
              Clear
            </button>
          </div>
          {showChecked && (
            <ul
              className="rounded-2xl overflow-hidden"
              style={{ background: C.card, border: `1px solid ${C.line}`, opacity: 0.7 }}
            >
              {checked.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  deal={null}
                  dealCount={0}
                  loading={false}
                  onToggle={() => onToggle(item.id)}
                  onOpen={() => onOpen(item)}
                />
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

interface ItemRowProps {
  item: GroceryItem;
  deal: SaleMatch | null;
  dealCount: number;
  loading: boolean;
  onToggle: () => void;
  onOpen: () => void;
}

function ItemRow({ item, deal, dealCount, loading, onToggle, onOpen }: ItemRowProps) {
  const initial = item.addedBy ? item.addedBy.trim().charAt(0).toUpperCase() : "";
  return (
    <li className="flex items-stretch" style={{ borderBottom: `1px solid ${C.line}` }}>
      <button
        onClick={onToggle}
        className="flex items-center justify-center pl-4 pr-3"
        aria-label={item.checked ? "Put back on the list" : "Mark as in the cart"}
        aria-pressed={item.checked}
      >
        <span
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold transition-colors"
          style={{
            border: `2px solid ${item.checked ? C.brown : C.earthLight}`,
            background: item.checked ? C.brown : "transparent",
            color: C.cream,
          }}
        >
          {item.checked ? "✓" : ""}
        </span>
      </button>
      <button onClick={onOpen} className="flex-1 flex items-center gap-2 py-3 pr-3 text-left min-w-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 min-w-0">
            <span
              className="text-[15px] font-semibold truncate"
              style={{
                color: C.brown,
                textDecoration: item.checked ? "line-through" : "none",
              }}
            >
              {item.name}
            </span>
            {item.qty && (
              <span className="text-xs font-bold shrink-0" style={{ color: C.earth }}>
                {item.qty}
              </span>
            )}
          </div>
          {deal && (
            <div className="mt-0.5 flex items-center gap-1 text-[11px] font-bold" style={{ color: C.sale }}>
              <span>🏷</span>
              <span className="truncate">
                {formatPrice(deal)} · {deal.store}
                {dealCount > 1 ? ` +${dealCount - 1}` : ""}
              </span>
            </div>
          )}
          {!deal && loading && (
            <div className="mt-0.5 text-[11px] font-semibold" style={{ color: C.earthLight }}>
              checking flyers…
            </div>
          )}
        </div>
        {initial && (
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0"
            style={{ background: C.accentSoft, color: C.accent }}
            title={`Added by ${item.addedBy}`}
          >
            {initial}
          </span>
        )}
      </button>
    </li>
  );
}
