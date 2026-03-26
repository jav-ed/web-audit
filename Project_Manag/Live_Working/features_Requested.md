# Feature Requests

Short descriptions only. Status: `open` | `decided` | `dropped`

---

## Core modes

- **Dev mode** `decided` — Playwright + axe against a live dev server, URL discovery from dist/
- **Dist mode** `decided` — axe + jsdom against built HTML files, all pages all languages, no browser

## URL Discovery

- **from-dist.ts** `decided` — primary: derive localhost URLs from dist/**/*.html paths
- **from-config.ts** `decided` — fallback: read pages.json / pages.ts when no dist build exists
- **Staleness warning** `decided` — always warn when using dist-derived URLs in dev mode, no mtime comparison

## Reporter

- **Terminal output** `decided` — human-readable, violations grouped by page then rule
- **JSON output** `decided` — machine-readable file for CI integration
- **HTML report** `open` — visual report for sharing/reviewing with non-dev stakeholders

## CLI

- **citty subcommands** `decided` — `dev` and `dist` as top-level commands
- **CI exit code** `decided` — non-zero on serious/critical via `--min-impact` flag (default: serious, means "this level and above")

## Rules / Axe config

- **Disable color-contrast + link-in-text-block in dist mode** `decided` — jsdom has no CSS rendering
- **Rule overrides via config** `open` — allow projects to ignore specific rules or selectors
