import { mkdir } from 'node:fs/promises'
import { dirname, extname } from 'node:path'
import type { PageResult, Violation, ViolationNode } from '../types.ts'

// Nodes per violation written to JSON — enough to identify the pattern, not every instance.
// totalNodes on each violation tells you how many elements were actually affected.
const MAX_NODES = 5

// html snippets can be very long (full element with all attributes and classes).
// target (CSS selector) is kept fully intact — that's what you actually use to locate the element.
// html is visual context only, so truncating it loses nothing critical.
const MAX_HTML = 200

interface JsonNode {
  target: string[]   // CSS selector — complete, not truncated
  html: string       // truncated at MAX_HTML chars; use target to locate the element
  failureSummary: string
}

interface JsonViolation {
  id: string
  impact: string
  description: string
  helpUrl: string
  totalNodes: number  // total affected elements, including those not shown
  nodes: JsonNode[]
}

interface JsonPage {
  source: string
  violations: JsonViolation[]
}

interface JsonReport {
  generatedAt: string
  mode: 'dev' | 'dist'
  source: string
  note: string
  summary: {
    totalPages: number
    pagesWithViolations: number
    totalViolations: number
  }
  pages: JsonPage[]
}

interface PagesListReport {
  generatedAt: string
  mode: 'dev' | 'dist'
  source: string
  totalPages: number
  // All inspected pages — use this file to verify discovery coverage
  pages: string[]
}

function truncateHtml(html: string): string {
  return html.length > MAX_HTML ? html.slice(0, MAX_HTML) + '…' : html
}

function mapViolation(v: Violation): JsonViolation {
  return {
    id:          v.id,
    impact:      v.impact,
    description: v.description,
    helpUrl:     v.helpUrl,
    totalNodes:  v.nodes.length,
    // Cap nodes — totalNodes above tells you if more exist
    nodes: v.nodes.slice(0, MAX_NODES).map((n: ViolationNode): JsonNode => ({
      target:         n.target,
      html:           truncateHtml(n.html.trim()),
      failureSummary: n.failureSummary,
    })),
  }
}

// Derive the pages list filename from the main report path.
// e.g. ./reports/audit.json → ./reports/audit.pages.json
// This ensures the main report always sorts first alphabetically.
function pagesListPath(outputPath: string): string {
  const ext = extname(outputPath)
  return outputPath.slice(0, -ext.length) + '.pages' + ext
}

// Write the main violations report.
// Only includes pages that have violations — clean pages are counted in summary only.
// Agent convention: this is the primary file; read it first.
export async function writeJson(
  mode: 'dev' | 'dist',
  source: string,
  pages: PageResult[],
  outputPath: string,
): Promise<void> {
  const withViolations = pages.filter(p => p.violations.length > 0)

  const report: JsonReport = {
    generatedAt: new Date().toISOString(),
    mode,
    source,
    note: `Pages list (all inspected pages) is in ${pagesListPath(outputPath)}`,
    summary: {
      totalPages:          pages.length,
      pagesWithViolations: withViolations.length,
      totalViolations:     pages.reduce((n, p) => n + p.violations.length, 0),
    },
    // Violations-only — clean pages excluded to keep this file compact
    pages: withViolations.map(p => ({
      source:     p.source,
      violations: p.violations.map(mapViolation),
    })),
  }

  await mkdir(dirname(outputPath), { recursive: true })
  await Bun.write(outputPath, JSON.stringify(report, null, 2))
}

// Write the pages list — all inspected pages regardless of violations.
// Use this file to verify that URL discovery found all expected pages.
export async function writePagesList(
  mode: 'dev' | 'dist',
  source: string,
  pages: PageResult[],
  outputPath: string,
): Promise<void> {
  const report: PagesListReport = {
    generatedAt: new Date().toISOString(),
    mode,
    source,
    totalPages: pages.length,
    pages: pages.map(p => p.source),
  }

  // mkdir already called by writeJson — both files share the same directory
  await Bun.write(pagesListPath(outputPath), JSON.stringify(report, null, 2))
}
