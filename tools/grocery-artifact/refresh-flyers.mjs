// Builds the weekly deals catalog for the Grocery List artifact.
// Usage: node refresh-flyers.mjs <zip> <outDir>
// Writes <outDir>/flyers/<docId>.json (one or more per store) and <outDir>/meta/flyers.json
import fs from "node:fs";
import path from "node:path";

const [zip = "19103", outDir = "./out"] = process.argv.slice(2);
const BASE = "https://backflipp.wishabi.com/flipp";
const UA = { "User-Agent": "Mozilla/5.0 (compatible; GroceryListArtifact/1.0)", Accept: "application/json" };
const CHUNK = 450;

// Full-line supermarkets and big-box grocers that sell national brands, so a flyer price
// can be matched elsewhere. Warehouse clubs, store-brand discounters, closeout and
// specialty grocers are left out on purpose.
const MAJOR = [/\bacme\b/i,/\balbertsons\b/i,/\bbig y\b/i,/\bcub foods?\b/i,/\bdillons\b/i,/\bfareway\b/i,/\bfestival foods\b/i,/\bfood lion\b/i,/\bfoodtown\b/i,/\bfred meyer\b/i,/\bfresh grocer\b/i,/\bfry'?s\b/i,/\bgiant\b/i,/\bh-?e-?b\b/i,/\bhannaford\b/i,/\bharris teeter\b/i,/\bhy-?vee\b/i,/\bingles\b/i,/\bjewel(-| )?osco\b/i,/\bkey food\b/i,/\bking soopers\b/i,/\bkroger\b/i,/\blucky\b/i,/\bmarket basket\b/i,/\bmeijer\b/i,/\bpiggly wiggly\b/i,/\bprice chopper\b/i,/\bpublix\b/i,/\braley'?s\b/i,/\bralphs\b/i,/\bredner'?s\b/i,/\bsafeway\b/i,/\bschnucks\b/i,/\bshaw'?s\b/i,/\bshop ?rite\b/i,/\bsmith'?s\b/i,/\bstater bros\b/i,/\bstop & shop\b|\bstop and shop\b/i,/\btarget\b/i,/\btops\b/i,/\bvons\b/i,/\bwalmart\b/i,/\bwegmans?'?s?\b/i,/\bweis\b/i,/\bwinn-?dixie\b/i,/\bwoodman'?s\b/i];
const isMajor = (n) => MAJOR.some((re) => re.test(n.trim()));

async function getJson(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(25000) });
      if (res.ok) return await res.json();
      if (res.status === 404) return null;
    } catch {}
    await new Promise((r) => setTimeout(r, 800 * (i + 1)));
  }
  return null;
}
async function pool(jobs, n, fn) {
  let i = 0; const out = new Array(jobs.length);
  await Promise.all(Array.from({ length: n }, async () => { while (i < jobs.length) { const k = i++; out[k] = await fn(jobs[k], k); } }));
  return out;
}
const cleanUnit = (t) => {
  const cut = String(t || "").split(/\b(?:with|when|w\/|digital|limit|must|save|reg|regular|or)\b/i)[0].trim();
  return (cut.length > 14 ? cut.slice(0, 14).trim() : cut).replace(/\s+/g, " ");
};

const list = await getJson(`${BASE}/flyers?locale=en-us&postal_code=${zip}`);
if (!list?.flyers) { console.error("could not load flyer list"); process.exit(1); }
const flyers = list.flyers.filter((f) => (f.categories || []).includes("Groceries") && isMajor(f.merchant));
console.error(`${flyers.length} major-grocer flyers for ${zip}`);

const now = Date.now();
const byId = new Map(); // flyer item id -> item
const stores = new Map(); // merchant_id -> {id,name}
await pool(flyers, 4, async (f) => {
  const d = await getJson(`${BASE}/flyers/${f.id}?locale=en-us`);
  const name = f.merchant.trim();
  stores.set(f.merchant_id, { id: f.merchant_id, name });
  for (const it of d?.items ?? []) {
    const price = Number(it.price);
    if (!it.name || !Number.isFinite(price) || price <= 0) continue;
    if (it.valid_to && Date.parse(it.valid_to) < now) continue;
    byId.set(it.id, { id: it.id, sid: f.merchant_id, n: it.name.trim().replace(/\s+/g, " ").slice(0, 110), p: price, u: "", s: "", t: (it.valid_to || f.valid_to || "").slice(0, 10) });
  }
});
console.error(`${byId.size} priced items from flyers`);

// Enrich with units ("/lb.") and sale wording from the search endpoint.
const terms = fs.readFileSync(new URL("./terms.txt", import.meta.url), "utf8").split("\n").map((s) => s.trim()).filter(Boolean);
let enriched = 0, added = 0;
await pool(terms, 5, async (q) => {
  const d = await getJson(`${BASE}/items/search?locale=en-us&postal_code=${zip}&q=${encodeURIComponent(q)}`, 2);
  for (const it of d?.items ?? []) {
    if (it.item_type && it.item_type !== "flyer") continue;
    const id = it.flyer_item_id ?? it.id;
    const unit = cleanUnit(it.post_price_text), story = String(it.sale_story || "").trim().replace(/\s+/g, " ").slice(0, 60);
    const have = byId.get(id);
    if (have) { if (!have.u && unit) { have.u = unit; enriched++; } if (!have.s && story) have.s = story; continue; }
    if (!it.name || !it.merchant_name || !isMajor(it.merchant_name)) continue;
    const price = Number(it.current_price);
    if (!Number.isFinite(price) || price <= 0) continue;
    if (it.valid_to && Date.parse(it.valid_to) < now) continue;
    stores.set(it.merchant_id, { id: it.merchant_id, name: it.merchant_name.trim() });
    byId.set(id, { id, sid: it.merchant_id, n: it.name.trim().replace(/\s+/g, " ").slice(0, 110), p: price, u: unit, s: story, t: (it.valid_to || "").slice(0, 10) });
    added++;
  }
});
console.error(`search pass: ${enriched} units filled in, ${added} extra items`);

// Group per store, dedupe same name+price, chunk into documents.
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(path.join(outDir, "flyers"), { recursive: true });
fs.mkdirSync(path.join(outDir, "meta"), { recursive: true });
const fetchedAt = new Date().toISOString();
const summary = [];
for (const st of [...stores.values()].sort((a, b) => a.name.localeCompare(b.name))) {
  const seen = new Set();
  const items = [...byId.values()].filter((i) => i.sid === st.id).filter((i) => { const k = i.n.toLowerCase() + "|" + i.p; if (seen.has(k)) return false; seen.add(k); return true; })
    .map(({ n, p, u, s, t }) => { const o = { n, p, t }; if (u) o.u = u; if (s) o.s = s; return o; });
  if (!items.length) continue;
  const parts = Math.ceil(items.length / CHUNK);
  for (let k = 0; k < parts; k++) {
    fs.writeFileSync(path.join(outDir, "flyers", `s${st.id}-${k}.json`), JSON.stringify({ storeId: st.id, store: st.name, zip, fetchedAt, part: k, parts, items: items.slice(k * CHUNK, (k + 1) * CHUNK) }));
  }
  summary.push({ id: st.id, name: st.name, count: items.length, parts });
}
fs.writeFileSync(path.join(outDir, "meta", "flyers.json"), JSON.stringify({ zip, fetchedAt, stores: summary, total: summary.reduce((a, s) => a + s.count, 0) }));
console.log(JSON.stringify({ zip, stores: summary.map((s) => `${s.name}: ${s.count}`), docs: summary.reduce((a, s) => a + s.parts, 0) }, null, 1));
