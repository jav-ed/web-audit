# Learnings

Gotchas and post-fact notes discovered during development.

## axe-core in Bun — use axe.setup(), not script injection

**What failed:** Injecting axe-core's UMD browser bundle into a jsdom window via a `<script>` tag with `runScripts: 'dangerously'`. The script ran but `axe` was never set on `window` — Bun's `node:vm` support (which jsdom uses to execute scripts) is partial.

**What works:** axe-core's native Node.js API:
```typescript
axe.setup(dom.window.document)
const results = await axe.run(dom.window.document, { ... })
axe.teardown() // reset state between files
```

No script injection, no `runScripts: 'dangerously'`, no `readFileSync` of the bundle. `axe.teardown()` is important — it resets axe state to prevent cross-contamination between files when processing many HTML files in sequence.
