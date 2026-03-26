import { defineCommand } from 'citty'
import { auditDist } from '../auditors/dist.ts'
import { printTerminal } from '../reporter/terminal.ts'
import { writeJson, writePagesList } from '../reporter/json.ts'
import { meetsThreshold } from '../utils/wcag.ts'
import type { Impact } from '../types.ts'

export const distCommand = defineCommand({
  meta: {
    name:        'dist',
    description: 'Audit built dist/ folder with axe-core + jsdom — no browser required',
  },
  args: {
    path: {
      type:        'positional',
      description: 'Path to the dist/ folder',
      default:     './dist',
    },
    tags: {
      type:        'string',
      description: 'WCAG level: 2a | 2aa | 21aa | 22aa',
      default:     '21aa',
    },
    'min-impact': {
      type:        'string',
      description: 'Exit 1 if any violation is at this level or above: minor | moderate | serious | critical',
      default:     'serious',
    },
    output: {
      type:        'string',
      description: 'Write JSON report to this file path',
      default:     '',
    },
  },
  async run({ args }) {
    const pages = await auditDist(args.path, args.tags)

    printTerminal('dist', args.path, pages)

    if (args.output) {
      await writeJson('dist', args.path, pages, args.output)
      await writePagesList('dist', args.path, pages, args.output)
      console.log(`JSON report written to ${args.output}`)
    }

    // Exit non-zero if any violation meets or exceeds --min-impact.
    // "meets or exceeds" means serious default also catches critical.
    const minImpact = args['min-impact'] as Impact
    const shouldFail = pages.some(p =>
      p.violations.some(v => meetsThreshold(v.impact, minImpact))
    )

    if (shouldFail) process.exit(1)
  },
})
