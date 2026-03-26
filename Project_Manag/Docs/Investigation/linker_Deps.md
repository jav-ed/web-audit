# Dependency Docs

Local clones live in `Repos/`. This file routes to the right place per library.

## axe-core

Used directly in dist mode (axe-core + jsdom).

- [API reference](../../../Repos/axe-core/doc/API.md) — full axe-core API: `axe.run()`, `axe.configure()`, context, options, results schema, rule IDs, impact levels
- [Check options](../../../Repos/axe-core/doc/check-options.md) — per-rule option overrides
- [Rule development / how rules work](../../../Repos/axe-core/doc/developer-guide.md) — internals, useful if writing custom rules or understanding rule structure
- [examples/](../../../Repos/axe-core/doc/examples/) — runnable usage examples

## @axe-core/playwright (AxeBuilder)

Used in dev mode (Playwright + axe).

- [AxeBuilder API](../../../Repos/axe-core-npm/packages/playwright/README.md) — constructor, `.analyze()`, `.include()`, `.exclude()`, `.withRules()`, `.withTags()`, `.disableRules()`, `.setLegacyMode()`, error handling
- [Error handling guide](../../../Repos/axe-core-npm/packages/playwright/error-handling.md) — how to handle axe errors in Playwright context
- [Usage example](../../../Repos/axe-core-npm/packages/playwright/example.js) — minimal working example

## jsdom

Used in dist mode to parse `.html` files before passing to axe-core.

- [Full API / README](../../../Repos/jsdom/README.md) — entire jsdom API lives here: JSDOM constructor, options (runScripts, resources, url), virtualConsole, fromFile(), fragment(), caveats

## Playwright

Used in dev mode as the browser driver.

- **Primary docs: https://playwright.dev** — API reference and guides live externally, not in the local clone
- Local clone has `docs/src/` with raw API source (auto-generated), but `playwright.dev` is the readable version
- [CLAUDE.md in repo](../../../Repos/playwright/CLAUDE.md) — monorepo structure, dev commands, test conventions (useful if debugging Playwright itself)
