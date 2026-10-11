/* oxlint-disable no-await-in-loop, node/no-top-level-await, node/no-sync -- This ESM CLI measures builds sequentially and uses deterministic gzip sizes. */
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { gzipSync } from 'node:zlib'
import { rolldown } from 'rolldown'
import type { OutputChunk } from 'rolldown'
import budgetConfig from '../benchmarks/budgets.json'

interface BundleMetrics {
  bytes: number
  gzip: number
  chunks: number
}

interface BundleReport {
  initial: BundleMetrics
  async: BundleMetrics
  total: BundleMetrics
  initialModules: string[]
  asyncModules: string[]
  graph: { file: string; imports: string[]; dynamicImports: string[] }[]
}

const isBaseline = process.argv.includes('--baseline')
const shouldCheck = process.argv.includes('--check')
const videoCore = isBaseline ? 'videojs-vue' : 'videojs-vue/core'
const videoComposables = isBaseline ? 'videojs-vue' : 'videojs-vue/composables'
const audioCore = isBaseline ? 'videojs-vue/audio' : 'videojs-vue/audio/core'
const audioComposables = isBaseline
  ? 'videojs-vue/audio'
  : 'videojs-vue/audio/composables'
const video = isBaseline ? 'videojs-vue' : 'videojs-vue/video/default'
const audio = isBaseline ? 'videojs-vue/audio' : 'videojs-vue/audio/default'
const cases = {
  videoState: `export { usePlayerState } from '${videoComposables}'`,
  audioState: `export { useAudioPlayerState } from '${audioComposables}'`,
  videoCore: `export { PlayerRoot, Video } from '${videoCore}'; export { usePlayerState, usePlayerActions } from '${videoComposables}'`,
  audioCore: `export { AudioPlayerRoot, Audio } from '${audioCore}'; export { useAudioPlayerState, useAudioPlayerActions } from '${audioComposables}'`,
  videoDefault: `export { VideoPlayer } from '${video}'`,
  audioDefault: `export { AudioPlayer } from '${audio}'`,
  videoLegacy: "export { VideoPlayer } from 'videojs-vue'",
  audioLegacy: "export { AudioPlayer } from 'videojs-vue/audio'",
  mixed: `export { VideoPlayer } from '${video}'; export { AudioPlayer } from '${audio}'`,
  playButton: `export { PlayButton } from '${isBaseline ? 'videojs-vue/ui' : 'videojs-vue/ui/play-button'}'`,
  hlsStatic: `export { VideoPlayer } from '${video}'; export { HlsVideo } from 'videojs-vue/media/hls'`,
  hlsDynamic: `export { VideoPlayer } from '${video}'; export const loadHls = () => import('videojs-vue/media/hls')`,
  i18n: "export { MediaI18n, MediaText, registerI18n } from 'videojs-vue/i18n'",
  ...(!isBaseline && {
    videoNeutral: "export { VideoPlayer } from 'videojs-vue/video/neutral'",
    audioNeutral: "export { AudioPlayer } from 'videojs-vue/audio/neutral'",
  }),
}

const root = process.cwd()
const directory = path.resolve('.cache/bundle-size')
await mkdir(directory, { recursive: true })
const report: Record<string, BundleReport> = {}
const hlsPattern = /(?:hls\.js|hlsjs-video)/u
const skinPattern = /(?:skin|skins)/u
const budgets = new Map(Object.entries(budgetConfig))

const metrics = (items: readonly OutputChunk[]): BundleMetrics => ({
  bytes: items.reduce((total, item) => total + Buffer.byteLength(item.code), 0),
  gzip: items.reduce(
    (total, item) => total + gzipSync(item.code, { level: 9 }).length,
    0,
  ),
  chunks: items.length,
})
const modules = (items: readonly OutputChunk[]): string[] =>
  [...new Set(items.flatMap(item => Object.keys(item.modules)))]
    .map(id => {
      const normalized = path.relative(root, id).replaceAll('\\', '/')
      const dependency = normalized.lastIndexOf('node_modules/')
      return dependency === -1 ? normalized : normalized.slice(dependency)
    })
    .toSorted()

