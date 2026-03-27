# web-audit

A CLI accessibility audit tool powered by axe-core. Runs checks in two modes: against a built `dist/` folder (static HTML, no browser) or against a live dev server (Playwright).

> Built for personal use. If it's useful to you, go ahead — no guarantees.

---

## The story

I was trying to automate my web development workflow and give my AI agents proper tools to work with. Not wrappers around browser GUIs, not MCP servers that bloat the agent's context — actual CLI tools that an agent can call cleanly and interpret reliably.

This is one of those tools.

Three things make it agent-friendly by design:

**1. Ships with a skill file — no MCP needed.**
The repo includes a `.agents/skills/audit/` folder. Drop it into your agent setup and it loads only when relevant. The agent reads what it needs, skips the rest. No persistent context overhead, no server to run.

**2. Structured output an agent can actually use.**
The `--output` flag writes a JSON report with a predictable schema — summary up front, violations sorted by impact, CSS selectors never truncated. The `report` subcommand lets the agent filter and triage without re-running the full audit.

**3. Built-in `--help` that works for agents and humans alike.**
Every subcommand is documented at the CLI level. No hunting through READMEs.

```bash
audit --help
audit dist --help
audit dev --help
audit report --help
```

---

## Ask your agent

The docs in this repo are structured for agent navigation, not for sequential reading. Instead of skimming through files yourself, point your agent at the entry point and ask your question directly:

```
Read @Project_Manag/Docs/doc_Start.md and tell me: [your question here]
```

Examples:

```
Read @Project_Manag/Docs/doc_Start.md and tell me how to install this tool.
Read @Project_Manag/Docs/doc_Start.md and explain the difference between dist and dev mode.
Read @Project_Manag/Docs/doc_Start.md and tell me what the JSON report schema looks like.
Read @Project_Manag/Docs/doc_Start.md and tell me how URL discovery works in dev mode.
```

The agent will navigate to the relevant doc, read only what it needs, and answer directly. This works for setup questions, usage questions, architecture questions — anything covered in the docs.

---

## Install

**Requires [Bun](https://bun.sh).**

```bash
git clone https://github.com/jav-ed/web-audit.git
cd web-audit
bun install
```

Link the CLI globally so you can run `audit` from anywhere:

```bash
bun link
```

Or symlink manually:

```bash
ln -sf "$(pwd)/src/index.ts" ~/.bun/bin/audit
```

Dev mode requires Playwright browsers:

```bash
bunx playwright install chromium
```

---

## Usage

Run from the project root you want to audit, so relative paths resolve correctly.

```bash
# Dist mode — static HTML, no browser (run after a build)
audit dist ./dist

# Dev mode — Playwright against a live dev server
audit dev http://localhost:4321

# Read and filter a previously saved report — no re-crawl
audit report ./report.json --top 10 --min-impact critical
```

### Key flags

| Flag | Applies to | Default | Description |
|---|---|---|---|
| `--tags` | `dist`, `dev` | `21aa` | WCAG level: `2a` `2aa` `21aa` `22aa` |
| `--min-impact` | `dist`, `dev` | `serious` | Exit 1 if violations at or above this level |
| `--output` | `dist`, `dev` | _(none)_ | Write JSON report to this path |
| `--top` | `report` | _(all)_ | Show at most N violations, sorted critical → minor |

`--output` always writes two files: `report.json` (violations) and `report.pages.json` (all inspected pages). The summary block is near the top of `report.json` — read the first 30 lines to understand scope before loading the full file.

---

## License

Hippocratic License HL3 — see [LICENSE](LICENSE).
