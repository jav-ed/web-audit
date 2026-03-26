export type Impact = 'minor' | 'moderate' | 'serious' | 'critical'

export interface ViolationNode {
  html: string
  // CSS selectors pointing to the offending element, from axe-core's target array
  target: string[]
  failureSummary: string
}

export interface Violation {
  id: string
  impact: Impact
  // Short description from axe-core's 'help' field — readable in terminal output
  description: string
  helpUrl: string
  nodes: ViolationNode[]
}

export interface PageResult {
  // URL in dev mode (e.g. http://localhost:4321/en/about)
  // Relative file path in dist mode (e.g. dist/en/about/index.html)
  source: string
  violations: Violation[]
}
