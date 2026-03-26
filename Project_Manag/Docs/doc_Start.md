# Audit

A CLI accessibility audit tool. Runs axe-core checks in two modes: against a live dev server (Playwright) or against a built `dist/` folder (axe-core + jsdom, no browser).

Entry point: `src/index.ts`

## Docs

- [Usage](Descr/usage.md) — how to run the tool, all flags, pages.ts config format, CI setup
- [Architecture](Architecture/linker_Architecture.md) — two-mode design, data flow, code map (which file does what)
- [Features](Features/linker_Features.md) — what each mode does, output format, open feature requests
- [Decisions](Decisions/decisions.md) — why Bun/TS, axe-core, jsdom for dist, pages.ts over pages.json, --min-impact design
- [Live Working](../Live_Working/live.md) — implementation status, known issues, next steps
- [Dependency docs](Investigation/linker_Deps.md) — local clones of axe-core, @axe-core/playwright, jsdom, Playwright with direct links to relevant doc files
