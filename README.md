# In Season

A small phone-first web app with two parts:

- **Fruits** (`/`): swipe through what fruit is in season near you.
- **Grocery list** (`/grocery`): one shared shopping list for you and your partner,
  sorted by aisle, with this week's sale prices from the big grocery chains near you.

## The grocery list

**Sharing.** The first person taps "Start a new list" and gets a 6-letter code.
The other person opens the app, taps "Join my partner's list" and types the code
(or opens the invite link from Settings → Share). Both phones then show the same
list. Changes appear on the other phone within a few seconds, and anything you
add while offline is sent as soon as you're back online.

**Aisles.** Every item is sorted into an aisle (Produce, Bakery, Deli, Meat &
Seafood, Dairy & Eggs, Frozen, Pantry, Snacks, Beverages, Household, Personal
Care, Baby & Pets) by matching words in its name. Tap an item to move it to a
different aisle, change the amount, or remove it. You can type amounts naturally
("2 lb chicken thighs", "milk x2", "a dozen eggs") and add several things at once
separated by commas.

**Sales.** Enter your zip code in Settings and pick the stores you shop at. Each
item on the list is checked against this week's flyers and shows the best price
and store; the Deals tab groups everything on sale by store so you can plan the
trip. Only flyers from major grocery chains are used, and only deals with an
actual listed price and a full match on the item name are shown, so every deal
is something you can compare or price-match. Flyer data comes from Flipp's
public flyer search (no API key needed); if that service is unavailable the
list still works, just without sale badges.

### Running it

```bash
npm install
npm run dev
```

Open http://localhost:3000/grocery. To try it on two phones on your Wi-Fi, open
`http://<your computer's IP>:3000/grocery` on each.

### Where the list is stored

Without any configuration, lists are kept in memory on the server and mirrored
to JSON files in the system temp folder. That works fine for local development.

For a real deployment (for example on Vercel), set up a Redis database and add
these environment variables so lists survive restarts and are shared across
server instances:

| Variable | Notes |
| --- | --- |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | From an Upstash Redis database (the Vercel Marketplace "Upstash for Redis" integration sets these for you). |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Also accepted (older Vercel KV naming). |
| `GROCERY_DATA_DIR` | Optional. Folder for the JSON fallback when no Redis is configured. |

Lists that haven't changed in 6 months are automatically forgotten.

### How the code is laid out

- `src/lib/grocery/` — shared logic: item types, the "apply a change" rules used
  on both phone and server, the aisle keyword dictionary, the amount parser,
  the flyer lookup, the list of major grocery chains, and server storage.
- `src/app/api/grocery/` — create a list, read it, and send changes to it.
- `src/app/api/flyers/` and `src/app/api/sales/` — stores near a zip, and deals for one item.
- `src/hooks/useGroceryList.ts` — keeps a phone in sync with the server.
- `src/hooks/useSales.ts` — looks up deals for each item, with a one-hour cache on the phone.
- `src/components/grocery/` — the screens.

## Fruits

This part was bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
