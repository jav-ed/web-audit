# Usage

## Run commands

```bash
# Dist mode — audit every built HTML file, no browser needed
bun src/index.ts dist ./dist

# Dev mode — audit live dev server pages via Playwright
bun src/index.ts dev http://localhost:4321
```

Via package.json scripts (shorthand):
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
bun src/index.ts dist ./dist --output ./reports/audit.json
```

## Disabled rules in dist mode

`color-contrast` and `link-in-text-block` are always disabled in dist mode. jsdom has no CSS engine — these rules query computed styles and always produce false positives against static HTML.
