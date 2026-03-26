import type { Impact } from '../types.ts'

// axe-core uses additive tag sets — 'wcag21aa' only covers rules *new* in WCAG 2.1 AA.
// To audit full WCAG 2.1 AA compliance you need all three tags together.
// Each level here is cumulative, building on the levels below it.
const TAG_SETS: Record<string, string[]> = {
  '2a':   ['wcag2a'],
  '2aa':  ['wcag2a', 'wcag2aa'],
  '21aa': ['wcag2a', 'wcag2aa', 'wcag21aa'],
  '22aa': ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'],
}

export function wcagTags(level: string): string[] {
  const tags = TAG_SETS[level]
  if (!tags) throw new Error(`Unknown WCAG level: "${level}". Valid: ${Object.keys(TAG_SETS).join(', ')}`)
  return tags
}

// Impact levels ordered least → most severe.
// Used for --min-impact threshold comparisons ("this level and above").
export const IMPACT_ORDER: Impact[] = ['minor', 'moderate', 'serious', 'critical']

// Returns true if impact meets or exceeds the threshold.
// e.g. meetsThreshold('critical', 'serious') → true
//      meetsThreshold('moderate', 'serious') → false
export function meetsThreshold(impact: Impact, minImpact: Impact): boolean {
  return IMPACT_ORDER.indexOf(impact) >= IMPACT_ORDER.indexOf(minImpact)
}