for (const [name, code] of Object.entries(cases)) {
  const input = path.resolve(directory, `${name}.js`)
  // Real package imports resolve exports and dist, without source aliases.
  await writeFile(input, code)
  const bundle = await rolldown({
    input,
    platform: 'browser',
    external: ['vue'],
    transform: { define: { 'process.env.NODE_ENV': '"production"' } },
    onwarn(warning) {
      throw new Error(warning.message)
    },
  })
  try {
    const { output } = await bundle.generate({ format: 'esm', minify: true })
    const chunks = output.filter(item => item.type === 'chunk')
    const byName = new Map(chunks.map(chunk => [chunk.fileName, chunk]))
    const initial = new Set<string>()
    const visit = (chunk: OutputChunk): void => {
      if (initial.has(chunk.fileName)) {
        return
      }
      initial.add(chunk.fileName)
      for (const imported of chunk.imports) {
        const dependency = byName.get(imported)
        if (dependency) {
          visit(dependency)
        }
      }
    }
    for (const chunk of chunks.filter(item => item.isEntry)) {
      visit(chunk)
    }
    const initialChunks = chunks.filter(item => initial.has(item.fileName))
    const asyncChunks = chunks.filter(item => !initial.has(item.fileName))
    const initialModules = modules(initialChunks)
    const allModules = modules(chunks)
    const result: BundleReport = {
      initial: metrics(initialChunks),
      async: metrics(asyncChunks),
      total: metrics(chunks),
      initialModules,
      asyncModules: modules(asyncChunks),
      graph: chunks.map(chunk => ({
        file: chunk.fileName,
        imports: chunk.imports,
        dynamicImports: chunk.dynamicImports,
      })),
    }
    report[name] = result
    if (shouldCheck) {
      const budget = budgets.get(name)
      assert.ok(budget, `Missing bundle budget: ${name}`)
      const required = []
      if (name.startsWith('video') && !name.endsWith('State')) {
        required.push('video/player')
      }
      if (name.startsWith('audio') && !name.endsWith('State')) {
        required.push('audio/player')
      }
      if (name.endsWith('Default')) {
        required.push(`${name.startsWith('video') ? 'video' : 'audio'}/skin`)
      }
      if (name.endsWith('Neutral')) {
        required.push(
          `${name.startsWith('video') ? 'video' : 'audio'}/neutral-skin`,
        )
      }
      if (name.endsWith('Legacy')) {
        const media = name.startsWith('video') ? 'video' : 'audio'
        required.push(`${media}/skin`, `${media}/neutral-skin`)
      }
      if (name === 'playButton') {
        required.push('ui/play-button')
      }
      if (name === 'mixed') {
        required.push(
          'video/player',
          'audio/player',
          'video/skin',
          'audio/skin',
        )
      }
      if (name.startsWith('hls')) {
        required.push('video/player', 'video/skin')
      }
      for (const registration of required) {
        assert.ok(
          initialModules.some(id => id.endsWith(`/define/${registration}.js`)),
          `${name} lost ${registration} registration`,
        )
      }

      for (const phase of ['initial', 'async', 'total'] as const) {
        assert.ok(
          result[phase].gzip <= budget[phase],
          `${name} ${phase} exceeds gzip budget: ${result[phase].gzip} > ${budget[phase]}`,
        )
      }
      assert.ok(
        !allModules.some(id => id.startsWith('src/')),
        `${name} must consume dist`,
      )
      if (!name.startsWith('hls')) {
        assert.ok(
          !allModules.some(id => hlsPattern.test(id)),
          `${name} includes HLS`,
        )
      }
      if (name === 'hlsDynamic') {
        assert.ok(
          !initialModules.some(id => hlsPattern.test(id)),
          'HLS entered the initial graph',
        )
        assert.ok(
          modules(asyncChunks).some(id => hlsPattern.test(id)),
          'Missing async HLS engine',
        )
      }
      if (name === 'hlsStatic') {
        assert.ok(
          initialModules.some(id => hlsPattern.test(id)),
          'Missing static HLS engine',
        )
      }
      if (/(?:State|Core)$/u.test(name)) {
        assert.ok(
          !allModules.some(id => skinPattern.test(id)),
          `${name} includes skins`,
        )
      }
      if (name.endsWith('State')) {
        assert.ok(
          !allModules.some(id => id.includes('node_modules/')),
          `${name} includes upstream runtime`,
        )
      }
      if (name.startsWith('video')) {
        assert.ok(
          !allModules.some(id => /@videojs\/html\/.*\/audio\//u.test(id)),
          `${name} includes audio`,
        )
      }
      if (name.startsWith('audio')) {
        assert.ok(
          !allModules.some(id => /@videojs\/html\/.*\/video\//u.test(id)),
          `${name} includes video`,
        )
      }
      if (name.endsWith('Default')) {
        assert.ok(
          !allModules.some(id => id.includes('neutral-skin')),
          `${name} includes neutral skin`,
        )
      }
      if (name.endsWith('Neutral')) {
        assert.ok(
          !allModules.some(id => /\/(?:video|audio)\/skin\//u.test(id)),
          `${name} includes default skin`,
        )
      }
      if (name === 'playButton') {
        assert.ok(
          !allModules.some(id =>
            /\/ui\/(?:time-slider|volume-slider|fullscreen-button)\//u.test(id),
          ),
          'PlayButton includes unrelated controls',
        )
      }
    }
  } finally {
    await bundle.close()
  }
}

await writeFile(
  path.resolve(directory, 'report.json'),
  `${JSON.stringify(report, null, 2)}\n`,
)
const summary = Object.fromEntries(
  Object.entries(report).map(([name, { initial, async, total }]) => [
    name,
    { initial, async, total },
  ]),
)
if (isBaseline) {
  await mkdir('benchmarks', { recursive: true })
  await writeFile(
    'benchmarks/baseline.json',
    `${JSON.stringify(summary, null, 2)}\n`,
  )
}
console.table(
  Object.fromEntries(
    Object.entries(summary).map(([name, result]) => [
      name,
      {
        initialGzip: result.initial.gzip,
        asyncGzip: result.async.gzip,
        totalGzip: result.total.gzip,
      },
    ]),
  ),
)
console.log('Full module and chunk report: .cache/bundle-size/report.json')
