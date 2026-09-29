import type { GroceryItem, HouseholdState, Op } from "./types";
import { isCategory } from "./types";

/**
 * Apply a batch of changes to a household state and return the new state.
 * Pure function: never mutates its input. Runs identically on phone and server
 * so that optimistic updates on the phone match what the server will produce.
 *
 * Conflict rule: "last write wins" per item, judged by the change's timestamp.
 * If two phones edit the same item, the later edit sticks.
 */
export function applyOps(state: HouseholdState, ops: Op[]): HouseholdState {
  let items = state.items;
  let settings = state.settings;
  let changed = false;

  for (const op of ops) {
    switch (op.type) {
      case "add": {
        if (!isValidItem(op.item)) break;
        if (items.some((i) => i.id === op.item.id)) break; // already there (retry)
        items = [...items, sanitizeItem(op.item)];
        changed = true;
        break;
      }
      case "update": {
        const idx = items.findIndex((i) => i.id === op.id);
        if (idx === -1) break;
        const current = items[idx];
        if (typeof op.at !== "number" || op.at < current.updatedAt) break; // stale edit
        const next: GroceryItem = { ...current, updatedAt: op.at };
        if (typeof op.patch.name === "string" && op.patch.name.trim()) {
          next.name = op.patch.name.trim().slice(0, 120);
        }
        if (typeof op.patch.qty === "string") next.qty = op.patch.qty.trim().slice(0, 40);
        if (isCategory(op.patch.category)) next.category = op.patch.category;
        if (typeof op.patch.checked === "boolean") next.checked = op.patch.checked;
        items = [...items.slice(0, idx), next, ...items.slice(idx + 1)];
        changed = true;
        break;
      }
      case "remove": {
        const before = items.length;
        items = items.filter((i) => i.id !== op.id);
        if (items.length !== before) changed = true;
        break;
      }
      case "clearChecked": {
        const before = items.length;
        items = items.filter((i) => !i.checked);
        if (items.length !== before) changed = true;
        break;
      }
      case "settings": {
        const patch = op.patch ?? {};
        const next = { ...settings };
        if (typeof patch.zip === "string") next.zip = patch.zip.replace(/\D/g, "").slice(0, 5);
        if (Array.isArray(patch.storeIds)) {
          next.storeIds = patch.storeIds
            .filter((n): n is number => typeof n === "number" && Number.isFinite(n))
            .slice(0, 50);
        }
        if (patch.storeNames && typeof patch.storeNames === "object") {
          const names: Record<string, string> = {};
          for (const [k, v] of Object.entries(patch.storeNames)) {
            if (typeof v === "string") names[k] = v.slice(0, 80);
          }
          next.storeNames = names;
        }
        settings = next;
        changed = true;
        break;
      }
    }
  }

  if (!changed) return state;
  return {
    ...state,
    items,
    settings,
    version: state.version + 1,
    updatedAt: Date.now(),
  };
}

function isValidItem(item: unknown): item is GroceryItem {
  if (!item || typeof item !== "object") return false;
  const i = item as Record<string, unknown>;
  return (
    typeof i.id === "string" &&
    i.id.length > 0 &&
    i.id.length <= 64 &&
    typeof i.name === "string" &&
    i.name.trim().length > 0
  );
}

function sanitizeItem(item: GroceryItem): GroceryItem {
  const now = Date.now();
  return {
    id: item.id,
    name: item.name.trim().slice(0, 120),
    qty: typeof item.qty === "string" ? item.qty.trim().slice(0, 40) : "",
    category: isCategory(item.category) ? item.category : "Other",
    checked: Boolean(item.checked),
    addedBy: typeof item.addedBy === "string" ? item.addedBy.slice(0, 40) : "",
    createdAt: typeof item.createdAt === "number" ? item.createdAt : now,
    updatedAt: typeof item.updatedAt === "number" ? item.updatedAt : now,
  };
}

/** Generates an id that works even on plain-http LAN dev servers where crypto.randomUUID is missing. */
export function makeId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return (
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 6)
  );
}
