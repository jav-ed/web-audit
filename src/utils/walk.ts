import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

// Async generator — yields absolute paths of all .html files under dir, recursively.
// Using a generator avoids loading the full file list into memory before processing starts,
// which matters when dist/ contains hundreds of files.
export async function* walkHtml(dir: string): AsyncGenerator<string> {
  const entries = await readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const full = join(dir, entry.name)

    if (entry.isDirectory()) {
      yield* walkHtml(full)
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      yield full
    }
  }
}
