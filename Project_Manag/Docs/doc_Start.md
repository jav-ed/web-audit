# Audit

A CLI accessibility audit tool. Runs axe-core checks in two modes: against a live dev server (Playwright) or against a built `dist/` folder (axe-core + jsdom, no browser).

Entry point: `src/index.ts`

The tool has two independently maintained code paths — dist and dev — that share only the output schema. Changes to one rarely affect the other. All output (JSON report, console summary) is produced from a common structure regardless of which mode ran.

Use this file as the top-level handoff. Do not paste large doc contents into agent context by default. Read only the linked files that are relevant to the task at hand. If nothing matches, start with [Architecture](./Architecture/linker_Architecture.md).

## Docs

- **[Usage](./Descr/usage.md)** — how to run the tool, all flags, install, global linking, CI setup
- **[Features](./Features/linker_Features.md)** — dist vs dev mode, URL discovery, output format, JSON schema, open feature requests
- **[Architecture](./Architecture/linker_Architecture.md)** — code structure, which file does what, two-mode design, data flow
- **[Decisions](./Decisions/decisions.md)** — why jsdom over browser for dist, why axe-core, why Bun, --min-impact design
- **[Live Working](../Live_Working/live.md)** — implementation status, known issues, next steps
- **[Learnings](./Learnings/learnings.md)** — gotchas with axe-core + Bun, jsdom quirks
- **[Dependency docs](./Investigation/linker_Deps.md)** — axe-core, @axe-core/playwright, jsdom, Playwright
- **[Agent Skill](../../.agents/skills/audit/SKILL.md)** — commands, options, output format for agent use
