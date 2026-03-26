# Live Working

## Status

Implemented. All source files written, dependencies installed, Playwright Chromium browser downloaded.

## Known issues / watch points

- **Playwright on Manjaro**: downloaded Ubuntu fallback build — not officially supported. If `chromium.launch()` fails, run `bunx playwright install --with-deps chromium` to get system libs.
- **@types/jsdom version**: installed as `21.1.7` but jsdom resolved to `29.0.1`. If type mismatches surface at runtime, run `bun add -d @types/jsdom@latest`.
- **First run requires a dist build** for dev mode URL discovery. If no `dist/` exists, the `--config ./pages.ts` fallback is used.

## Open feature requests

See [features_Requested.md](features_Requested.md) for full list. Two items remain open:
- HTML report output
- Rule overrides via config file

## If moving to the main Jav_Web repo

The tool goes into `tools/audit/`. Update the `package.json` scripts path from `bun src/index.ts` to `bun tools/audit/src/index.ts`. No other code changes needed — zero Astro-specific logic in the source.
