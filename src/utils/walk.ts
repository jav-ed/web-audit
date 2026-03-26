// Async generator using Bun.Glob — yields absolute paths of all .html files under dir, recursively.
// Bun.Glob replaces the manual readdir recursion and is native to the runtime.
export async function* walkHtml(dir: string): AsyncGenerator<string> {
  const glob = new Bun.Glob('**/*.html')
  yield* glob.scan({ cwd: dir, absolute: true })
}
