# Usage

## Global CLI (primary)

The tool is installed globally via `bun link`. Call it from anywhere:

```bash
audit dist ./dist
audit dev http://localhost:4321
```

`~/.bun/bin` must be in your `$PATH` — verify with `which audit`. If missing, add to your shell config:
```bash
export PATH="$HOME/.bun/bin:$PATH"
```

To install or reinstall the global link, run from the repo root:
```bash
bun link
```

## Alternative — bun script (no global install needed)

```bash
bun src/index.ts dist ./dist
bun src/index.ts dev http://localhost:4321
```

Or via package.json shortcuts:
```bash
bun run audit:dist
bun run audit:dev
```

## Flags

### dist

| Flag | Default | Description |
|---|---|---|
| `path` | `./dist` | Path to the dist/ folder (positional) |
| `--tags` | `21aa` | WCAG level: `2a` \| `2aa` \| `21aa` \| `22aa` |
| `--min-impact` | `serious` | Exit 1 if any violation is at this level or above: `minor` \| `moderate` \| `serious` \| `critical` |
| `--output` | _(none)_ | Write JSON report to this file path |

### dev

| Flag | Default | Description |
|---|---|---|
| `url` | `http://localhost:4321` | Base URL of the dev server (positional) |
| `--dist` | `./dist` | Path to dist/ for URL discovery (primary strategy) |
| `--config` | `./pages.ts` | Path to pages.ts config (fallback if dist/ doesn't exist) |
| `--tags` | `21aa` | WCAG level: `2a` \| `2aa` \| `21aa` \| `22aa` |
| `--min-impact` | `serious` | Exit 1 if any violation is at this level or above |
| `--output` | _(none)_ | Write JSON report to this file path |

## URL discovery in dev mode

Dev mode needs to know which pages to visit. It picks a strategy automatically:

1. **If `dist/` exists** — walks `dist/**/*.html` and translates paths to localhost URLs. Always prints a staleness warning to stderr. This is the primary strategy.
2. **If `dist/` does not exist** — loads `pages.ts` (or `--config` path) and calls its default export.

## pages.ts config format

Used as the fallback when no dist build exists. Place `pages.ts` next to where you invoke the tool, or pass `--config ./path/to/pages.ts`.

```typescript
// Static list
export default ['/en/about', '/en/contact', '/de/about']

// Programmatic — loop over languages × routes
const langs = ['en', 'de', 'fr', 'ar', 'ur']
const routes = ['/', '/about', '/contact', '/blog']
export default () => langs.flatMap(l => routes.map(r => `/${l}${r}`))

// Async is also supported
export default async () => {
  // fetch from CMS, read from file, etc.
  return ['/en/about']
}
```

## CI integration

Both modes exit with code `1` if any violation meets or exceeds `--min-impact` (default: `serious`). This means `serious` and `critical` violations fail the build; `moderate` and `minor` do not.

```bash
# In CI — write report and fail on serious+
audit dist ./dist --output ./reports/audit.json
```

## JSON output — two files

Passing `--output` always writes two files:

| File | Content |
|---|---|
| `audit.json` | Violations only (clean pages excluded), nodes capped at 5, html truncated at 200 chars |
| `audit.pages.json` | All inspected pages — use this to verify discovery found everything |

**Agent convention:** if you see multiple report files in a directory, read the `.json` file (not `.pages.json`) first. The main report sorts before the pages list alphabetically. Only open the pages list if you need to verify coverage.

### report

| Flag | Default | Description |
|---|---|---|
| `file` | _(required)_ | Path to a saved `report.json` (positional) |
| `--top` | _(all)_ | Show at most N violations, sorted critical → minor |
| `--min-impact` | `minor` | Skip violations below this level (default shows all) |

## --help

All three forms work via citty:

```bash
audit --help          # top-level: lists dev and dist subcommands
audit dev --help      # dev flags, arguments, defaults
audit dist --help     # dist flags, arguments, defaults
```

## Terminal output format

```
{mode} mode — {source} — {N} pages

  ✗  {page source}  ({N} violations)

     {impact}  {rule id}
     {description}
     → {html snippet, truncated at 100 chars}
     → ...
       …and N more nodes   (if > 3 nodes)

  ✓  No violations found   (if no violations on that page)

────────────────────────────────────────────────────────
  {N} pages  ·  {N} with violations  ·  {N} total violations
  critical: N  serious: N  moderate: N  minor: N
```

- Violations sorted critical → serious → moderate → minor within each page
- Clean pages are not printed — they appear only in the summary count
- Up to 3 nodes shown per violation in terminal (5 in JSON)

## Reading a report as an agent

The JSON report is structured so the most useful information is near the top. Read lines 1–30 first to get the `summary` block — that tells you total pages, pages with violations, and total violations. Decide from there whether to read further or use `audit report` to filter.

```bash
# Quick triage without reading the full file
audit report Scratch/Audit/report.json --top 10
audit report Scratch/Audit/report.json --min-impact critical
```

Only open the full `report.json` if you need node-level detail for a specific violation.

## JSON schema

`<name>.json` (main violations report):

```json
{
  "generatedAt": "<ISO 8601 timestamp>",
  "mode": "dev | dist",
  "source": "<dist path or base URL>",
  "note": "<path to pages list file>",
  "summary": {
    "totalPages": 42,
    "pagesWithViolations": 7,
    "totalViolations": 12
  },
  "pages": [
    {
      "source": "<URL in dev mode | relative file path in dist mode>",
      "violations": [
        {
          "id": "<axe rule id>",
          "impact": "critical | serious | moderate | minor",
          "description": "<short readable description>",
          "helpUrl": "<axe docs URL>",
          "totalNodes": 8,
          "nodes": [
            {
              "target": ["<CSS selector>"],
              "html": "<opening tag, truncated at 200 chars>",
              "failureSummary": "<fix suggestion from axe>"
            }
          ]
        }
      ]
    }
  ]
}
```

`<name>.pages.json` (coverage list):

```json
{
  "generatedAt": "<ISO 8601 timestamp>",
  "mode": "dev | dist",
  "source": "<dist path or base URL>",
  "totalPages": 42,
  "pages": ["<URL or file path>", "..."]
}
```

Key schema notes:
- `pages` in the main report is violations-only — clean pages are omitted but counted in `summary.totalPages`
- `totalNodes` = full count of affected elements; `nodes` array is capped at 5
- `target` (CSS selector) is never truncated — use it to locate the element in code
- `html` is truncated at 200 chars — visual context only

## Disabled rules in dist mode

`color-contrast` and `link-in-text-block` are always disabled in dist mode. jsdom has no CSS engine — these rules query computed styles and always produce false positives against static HTML.
