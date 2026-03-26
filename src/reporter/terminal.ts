import type { PageResult, Impact } from '../types.ts'
import { IMPACT_ORDER } from '../utils/wcag.ts'

// ANSI escape codes — defined inline to avoid a color library dependency
const c = {
  reset:     '\x1b[0m',
  bold:      '\x1b[1m',
  dim:       '\x1b[2m',
  red:       '\x1b[31m',
  yellow:    '\x1b[33m',
  green:     '\x1b[32m',
  brightRed: '\x1b[91m',
  cyan:      '\x1b[36m',
}

// Color each impact level for quick visual scanning
const IMPACT_COLOR: Record<Impact, string> = {
  critical: c.bold + c.brightRed,
  serious:  c.red,
  moderate: c.yellow,
  minor:    c.dim,
}

function colorImpact(impact: Impact): string {
  return `${IMPACT_COLOR[impact]}${impact}${c.reset}`
}

// Truncate long HTML snippets so they don't wrap and break the layout
function truncate(str: string, max = 100): string {
  return str.length > max ? str.slice(0, max - 1) + '…' : str
}

function printViolations(page: PageResult): void {
  const count = page.violations.length
  console.log(`\n  ${c.red}✗${c.reset}  ${c.bold}${page.source}${c.reset}  (${count} violation${count === 1 ? '' : 's'})`)

  // Sort critical → serious → moderate → minor so the worst violations appear first
  const sorted = [...page.violations].sort(
    (a, b) => IMPACT_ORDER.indexOf(b.impact) - IMPACT_ORDER.indexOf(a.impact)
  )

  for (const v of sorted) {
    console.log(`\n     ${colorImpact(v.impact)}  ${c.bold}${v.id}${c.reset}`)
    console.log(`     ${c.dim}${v.description}${c.reset}`)

    // Show up to 3 nodes — beyond that signal how many more exist
    const shown = v.nodes.slice(0, 3)
    const remaining = v.nodes.length - shown.length

    for (const node of shown) {
      console.log(`     ${c.dim}→${c.reset} ${truncate(node.html.trim())}`)
    }

    if (remaining > 0) {
      console.log(`     ${c.dim}  …and ${remaining} more node${remaining === 1 ? '' : 's'}${c.reset}`)
    }
  }
}

function buildSummary(pages: PageResult[]): string {
  const withViolations = pages.filter(p => p.violations.length > 0)
  const allViolations = pages.flatMap(p => p.violations)

  // Count violations per impact level for the breakdown line
  const counts = Object.fromEntries(IMPACT_ORDER.map(l => [l, 0])) as Record<Impact, number>
  for (const v of allViolations) counts[v.impact]++

  const breakdownParts = IMPACT_ORDER
    .filter(l => counts[l] > 0)
    .map(l => `${IMPACT_COLOR[l]}${l}: ${counts[l]}${c.reset}`)

  const lines = [
    `\n${'─'.repeat(56)}`,
    `  ${pages.length} pages  ·  ${withViolations.length} with violations  ·  ${allViolations.length} total violations`,
  ]
  if (breakdownParts.length > 0) lines.push(`  ${breakdownParts.join('  ')}`)

  return lines.join('\n')
}

// Main entry point for the terminal reporter.
// Only prints pages that have violations — clean pages are counted in the summary.
export function printTerminal(mode: 'dev' | 'dist', source: string, pages: PageResult[]): void {
  console.log(`\n${c.cyan}${mode} mode${c.reset} — ${source} — ${pages.length} pages\n`)

  const failing = pages.filter(p => p.violations.length > 0)

  if (failing.length === 0) {
    console.log(`  ${c.green}✓${c.reset}  No violations found`)
  } else {
    for (const page of failing) printViolations(page)
  }

  console.log(buildSummary(pages))
  console.log()
}
