import { readFile } from 'node:fs/promises'
import { relative, resolve } from 'node:path'
import { JSDOM, VirtualConsole } from 'jsdom'
import axe from 'axe-core'
import type { PageResult, Violation, ViolationNode, Impact } from '../types.ts'
import { walkHtml } from '../utils/walk.ts'
import { wcagTags } from '../utils/wcag.ts'

// Rules disabled in dist mode because jsdom has no CSS engine.
// These rules query computed styles and always produce false positives without real rendering.
const DISABLED_RULES: Record<string, { enabled: false }> = {
  'color-contrast':      { enabled: false },
  'link-in-text-block':  { enabled: false },
}

function mapViolations(axeViolations: any[]): Violation[] {
  return axeViolations.map((v): Violation => ({
    id:          v.id,
    impact:      v.impact as Impact,
    // 'help' is axe-core's short description — more readable in terminal than 'description'
    description: v.help as string,
    helpUrl:     v.helpUrl as string,
    nodes:       (v.nodes as any[]).map((n): ViolationNode => ({
      html:           n.html as string,
      target:         n.target as string[],
      failureSummary: (n.failureSummary ?? '') as string,
    })),
  }))
}

async function auditFile(htmlPath: string, tags: string[], absDistDir: string): Promise<PageResult> {
  const html = await readFile(htmlPath, 'utf-8')

  // Suppress jsdom noise — we only care about DOM structure, not missing resources or CSS
  const virtualConsole = new VirtualConsole()

  const dom = new JSDOM(html, {
    // url is required by axe-core for certain checks (landmark rules, base URL resolution)
    url: 'http://localhost/',
    virtualConsole,
  })

  // axe.setup() hands axe-core the jsdom document directly — no script injection needed.
  // This is the correct Node/Bun approach; script injection via runScripts:'dangerously'
  // relies on node:vm which has partial support in Bun.
  axe.setup(dom.window.document)

  try {
    const axeResults = await axe.run(dom.window.document, {
      runOnly: { type: 'tag', values: tags },
      rules:   DISABLED_RULES,
    })

    // Use the relative path from dist root as the source label — cleaner than absolute paths in output
    const source = relative(absDistDir, htmlPath)

    return { source, violations: mapViolations(axeResults.violations) }
  } finally {
    // teardown resets axe state between files — prevents cross-contamination
    axe.teardown()
  }
}

// Walk every HTML file in distDir and run axe on each via jsdom.
// No browser, no server — purely offline. Covers all pages × all languages in one pass.
export async function auditDist(distDir: string, level = '21aa'): Promise<PageResult[]> {
  const tags = wcagTags(level)
  const absDir = resolve(distDir)
  const results: PageResult[] = []

  for await (const file of walkHtml(absDir)) {
    const result = await auditFile(file, tags, absDir)
    results.push(result)
  }

  return results
}
