# Architecture

Two-mode design, data flow, and code map.

## Two-Mode Design

The core split: dev mode and dist mode are fundamentally different execution paths.

### Dev Mode
- **Target**: Live dev server (e.g. `http://localhost:4321`)
- **Engine**: Playwright + `@axe-core/playwright` (AxeBuilder)
- **Why a browser**: JS must hydrate, Astro islands must render — fetch + jsdom would miss dynamic content
- **URL discovery**: `from-dist.ts` primary → derive localhost URLs from `dist/**/*.html`. `from-config.ts` fallback → load `pages.ts` when no dist build exists.

### Dist Mode
- **Target**: `dist/` folder after `bun run build`
- **Engine**: axe-core + jsdom (no browser, no server)
- **Why static analysis works**: Astro builds to static HTML — all routes, content collections, and i18n variants are already resolved files on disk
- **Disabled rules**: `color-contrast`, `link-in-text-block` — require CSS rendering, always false-positive in jsdom

Both modes use the same axe ruleset and output types — reports are directly comparable.

## Deployment Constraint

**No `bun build --compile`.** Playwright does not support Bun; `chromium.launch()` hangs in compiled binaries. The tool runs as a Bun script only.

```bash
bun src/index.ts dev http://localhost:4321
bun src/index.ts dist ./dist
```

## Stack

| Layer | Choice |
|---|---|
| Runtime | Bun |
| CLI | citty |
| Dev browser | Playwright |
| Axe (dev) | `@axe-core/playwright` AxeBuilder |
| HTML parsing (dist) | jsdom |
| Axe (dist) | `axe-core` Node.js API — `axe.setup()` / `axe.run()` / `axe.teardown()` |
| Terminal output | Custom reporter — existing formatters are unmaintained |

## Code Map

Which file to edit for a given task:

```
src/
  index.ts              CLI entry — registers dev and dist subcommands with citty

  types.ts              Shared types: Impact, Violation, ViolationNode, PageResult

  commands/
    dev.ts              CLI args/flags for dev mode — wires discovery + auditor + reporters + exit code
    dist.ts             CLI args/flags for dist mode — same pattern as dev.ts
    report.ts           CLI args/flags for report mode — reads saved JSON, filters by impact + --top N, prints terminal output

  auditors/
    dev.ts              Playwright + AxeBuilder loop — launches browser, visits each URL, collects results
    dist.ts             jsdom + axe Node.js API loop — reads HTML files, calls axe.setup(dom.window.document)
                        then axe.run(), then axe.teardown() to reset state between files

  discovery/
    from-dist.ts        Walk dist/**/*.html → translate to localhost URLs. Always emits staleness warning to stderr.
    from-config.ts      Dynamic import pages.ts → URL paths. Used when no dist/ exists.

  reporter/
    terminal.ts         ANSI output — violations sorted critical→minor, grouped by page, summary line
    json.ts             JSON report writer — violations-only main report + pages list file (.pages.json),
                        nodes capped at 5, html truncated at 200 chars, output dir auto-created

  utils/
    walk.ts             Async generator using Bun.Glob — yields absolute .html file paths recursively
    wcag.ts             WCAG tag builder (wcagTags) + impact threshold comparison (meetsThreshold)
```

## Data Flow

```
Dev mode:
  CLI args → from-dist.ts (or from-config.ts) → string[] of URLs
           → auditors/dev.ts → Playwright → AxeBuilder.analyze() per page
           → PageResult[] → reporter/terminal.ts + reporter/json.ts

Dist mode:
  CLI args → utils/walk.ts → string[] of HTML file paths
           → auditors/dist.ts → jsdom + axe.setup()/run()/teardown() per file
           → PageResult[] → reporter/terminal.ts + reporter/json.ts
```

## Key Implementation Detail — axe in jsdom

axe-core is used via its Node.js API directly — no script injection needed.

For each HTML file: a jsdom instance is created, then `axe.setup(dom.window.document)` hands axe-core the document, `axe.run()` performs the analysis, and `axe.teardown()` resets axe state to prevent cross-contamination between files.

This avoids `runScripts: 'dangerously'` (which relies on `node:vm`, partially supported in Bun) and avoids loading the UMD browser bundle entirely.
