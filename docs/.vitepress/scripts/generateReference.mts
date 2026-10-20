/* oxlint-disable import/no-nodejs-modules, node/no-top-level-await -- This standalone ESM script generates documentation in Node.js. */
import { fileURLToPath } from 'node:url'
import { Application } from 'typedoc'
import packageJson from '../../../package.json' with { type: 'json' }

const docsRoot = fileURLToPath(new URL('../../', import.meta.url))
const sourceRoot = fileURLToPath(new URL('../../../src/', import.meta.url))
const entryPoints = Object.entries(packageJson.exports).flatMap(
  ([subpath, entry]) => {
    if (typeof entry === 'string') {
      return []
    }

    const source = entry.types.replace('./dist/', '').replace(/\.d\.ts$/u, '')
    return [
      {
        source,
        name:
          subpath === '.'
            ? packageJson.name
            : `${packageJson.name}/${subpath.slice(2)}`,
      },
    ]
  },
)

const app = await Application.bootstrapWithPlugins({
  name: packageJson.name,
  entryPoints: entryPoints.map(entry => `${sourceRoot}${entry.source}.ts`),
  basePath: sourceRoot,
  sortEntryPoints: false,
  tsconfig: `${docsRoot}tsconfig.reference.json`,
  plugin: ['typedoc-plugin-markdown', 'typedoc-vitepress-theme'],
  out: `${docsRoot}reference/api`,
  docsRoot,
  readme: 'none',
  excludeInternal: true,
  excludeExternals: true,
  externalPattern: ['**/lib.dom.d.ts'],
  flattenOutputFiles: true,
  useCodeBlocks: false,
  hideBreadcrumbs: true,
  navigation: { includeFolders: false },
  validation: { notExported: false },
})

const project = await app.convert()
if (!project) {
  throw new Error('Failed to generate API Reference')
}

// Keep module titles aligned with the supported package import paths.
for (const entry of project.children ?? []) {
  const publicEntry = entryPoints.find(
    point => point.source.replace(/\/index$/u, '') === entry.name,
  )
  if (!publicEntry) {
    throw new Error(`Unknown API entry point: ${entry.name}`)
  }
  entry.name = publicEntry.name
}

app.validate(project)
if (app.logger.hasErrors()) {
  throw new Error('Invalid API Reference')
}
await app.generateOutputs(project)
if (app.logger.hasErrors()) {
  throw new Error('Failed to write API Reference')
}
