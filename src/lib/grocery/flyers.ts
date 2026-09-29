/**
 * Looks up weekly flyer deals from Flipp, the service most US grocery chains
 * publish their circulars through. This uses the same public endpoints the
 * Flipp website calls; there is no official API, so results are best-effort
 * and the app must degrade gracefully when the lookup fails.
 */

import { isMajorGrocer } from "./stores";

const BASE = "https://backflipp.wishabi.com/flipp";
const USER_AGENT = "Mozilla/5.0 (compatible; InSeasonGroceryList/1.0)";

export interface FlyerStore {
  id: number;
  name: string;
  logo: string | null;
  /** Soonest expiry among this store's current flyers */
  validTo: string | null;
  flyerCount: number;
}

export interface SaleMatch {
  id: string;
  name: string;
  price: number;
  /** e.g. "/lb." or "ea." */
  unit: string;
  /** e.g. "Save $2.00" or "with digital coupon" */
  story: string;
  prefix: string;
  storeId: number;
  store: string;
  storeLogo: string | null;
  validFrom: string | null;
  validTo: string | null;
  image: string | null;
  score: number;
}

interface RawFlyer {
  id: number;
  merchant: string;
  merchant_id: number;
  merchant_logo?: string;
  categories?: string[];
  valid_to?: string;
}

interface RawItem {
  id?: number;
  flyer_item_id?: number;
  item_type?: string;
  name?: string;
  current_price?: number | string | null;
  pre_price_text?: string | null;
  post_price_text?: string | null;
  sale_story?: string | null;
  merchant_id?: number;
  merchant_name?: string;
  merchant_logo?: string;
  valid_from?: string;
  valid_to?: string;
  clipping_image_url?: string;
  clean_image_url?: string;
  score?: number;
}

function isZip(zip: string): boolean {
  return /^\d{5}$/.test(zip);
}

/** Major grocery chains with a current flyer near a zip code. */
export async function fetchStores(zip: string): Promise<FlyerStore[]> {
  if (!isZip(zip)) throw new Error("A 5-digit zip code is required");
  const url = `${BASE}/flyers?locale=en-us&postal_code=${zip}`;
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    next: { revalidate: 60 * 60 * 6 },
  });
  if (!res.ok) throw new Error(`Flyer service responded ${res.status}`);
  const data = (await res.json()) as { flyers?: RawFlyer[] };

  const byStore = new Map<number, FlyerStore>();
  for (const f of data.flyers ?? []) {
    const cats = f.categories ?? [];
    if (!cats.includes("Groceries")) continue;
    if (!isMajorGrocer(f.merchant)) continue;
    const existing = byStore.get(f.merchant_id);
    if (existing) {
      existing.flyerCount += 1;
      if (f.valid_to && (!existing.validTo || f.valid_to < existing.validTo)) existing.validTo = f.valid_to;
    } else {
      byStore.set(f.merchant_id, {
        id: f.merchant_id,
        name: f.merchant.trim(),
        logo: f.merchant_logo ?? null,
        validTo: f.valid_to ?? null,
        flyerCount: 1,
      });
    }
  }
  return [...byStore.values()].sort((a, b) => a.name.localeCompare(b.name));
}

const STOP_WORDS = new Set(["of", "the", "a", "an", "and", "or", "fresh", "organic", "large", "small"]);

