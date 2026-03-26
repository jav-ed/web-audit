# Decisions

## Bun + TypeScript

Size doesn't matter — max features and fast dev speed are the priorities. Bun gives the fastest install/run cycle, native TS without a build step, and easy scripting.

## axe-core as the audit engine

Industry standard. Maintained, comprehensive ruleset, works both in-browser (via `@axe-core/playwright`) and in jsdom. Same ruleset in both modes means dev and dist reports are directly comparable — you're testing the same rules, just at different stages.

## Playwright for dev mode (not fetch + jsdom)

Dev server pages require JS execution — Astro islands, hydration, interactive components. A headless browser is the only way to get accurate results against a live dev server.

## jsdom for dist mode (not a served browser check)

The built `dist/` folder is static HTML — no JS hydration needed post-build for the accessibility tree. jsdom can parse the HTML directly, no server spin-up required. This is what makes full-coverage (~65 pages × all langs) tractable. Running Playwright against a served dist/ is also valid but slower and redundant when the files are already on disk.

## pages.ts over pages.json for the config fallback

A JSON file can only hold a static list. A `.ts` file can generate URLs programmatically — e.g. loop over languages and build `/{lang}/about` for all five at once. The complexity cost is near zero.

## CI impact threshold — --min-impact flag, default: serious

Non-zero exit on `serious` or `critical` violations. `moderate` and `minor` are review items, not build blockers. The flag means "fail on this level and above" — so `--min-impact serious` catches both serious and critical. Default is `serious`.

## Staleness warning — always warn, no mtime comparison

When dev mode derives URLs from `dist/`, it always emits a one-line reminder to rebuild if the dist may be stale. mtime comparison adds complexity for minimal gain.

## Tool lives in tools/audit/ inside the main repo

Extract to a standalone repo when there is a second consumer. The code has zero Astro-specific logic so extraction is trivial. No reason to pay the overhead of a separate repo before it is needed.

## Two separate modes instead of one unified approach

Dev mode and dist mode answer different questions:
- Dev: "Is this page accessible right now as I'm working on it?"
- Dist: "Is the final shipped output accessible across all pages and languages?"

They are complementary, not redundant.
