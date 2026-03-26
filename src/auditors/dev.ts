import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'
import type { PageResult, Violation, ViolationNode, Impact } from '../types.ts'
import { wcagTags } from '../utils/wcag.ts'

function mapViolations(axeViolations: any[]): Violation[] {
  return axeViolations.map((v): Violation => ({
    id:          v.id,
    impact:      v.impact as Impact,
    // 'help' is axe-core's short description — consistent with the dist auditor
    description: v.help as string,
    helpUrl:     v.helpUrl as string,
    nodes:       (v.nodes as any[]).map((n): ViolationNode => ({
      html:           n.html as string,
      target:         n.target as string[],
      failureSummary: (n.failureSummary ?? '') as string,
    })),
  }))
}

// Launch a single browser, reuse one page for all URLs, then close.
// networkidle wait ensures Astro islands have hydrated before axe runs —
// load alone may fire before client-side components render their final DOM.
export async function auditDev(urls: string[], level = '21aa'): Promise<PageResult[]> {
  const tags = wcagTags(level)
  const results: PageResult[] = []

  const browser = await chromium.launch()

  try {
    const page = await browser.newPage()

    for (const url of urls) {
      await page.goto(url, { waitUntil: 'networkidle' })

      const axeResults = await new AxeBuilder({ page })
        .withTags(tags)
        .analyze()

      results.push({
        source:     url,
        violations: mapViolations(axeResults.violations),
      })
    }
  } finally {
    // Always close the browser — even if a page throws mid-audit
    await browser.close()
  }

  return results
}