/** Words in the search that must appear in a flyer item for it to count as a match. */
function keyTokens(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

function stem(word: string): string {
  if (word.endsWith("ies")) return word.slice(0, -3) + "y";
  if (word.endsWith("es") && word.length > 4) return word.slice(0, -2);
  if (word.endsWith("s") && word.length > 3) return word.slice(0, -1);
  return word;
}

/**
 * Words that turn an ingredient into a different product. If the flyer item
 * has one of these and the shopper didn't ask for it, "banana" vs "banana
 * pudding" is only a loose match.
 */
const PRODUCT_TYPE_WORDS = new Set([
  "pudding", "chips", "chip", "bread", "muffin", "muffins", "cake", "cakes", "pie", "pies", "juice", "soup",
  "soups", "sauce", "flavored", "flavor", "cereal", "bar", "bars", "yogurt", "smoothie", "candy", "cookie",
  "cookies", "cracker", "crackers", "dip", "dressing", "seasoning", "mix", "powder", "extract", "syrup", "jam",
  "jelly", "spread", "noodle", "noodles", "pasta", "salad", "soda", "drink", "drinks", "tea", "coffee", "gum",
  "snack", "snacks", "filling", "frosting", "nuggets", "patties", "sausage", "broth", "stock", "bouillon",
  "wrap", "wraps", "sandwich", "sandwiches", "pizza", "burrito", "burritos", "ice", "cream", "popsicle",
  "popsicles", "sorbet", "gelato", "lotion", "shampoo", "scent", "scented", "candle", "candles", "food",
  "treats", "litter", "toy", "toys", "fries", "dried", "canned", "roasted", "fried", "breaded", "stuffed",
  "seeds", "oil", "vinegar", "wine", "beer", "liqueur", "vodka", "rum",
]);

function looseMatch(itemName: string, tokens: string[]): boolean {
  const words = itemName
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
  const asked = new Set(tokens.map(stem));
  return words.some((w) => PRODUCT_TYPE_WORDS.has(w) && !asked.has(stem(w)));
}

/** "lb with weis preferred SHOPPERS CLUB" -> "lb"; "/lb. DIGITAL COUPON" -> "/lb." */
function cleanUnit(text: string): string {
  const cut = text.split(/\b(?:with|when|w\/|digital|limit|must|save|reg|regular|or)\b/i)[0].trim();
  return cut.length > 14 ? cut.slice(0, 14).trim() : cut;
}

function textMatches(itemName: string, tokens: string[]): boolean {
  const hay = itemName.toLowerCase();
  const hayStems = hay
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .map(stem);
  // Every important word in the query has to show up in the flyer item,
  // so "chicken thighs" doesn't match "chicken noodle soup".
  return tokens.every((t) => {
    const s = stem(t);
    return hay.includes(t) || hayStems.some((h) => h === s || h.startsWith(s));
  });
}

/**
 * Flyer deals for one grocery item near a zip code. Only deals that
 *  - come from a major grocery chain,
 *  - mention every word of the item (so "chicken thighs" never returns soup), and
 *  - list an actual price
 * are returned, so each one can be compared or price-matched.
 */
export async function searchSales(zip: string, query: string): Promise<SaleMatch[]> {
  if (!isZip(zip)) throw new Error("A 5-digit zip code is required");
  const q = query.trim().slice(0, 80);
  if (!q) return [];
  const url = `${BASE}/items/search?locale=en-us&postal_code=${zip}&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    next: { revalidate: 60 * 60 },
  });
  if (!res.ok) throw new Error(`Flyer service responded ${res.status}`);
  const data = (await res.json()) as { items?: RawItem[] };

  const tokens = keyTokens(q);
  const now = Date.now();
  const raw = (data.items ?? []).filter(
    (it) =>
      (!it.item_type || it.item_type === "flyer") &&
      it.name &&
      it.merchant_name &&
      typeof it.merchant_id === "number" &&
      isMajorGrocer(it.merchant_name) &&
      !(it.valid_to && Date.parse(it.valid_to) < now)
  );

  const kept = raw.filter((it) => textMatches(it.name!, tokens) && !looseMatch(it.name!, tokens));

  const matches: SaleMatch[] = [];
  const seen = new Set<string>();
  for (const it of kept) {

    const rawPrice = it.current_price;
    const price =
      typeof rawPrice === "number"
        ? rawPrice
        : typeof rawPrice === "string" && rawPrice.trim() !== ""
        ? Number(rawPrice)
        : null;

    if (price === null || !Number.isFinite(price) || price <= 0) continue; // nothing to price-match

    // The same deal often appears in two flyers from one store (weekly + digital).
    const dedupeKey = `${it.merchant_id}|${it.name!.trim().toLowerCase()}|${price}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    matches.push({
      id: String(it.flyer_item_id ?? it.id ?? `${it.merchant_id}-${it.name}`),
      name: it.name!.trim(),
      price,
      unit: cleanUnit(it.post_price_text ?? ""),
      story: (it.sale_story ?? "").trim(),
      prefix: (it.pre_price_text ?? "").trim(),
      storeId: it.merchant_id!,
      store: it.merchant_name!.trim(),
      storeLogo: it.merchant_logo ?? null,
      validFrom: it.valid_from ?? null,
      validTo: it.valid_to ?? null,
      image: it.clipping_image_url ?? it.clean_image_url ?? null,
      score: typeof it.score === "number" ? it.score : 0,
    });
  }

  // Best relevance first; the phone re-sorts by price.
  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, 60);
}
