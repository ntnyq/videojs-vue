// @vitest-environment node
import { readFile } from 'node:fs/promises'
import { runInNewContext } from 'node:vm'
import { rolldown } from 'rolldown'
import { describe, expect, it } from 'vitest'

describe('published legacy entry', () => {
  it('keeps opt-in polyfills after consumer tree shaking and restores missing APIs', async () => {
    expect.hasAssertions()
    const bundle = await rolldown({
      input: 'legacy-polyfill-consumer',
      plugins: [
        {
          name: 'legacy-polyfill-consumer',
          resolveId(id) {
            // oxlint-disable-next-line vitest/no-conditional-in-test -- Only resolve the virtual consumer; dependencies use normal resolution.
            if (id === 'legacy-polyfill-consumer') {
              return id
            }
            return null
          },
          load(id) {
            // oxlint-disable-next-line vitest/no-conditional-in-test -- Only resolve the virtual consumer; dependencies use normal resolution.
            if (id === 'legacy-polyfill-consumer') {
              return "import 'videojs-vue/polyfills'"
            }
            return null
          },
        },
      ],
      platform: 'browser',
      transform: { target: 'chrome90' },
    })
    try {
      const { output } = await bundle.generate({ format: 'iife' })
      const code = output
        .filter(item => item.type === 'chunk')
        .map(item => item.code)
        .join('\n')
      const result = runInNewContext(`
        delete Array.prototype.at;
        delete Object.hasOwn;
        ${code}
        JSON.stringify([
          [1, 2].at(-1), [].at(0),
          Object.hasOwn(Object.create(null, { a: { value: 1 } }), 'a'),
          Object.hasOwn({}, 'toString'),
          Object.getOwnPropertyDescriptor(Array.prototype, 'at').enumerable
        ])
      `)
      expect(JSON.parse(result)).toStrictEqual([2, null, true, false, false])
    } finally {
      await bundle.close()
    }
  })

  it('bundles upstream for Chrome 90 without modern skins, HLS or implicit global polyfills', async () => {
    expect.hasAssertions()
    const bundle = await rolldown({
      input: 'videojs-vue/video/legacy',
      external: ['vue'],
      platform: 'browser',
      transform: { target: 'chrome90' },
    })
    try {
      const { output } = await bundle.generate({ format: 'esm' })
      const chunks = output.filter(item => item.type === 'chunk')
      const modules = chunks.flatMap(chunk =>
        Object.keys(chunk.modules).map(id =>
          id.slice(id.lastIndexOf('node_modules/') + 13),
        ),
      )
      expect(modules.some(id => id.includes('/define/video/player.js'))).toBe(
        true,
      )
      expect(
        modules.some(id =>
          /(?:compat-skin|neutral-skin|\/video\/skin\/|hlsjs-video|core-js)/u.test(
            id,
          ),
        ),
      ).toBe(false)
      expect(chunks.map(chunk => chunk.code).join('\n')).not.toMatch(
        /static\s*\{/u,
      )
      const css = await readFile(
        new URL('../../dist/skins/legacy.css', import.meta.url),
        'utf8',
      )
      expect(css).toContain('.vjs-legacy')
      expect(css).not.toMatch(
        /@(?:layer|container|scope)|:has\(|(?:oklch|color-mix)\(|\d+cq[whib]/u,
      )
    } finally {
      await bundle.close()
    }
  })
})
