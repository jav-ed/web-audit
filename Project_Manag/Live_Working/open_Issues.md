# Open Issues

## Open

_(none)_

## Resolved

**1. JSON report files too long** — violations-only pages, nodes capped at 5, html truncated at 200 chars, pages list split into `<name>.pages.json`. See `reporter/json.ts`.

**2. Clear docs on CLI input/output** — terminal output format and full JSON schema documented in `usage.md` under "Terminal output format" and "JSON schema".

**3. `--help` per subcommand** — verified: `audit --help`, `audit dev --help`, `audit dist --help` all work via citty. Surfaced in `usage.md` under "--help".

**4. Agent summary convention** — documented in `usage.md` under "Reading a report as an agent": read lines 1–30 for summary, use `audit report` for triage.

**5. `report` subcommand** — `audit report <json-file> [--top N] [--min-impact <level>]`. Reads a saved JSON, filters by impact, caps to N violations sorted critical→minor. `src/commands/report.ts`, registered in `src/index.ts`.
