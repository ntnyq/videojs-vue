/* oxlint-disable node/no-top-level-await, node/no-sync -- This ESM CLI reports deterministic gzip sizes from a completed Vite build. */
import assert from 'node:assert/strict'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { gzipSync } from 'node:zlib'
import { formatBytes } from './formatBytes'

interface ManifestChunk {
  file: string
  imports: string[]
  isDynamicEntry: boolean
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseManifest(value: unknown): Map<string, ManifestChunk> {
  assert.ok(isRecord(value), 'Invalid Vite manifest')
  const chunks = new Map<string, ManifestChunk>()
  for (const [key, entry] of Object.entries(value)) {
    assert.ok(isRecord(entry), `Invalid manifest entry: ${key}`)
    const { file } = entry
    const imports = entry['imports'] ?? []
    const isDynamicEntry = entry['isDynamicEntry'] ?? false
    assert.ok(typeof file === 'string', `Missing manifest file: ${key}`)
    assert.ok(
      Array.isArray(imports) &&
        imports.every((item: unknown) => typeof item === 'string'),
      `Invalid manifest imports: ${key}`,
    )
    assert.ok(
      typeof isDynamicEntry === 'boolean',
      `Invalid dynamic entry flag: ${key}`,
    )
    chunks.set(key, { file, imports, isDynamicEntry })
  }
  return chunks
}

const manifest = parseManifest(
  JSON.parse(await readFile('playground/dist/.vite/manifest.json', 'utf8')),
)
const initial = new Set<string>()

function getChunk(key: string): ManifestChunk {
  const chunk = manifest.get(key)
  assert.ok(chunk, `Missing manifest entry: ${key}`)
  return chunk
}

function visit(key: string): void {
  if (initial.has(key)) {
    return
  }
  initial.add(key)
  for (const imported of getChunk(key).imports) {
    visit(imported)
  }
}

visit('index.html')
const asyncEntries = [...manifest.keys()].filter(
  key => getChunk(key).isDynamicEntry,
)
for (const example of [
  'AudioDemo.tsx',
  'CustomPlayerDemo.tsx',
  'media/hls.js',
]) {
  const key = asyncEntries.find(entry => entry.endsWith(example))
  assert.ok(key, `Missing async example: ${example}`)
  assert.ok(!initial.has(key), `${example} entered the initial graph`)
}
const files = [...new Set([...initial].map(key => getChunk(key).file))]
const sizes = await Promise.all(
  files.map(async file => {
    const code = await readFile(`playground/dist/${file}`)
    return {
      file,
      bytes: code.length,
      gzip: gzipSync(code, { level: 9 }).length,
    }
  }),
)
const report = {
  initial: sizes,
  initialGzip: sizes.reduce((total, item) => total + item.gzip, 0),
  asyncEntries,
}
await mkdir('.cache/bundle-size', { recursive: true })
await writeFile(
  '.cache/bundle-size/playground.json',
  `${JSON.stringify(report, null, 2)}\n`,
)
console.table(
  sizes.map(({ file, bytes, gzip }) => ({
    file,
    size: formatBytes(bytes),
    gzip: formatBytes(gzip),
  })),
)
console.log(
  `Default page initial JS: ${formatBytes(report.initialGzip)} gzip (including Vue and demo UI)`,
)
