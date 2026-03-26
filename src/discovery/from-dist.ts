import { resolve, relative, sep } from 'node:path'
import { walkHtml } from '../utils/walk.ts'

// Convert a dist HTML file path to a URL path.
// Astro outputs index.html files for clean URLs, so we strip that suffix.
//   dist/index.html           → /
//   dist/en/about/index.html  → /en/about
//   dist/en/404.html          → /en/404  (non-index files kept as-is, minus .html)
function htmlPathToUrlPath(distDir: string, htmlFile: string): string {
  const rel = relative(distDir, htmlFile).split(sep).join('/')

  if (rel === 'index.html') return '/'
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'/index.html'.length)
  return '/' + rel.slice(0, -'.html'.length)
}

// Walk dist/ and build a full localhost URL for each HTML file.
// This is the primary discovery strategy for dev mode — it gives complete coverage
// across all routes and all language variants without needing to parse Astro source.
//
// Always emits a staleness warning — mtime comparison adds complexity for minimal gain
// and the dev is already running the audit, so a one-line reminder is sufficient.
export async function discoverFromDist(distDir: string, baseUrl: string): Promise<string[]> {
  const absDir = resolve(distDir)
  const base = baseUrl.replace(/\/$/, '')
  const urls: string[] = []

  for await (const file of walkHtml(absDir)) {
    const urlPath = htmlPathToUrlPath(absDir, file)
    urls.push(base + urlPath)
  }

  // Write to stderr so the warning doesn't pollute stdout or CI output
  process.stderr.write(`\n⚠  dist-derived URLs — run bun run build first if pages may have changed\n\n`)

  return urls
}
