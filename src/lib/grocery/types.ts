/**
 * Shared types for the household grocery list.
 * These are used on both the phone (client) and the server so that the
 * same "apply a change" logic runs in both places.
 */

export const CATEGORIES = [
  "Produce",
  "Bakery",
  "Deli",
  "Meat & Seafood",
  "Dairy & Eggs",
  "Frozen",
  "Pantry",
  "Snacks",
  "Beverages",
  "Household",
  "Personal Care",
  "Baby & Pets",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_EMOJI: Record<Category, string> = {
  Produce: "🥬",
  Bakery: "🥖",
  Deli: "🧀",
  "Meat & Seafood": "🍗",
  "Dairy & Eggs": "🥛",
  Frozen: "🧊",
  Pantry: "🥫",
  Snacks: "🍿",
  Beverages: "🧃",
  Household: "🧻",
  "Personal Care": "🧴",
  "Baby & Pets": "🐾",
  Other: "🛒",
};

export interface GroceryItem {
  id: string;
  /** What to buy, e.g. "chicken thighs" */
  name: string;
  /** Free-text amount, e.g. "2 lb" or "3" */
  qty: string;
  category: Category;
  /** True once someone has put it in the cart */
  checked: boolean;
  /** Display name of whoever added it */
  addedBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface HouseholdSettings {
  /** US zip code used to look up local flyers */
  zip: string;
  /** Flyer merchant ids the household shops at. Empty = any store. */
  storeIds: number[];
  /** Merchant names, kept alongside ids so the UI can show them without a lookup */
  storeNames: Record<string, string>;
}

export interface HouseholdState {
  code: string;
  /** Bumps on every change; lets phones tell whether anything is new */
  version: number;
  items: GroceryItem[];
  settings: HouseholdSettings;
  createdAt: number;
  updatedAt: number;
}

/** A single change to the list. Phones queue these and the server applies them. */
export type Op =
  | { type: "add"; item: GroceryItem }
  | {
      type: "update";
      id: string;
      patch: Partial<Pick<GroceryItem, "name" | "qty" | "category" | "checked">>;
      at: number;
    }
  | { type: "remove"; id: string }
  | { type: "clearChecked" }
  | { type: "settings"; patch: Partial<HouseholdSettings> };

export const DEFAULT_SETTINGS: HouseholdSettings = {
  zip: "",
  storeIds: [],
  storeNames: {},
};

export function isCategory(value: unknown): value is Category {
  return typeof value === "string" && (CATEGORIES as readonly string[]).includes(value);
}
