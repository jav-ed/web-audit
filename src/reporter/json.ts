import { writeFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import type { PageResult } from '../types.ts'

interface JsonReport {
  generatedAt: string
  mode: 'dev' | 'dist'
  source: string
  summary: {
    totalPages: number
    pagesWithViolations: number
    totalViolations: number
  }
  pages: PageResult[]
}

// Write a machine-readable JSON report to disk for CI artifact storage or post-processing.
// The report mirrors the terminal output structure so both consumers see the same data.
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
    summary: {
      totalPages:          pages.length,
      pagesWithViolations: withViolations.length,
      totalViolations:     pages.reduce((n, p) => n + p.violations.length, 0),
    },
    pages,
  }

  // Ensure the output directory exists — the user may pass a nested path that hasn't been created yet
  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, JSON.stringify(report, null, 2), 'utf-8')
}
