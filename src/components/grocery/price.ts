import type { SaleMatch } from "@/lib/grocery/flyers";

/** "$1.49 /lb." */
export function formatPrice(m: SaleMatch): string {
  const dollars = m.price < 1 && m.unit === "" ? `${Math.round(m.price * 100)}¢` : `$${m.price.toFixed(2)}`;
  return m.unit ? `${dollars} ${m.unit}` : dollars;
}

export function formatValidTo(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** The cheapest match (the list is already sorted by price). */
export function bestDeal(matches: SaleMatch[]): SaleMatch | null {
  if (!matches.length) return null;
  return matches[0];
}
