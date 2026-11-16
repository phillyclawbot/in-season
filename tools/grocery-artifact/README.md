# Grocery list Artifact

The shared grocery list also runs as a hosted Claude Artifact page, which needs
no server or database of its own.

- `page.src.html` is the page. Before publishing, the `/*__KEYWORDS__*/{}`
  placeholder is replaced with the aisle keyword dictionary from
  `src/lib/grocery/categorize.ts` (as a JSON object of aisle name to word list).
- `refresh-flyers.mjs` builds the weekly deals catalog. An Artifact page cannot
  call outside services, so the flyers are fetched here and written into the
  page's database (`flyers` collection, one or two documents per store).

```bash
node tools/grocery-artifact/refresh-flyers.mjs 19103 ./out
```

That writes `out/flyers/*.json`; each file is stored as the document of the same
name in the page's `flyers` collection. `terms.txt` is the list of search words
used to fill in units such as "/lb".
