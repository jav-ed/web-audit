#!/usr/bin/env bun
import { defineCommand, runMain } from 'citty'
import { devCommand } from './commands/dev.ts'
import { distCommand } from './commands/dist.ts'
import { reportCommand } from './commands/report.ts'

const main = defineCommand({
  meta: {
    name:        'audit',
    description: 'Accessibility audit tool — dev mode (Playwright + axe) and dist mode (jsdom + axe)',
  },
  subCommands: {
    dev:    devCommand,
    dist:   distCommand,
    report: reportCommand,
  },
})

runMain(main)
