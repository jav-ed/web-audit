import { resolve } from 'node:path'

// Load a pages.ts config file and return fully-qualified URLs.
//
// The config file must export a default that is either:
//   string[]                    — static list of URL paths, e.g. ['/en/about', '/en/contact']
//   () => string[]              — function returning paths
//   () => Promise<string[]>     — async function, e.g. looping over languages × routes
//
// All paths are relative URL paths. This function prepends baseUrl to each.
// Example config (pages.ts):
//
//   const langs = ['en', 'de', 'fr', 'ar', 'ur']
//   const routes = ['/about', '/contact', '/']
//   export default () => langs.flatMap(l => routes.map(r => `/${l}${r}`))
export async function discoverFromConfig(configPath: string, baseUrl: string): Promise<string[]> {
  const absPath = resolve(process.cwd(), configPath)
  const mod = await import(absPath)
  const exported = mod.default as string[] | (() => string[] | Promise<string[]>)

  const paths: string[] = typeof exported === 'function'
    ? await exported()
    : exported

  const base = baseUrl.replace(/\/$/, '')
  return paths.map(p => base + p)
}
