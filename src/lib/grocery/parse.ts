/**
 * Turn what someone types into a quantity + name.
 *   "2 lb chicken thighs"  -> { qty: "2 lb",  name: "chicken thighs" }
 *   "3 avocados"           -> { qty: "3",     name: "avocados" }
 *   "milk x2"              -> { qty: "2",     name: "milk" }
 *   "a dozen eggs"         -> { qty: "12",    name: "eggs" }
 *   "eggs"                 -> { qty: "",      name: "eggs" }
 */

const UNITS = [
  "lb", "lbs", "pound", "pounds", "oz", "ounce", "ounces", "kg", "g", "gram", "grams",
  "l", "liter", "liters", "litre", "litres", "ml", "gal", "gallon", "gallons", "qt", "quart", "quarts",
  "pt", "pint", "pints", "cup", "cups", "pack", "packs", "pk", "bag", "bags", "box", "boxes", "can", "cans",
  "jar", "jars", "bottle", "bottles", "bunch", "bunches", "head", "heads", "dozen", "doz", "case", "cases",
  "loaf", "loaves", "carton", "cartons", "container", "containers", "roll", "rolls", "stick", "sticks",
  "bar", "bars", "each", "ea", "ct", "count", "pcs", "pieces", "piece", "x",
];

const UNIT_RE = UNITS.map((u) => u.replace(".", "\\.")).join("|");
const NUMBER_RE = "(?:\\d+(?:[.,]\\d+)?|\\d+\\s*/\\s*\\d+|\\d+\\s+\\d+/\\d+|½|¼|¾)";

// "2 lb chicken", "2lbs chicken", "1.5 kg rice", "3 avocados", "2 x milk"
const LEADING = new RegExp(`^(${NUMBER_RE})\\s*(${UNIT_RE})?\\.?\\s+(?:of\\s+)?(.+)$`, "i");
// "milk x2", "milk x 2", "milk (2)", "milk - 2 lb"
const TRAILING = new RegExp(`^(.+?)\\s*(?:x\\s*|\\(|-\\s*)(${NUMBER_RE})\\s*(${UNIT_RE})?\\)?\\s*$`, "i");
// "a dozen eggs", "dozen eggs", "a bunch of cilantro", "a gallon of milk"
const WORD_QTY = new RegExp(`^(?:a|an|one)?\\s*(${UNIT_RE})\\s+(?:of\\s+)?(.+)$`, "i");

export interface ParsedItem {
  name: string;
  qty: string;
}

export function parseItemText(raw: string): ParsedItem {
  const text = raw.trim().replace(/\s+/g, " ");
  if (!text) return { name: "", qty: "" };

  let m = text.match(LEADING);
  if (m) {
    const [, num, unit, name] = m;
    return { qty: joinQty(num, unit), name: clean(name) };
  }

  m = text.match(TRAILING);
  if (m) {
    const [, name, num, unit] = m;
    return { qty: joinQty(num, unit), name: clean(name) };
  }

  m = text.match(WORD_QTY);
  if (m) {
    const [, unit, name] = m;
    const u = unit.toLowerCase();
    if (u === "dozen" || u === "doz") return { qty: "12", name: clean(name) };
    return { qty: `1 ${u}`, name: clean(name) };
  }

  return { qty: "", name: clean(text) };
}

function joinQty(num: string, unit?: string): string {
  const n = num.replace(/\s+/g, " ").trim();
  if (!unit || unit.toLowerCase() === "x") return n;
  return `${n} ${unit.toLowerCase()}`;
}

function clean(name: string): string {
  return name.replace(/^[\s,.\-–—]+|[\s,.\-–—]+$/g, "").trim();
}

/**
 * Split one typed line into several items when the user separates them with
 * commas, semicolons or newlines. Keeps decimal numbers like "1,5" intact.
 */
export function splitItems(raw: string): string[] {
  return raw
    .split(/\s*(?:[;\n]|,(?!\d))\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}
