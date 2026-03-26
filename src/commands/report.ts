import { defineCommand } from 'citty'
import { readFile } from 'node:fs/promises'
import { meetsThreshold, IMPACT_ORDER } from '../utils/wcag.ts'
import type { Impact } from '../types.ts'

// ANSI escape codes — duplicated from terminal.ts to keep reporters independent
const c = {
  reset:     '\x1b[0m',
  bold:      '\x1b[1m',
  dim:       '\x1b[2m',
  red:       '\x1b[31m',
  yellow:    '\x1b[33m',
  cyan:      '\x1b[36m',
  brightRed: '\x1b[91m',
}

const IMPACT_COLOR: Record<Impact, string> = {
  critical: c.bold + c.brightRed,
  serious:  c.red,
  moderate: c.yellow,
  minor:    c.dim,
}

export const reportCommand = defineCommand({
  meta: {
    name:        'report',
    description: 'Read and filter a saved JSON report — no re-crawl needed',
  },
  args: {
    file: {
      type:        'positional',
      description: 'Path to the report .json file',
      required:    true,
    },
    top: {
      type:        'string',
      description: 'Show at most N violations, sorted critical → minor (default: all)',
      default:     '',
    },
    'min-impact': {
      type:        'string',
      description: 'Skip violations below this level: minor | moderate | serious | critical (default: minor = show all)',
      default:     'minor',
    },
  },
  async run({ args }) {
    const raw = await readFile(args.file, 'utf-8').catch(() => {
      console.error(`Cannot read file: ${args.file}`)
      process.exit(1)
    })

    const report = JSON.parse(raw as string)
    const minImpact = args['min-impact'] as Impact
    const topN = args.top ? parseInt(args.top, 10) : Infinity

    // Flatten ALL violations first (before any filter) — needed for the full breakdown
    type FlatViolation = { page: string; id: string; impact: Impact; description: string; totalNodes: number }
    const everything: FlatViolation[] = []
    for (const page of report.pages) {
      for (const v of page.violations) {
        everything.push({ page: page.source, id: v.id, impact: v.impact, description: v.description, totalNodes: v.totalNodes })
      }
    }

    // Full breakdown by impact — always shown so no level is invisible
    const breakdown = Object.fromEntries(IMPACT_ORDER.map(l => [l, 0])) as Record<Impact, number>
    for (const v of everything) breakdown[v.impact]++

    // Apply filter, sort critical → minor, apply --top cap
    const filtered = everything.filter(v => meetsThreshold(v.impact, minImpact))
    filtered.sort((a, b) => IMPACT_ORDER.indexOf(b.impact) - IMPACT_ORDER.indexOf(a.impact))

    const shown = filtered.slice(0, topN)
    const truncated = filtered.length - shown.length
    const hiddenByFilter = everything.length - filtered.length

    // Header
    console.log(`\n${c.cyan}report${c.reset} — ${args.file}`)
    console.log(`${c.dim}Generated: ${report.generatedAt}  ·  Mode: ${report.mode}  ·  Source: ${report.source}${c.reset}`)
    console.log(`\nSummary: ${report.summary.totalPages} pages  ·  ${report.summary.pagesWithViolations} with violations  ·  ${report.summary.totalViolations} total\n`)

    if (shown.length === 0) {
      console.log(`  No violations match the filter.\n`)
    } else {
      for (const v of shown) {
        const color = IMPACT_COLOR[v.impact]
        console.log(`  ${color}${v.impact}${c.reset}  ${c.bold}${v.id}${c.reset}  ${c.dim}(${v.totalNodes} node${v.totalNodes === 1 ? '' : 's'})${c.reset}`)
        console.log(`  ${c.dim}${v.description}${c.reset}`)
        console.log(`  ${c.dim}→ ${v.page}${c.reset}\n`)
      }

      if (truncated > 0) {
        console.log(`  ${c.dim}…and ${truncated} more not shown — increase --top to see them${c.reset}\n`)
      }
    }

    // Footer — always shows full breakdown so nothing is invisible
    const breakdownStr = IMPACT_ORDER
      .map(l => `${IMPACT_COLOR[l]}${l}: ${breakdown[l]}${c.reset}`)
      .join('  ')

    console.log(`${'─'.repeat(56)}`)
    console.log(`  All violations: ${breakdownStr}`)

    const filterNote = minImpact !== 'minor' ? ` at ${minImpact}+` : ''
    const truncNote = truncated > 0 ? ` (showing first ${shown.length})` : ''
    if (hiddenByFilter > 0) {
      console.log(`  Showing ${shown.length} of ${filtered.length}${filterNote}${truncNote}  ·  ${c.dim}${hiddenByFilter} below threshold not shown${c.reset}`)
    } else {
      console.log(`  Showing ${shown.length} of ${everything.length}${truncNote}`)
    }
    console.log()
  },
})
