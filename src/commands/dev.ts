import { defineCommand } from 'citty'
import { existsSync } from 'node:fs'
import { auditDev } from '../auditors/dev.ts'
import { printTerminal } from '../reporter/terminal.ts'
import { writeJson, writePagesList } from '../reporter/json.ts'
import { discoverFromDist } from '../discovery/from-dist.ts'
import { discoverFromConfig } from '../discovery/from-config.ts'
import { meetsThreshold } from '../utils/wcag.ts'
import type { Impact } from '../types.ts'

export const devCommand = defineCommand({
  meta: {
    name:        'dev',
    description: 'Audit a live dev server with Playwright + axe-core',
  },
  args: {
    url: {
      type:        'positional',
      description: 'Base URL of the dev server',
      default:     'http://localhost:4321',
    },
    dist: {
      type:        'string',
      description: 'Path to dist/ folder for URL discovery (primary strategy)',
      default:     './dist',
    },
    config: {
      type:        'string',
      description: 'Path to pages.ts config file (fallback when dist/ does not exist)',
      default:     './pages.ts',
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
    // Primary: derive URLs from dist/ HTML files (works for any static site generator).
    // Fallback: read a pages.ts config file — used when no dist build exists yet.
    const urls = existsSync(args.dist)
      ? await discoverFromDist(args.dist, args.url)
      : await discoverFromConfig(args.config, args.url)

    const pages = await auditDev(urls, args.tags)

    printTerminal('dev', args.url, pages)

    if (args.output) {
      await writeJson('dev', args.url, pages, args.output)
      await writePagesList('dev', args.url, pages, args.output)
      console.log(`JSON report written to ${args.output}`)
    }

    // Exit non-zero if any violation meets or exceeds --min-impact
    const minImpact = args['min-impact'] as Impact
    const shouldFail = pages.some(p =>
      p.violations.some(v => meetsThreshold(v.impact, minImpact))
    )

    if (shouldFail) process.exit(1)
  },
})
