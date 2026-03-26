# Features

What the tool does and what is still open.

## Implemented

### Dist mode
- Walks all `.html` files under the given path recursively
- Parses each file with jsdom, runs axe-core directly
- `color-contrast` and `link-in-text-block` disabled (require CSS rendering)
- Fully offline — no browser, no server
- Covers every page × every language in one pass

### Dev mode
- Discovers pages from `dist/**/*.html` → localhost URLs (primary) or `pages.ts` config (fallback)
- Emits staleness warning to stderr when using dist-derived URLs
- Launches Playwright (Chromium), navigates to each URL with `waitUntil: 'networkidle'`
- Runs axe-core via AxeBuilder on the fully-hydrated page

### Output
- **Terminal** — violations sorted critical→minor, grouped by page, max 3 nodes shown per violation, summary line
- **JSON** (`--output path`) — always writes two files:
  - `<name>.json` — violations-only (clean pages excluded), nodes capped at 5 per violation (`totalNodes` field preserves full count), `html` truncated at 200 chars (`target` CSS selector kept intact for element identification)
  - `<name>.pages.json` — flat list of all inspected pages, for verifying discovery coverage
  - Agent convention: read `.json` first; open `.pages.json` only to verify coverage

### CI
- `--min-impact` flag (default: `serious`) — exits 1 if any violation meets or exceeds that level
- `serious` catches both serious and critical; `critical` only fails on critical

## Open feature requests

- **HTML report** — visual report for sharing with non-dev stakeholders
- **Rule overrides via config** — allow projects to ignore specific rules or selectors per-page
