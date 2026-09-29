"use client";

import { useMemo } from "react";
import type { GroceryItem } from "@/lib/grocery/types";
import type { SaleMatch } from "@/lib/grocery/flyers";
import { formatPrice, formatValidTo } from "./price";
import { C } from "./theme";

interface DealsViewProps {
  items: GroceryItem[];
  zip: string;
  storeNames: Record<string, string>;
  salesFor: (item: GroceryItem) => SaleMatch[];
  anyLoading: boolean;
  error: string | null;
  onOpenSettings: () => void;
  onOpenItem: (item: GroceryItem) => void;
  onRefresh: () => void;
}

interface StoreGroup {
  storeId: number;
  store: string;
  deals: { item: GroceryItem; match: SaleMatch }[];
}

/** Everything on the list that's on sale this week, grouped by store so you can plan the trip. */
export default function DealsView({
  items,
  zip,
  storeNames,
  salesFor,
  anyLoading,
  error,
  onOpenSettings,
  onOpenItem,
  onRefresh,
}: DealsViewProps) {
  const open = useMemo(() => items.filter((i) => !i.checked), [items]);

  const { groups, onSaleCount } = useMemo(() => {
    const byStore = new Map<number, StoreGroup>();
    const onSale = new Set<string>();
    for (const item of open) {
      const matches = salesFor(item);
      if (!matches.length) continue;
      onSale.add(item.id);
      // Best deal per store for this item
      const seen = new Set<number>();
      for (const m of matches) {
        if (seen.has(m.storeId)) continue;
        seen.add(m.storeId);
        const g = byStore.get(m.storeId) ?? { storeId: m.storeId, store: m.store, deals: [] };
        g.deals.push({ item, match: m });
        byStore.set(m.storeId, g);
      }
    }
    const groups = [...byStore.values()].sort((a, b) => b.deals.length - a.deals.length);
    return { groups, onSaleCount: onSale.size };
  }, [open, salesFor]);

  if (!/^\d{5}$/.test(zip)) {
    return (
      <Empty
        emoji="📍"
        title="Where do you shop?"
        subtitle="Add your zip code so we can pull the weekly flyers for stores near you."
        action={{ label: "Set zip code", onClick: onOpenSettings }}
      />
    );
  }

  if (open.length === 0) {
    return <Empty emoji="🧺" title="List is empty" subtitle="Add a few things and we'll check the flyers for deals." />;
  }

  const storeCount = Object.keys(storeNames).length;

  return (
    <div className="px-4 pb-6">
      <div className="flex items-center justify-between px-1 mb-3">
        <div>
          <p className="text-sm font-extrabold" style={{ color: C.brown }}>
            {onSaleCount} of {open.length} {open.length === 1 ? "item" : "items"} on sale
          </p>
          <p className="text-[11px] font-semibold" style={{ color: C.earthLight }}>
            {storeCount > 0 ? `at your ${storeCount} ${storeCount === 1 ? "store" : "stores"}` : `any store near ${zip}`}
            {anyLoading ? " · checking…" : ""}
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="text-[11px] font-bold px-2.5 py-1 rounded-full"
          style={{ background: C.accentSoft, color: C.accent }}
        >
          Refresh
        </button>
      </div>

      {error && (
        <p className="text-xs font-semibold px-1 mb-3" style={{ color: C.danger }}>
          {error}
        </p>
      )}

      {storeCount === 0 && (
        <button
          onClick={onOpenSettings}
          className="w-full text-left rounded-2xl px-4 py-3 mb-3 text-xs font-semibold"
          style={{ background: C.accentSoft, color: C.accent }}
        >
          Showing every store near {zip}. Tap to pick just the ones you shop at →
        </button>
      )}

      {groups.length === 0 && !anyLoading && (
        <Empty emoji="🤷" title="No deals this week" subtitle="None of your items have a listed sale price in the big grocery chains' flyers right now. New flyers usually drop Wednesday or Sunday." />
      )}

      {groups.map((g) => (
        <section key={g.storeId} className="mb-4">
          <h3 className="flex items-center gap-2 px-1 mb-1.5">
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold"
              style={{ background: C.saleSoft, color: C.sale }}
            >
              {g.store.charAt(0)}
            </span>
            <span className="text-[13px] font-extrabold" style={{ color: C.brown }}>
              {g.store}
            </span>
            <span className="text-[11px] font-semibold" style={{ color: C.earthLight }}>
              · {g.deals.length}
            </span>
          </h3>
          <ul className="rounded-2xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.line}` }}>
            {g.deals.map(({ item, match }) => (
              <li key={item.id} style={{ borderBottom: `1px solid ${C.line}` }}>
                <button onClick={() => onOpenItem(item)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-semibold truncate" style={{ color: C.brown }}>
                      {item.name}
                    </div>
                    <div className="text-[11px] truncate" style={{ color: C.earth }}>
                      {match.name}
                      {match.story ? ` · ${match.story}` : ""}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-extrabold" style={{ color: C.sale }}>
                      {formatPrice(match)}
                    </div>
                    {match.validTo && (
                      <div className="text-[10px] font-semibold" style={{ color: C.earthLight }}>
                        thru {formatValidTo(match.validTo)}
                      </div>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function Empty({
  emoji,
  title,
  subtitle,
  action,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 px-8 pb-16 pt-10">
      <div className="text-5xl mb-1">{emoji}</div>
      <p className="text-base font-extrabold text-center" style={{ color: C.brown }}>
        {title}
      </p>
      <p className="text-sm text-center leading-relaxed" style={{ color: C.earth }}>
        {subtitle}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 rounded-2xl px-5 py-2.5 text-sm font-extrabold"
          style={{ background: C.brown, color: C.cream }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
