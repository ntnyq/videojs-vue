/* oxlint-disable node/no-sync -- Vue's imported-prop type resolver requires a synchronous filesystem adapter. */
import { existsSync, readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { parse, compileScript, compileTemplate } from 'vue/compiler-sfc'
import { messages } from '../../playground/src/locales'
import {
  UI_COMPONENTS,
  UI_RECIPES,
  findUiComponents,
} from '../../playground/src/ui-components/catalog'
import { thumbnails } from '../../playground/src/ui-components/fixtures'

const originalControls = new Set([
  'MediaContainer',
  'MediaControls',
  'MediaControlsContent',
  'MediaControlsGroup',
  'PlayButton',
  'MuteButton',
  'FullscreenButton',
  'PiPButton',
  'CaptionsButton',
  'CaptionsRadioGroup',
  'PlaybackRateButton',
  'PlaybackRateRadioGroup',
  'AudioTrackRadioGroup',
  'QualityRadioGroup',
  'MediaMenu',
  'MediaMenuContent',
  'SeekButton',
  'Time',
  'TimeSlider',
  'VolumeSlider',
  'SliderTrack',
  'SliderFill',
  'SliderBuffer',
  'SliderThumb',
  'Poster',
  'StatusAnnouncer',
  'Hotkey',
  'LiveButton',
])

describe('ui component recipes', () => {
  it('assigns every new public UI binding to exactly one working recipe', async () => {
    expect.hasAssertions()
    const exports = await readFile(path.resolve('src/ui/index.ts'), 'utf8')
    const additions = [...exports.matchAll(/(?<=export \{ )\w+(?= \} from)/gu)]
      .map(match => match[0])
      .filter(name => !originalControls.has(name))
    const names = UI_COMPONENTS.map(item => item.name)
    expect(names).toHaveLength(44)
    expect(new Set(names).size).toBe(names.length)
    expect(names.toSorted()).toStrictEqual(additions.toSorted())
  })

  it.each(UI_RECIPES)(
    'provides rendered parts and a compilable source for $id',
    async recipe => {
      expect.hasAssertions()
      const filename = path.resolve(
        'playground/src/ui-components',
        recipe.filename,
      )
      const source = await readFile(filename, 'utf8')
      const { descriptor, errors } = parse(source, { filename })
      expect(errors).toStrictEqual([])
      expect(() =>
        compileScript(descriptor, {
          id: recipe.id,
          fs: {
            fileExists: existsSync,
            readFile: sourcePath => readFileSync(sourcePath, 'utf8'),
          },
        }),
      ).not.toThrow()
      const template = compileTemplate({
        id: recipe.id,
        filename,
        source: descriptor.template!.content,
      })
      expect(template.errors).toStrictEqual([])
      for (const name of recipe.components) {
        expect(source).toContain(`import { ${name} } from 'videojs-vue/ui/`)
        expect(descriptor.template!.content).toContain(`<${name}`)
      }
    },
  )

  it('filters by PascalCase name, kebab-case entry, and category without losing empty results', () => {
    expect.hasAssertions()
    expect(
      findUiComponents('  SLIDER-preview  ').map(item => item.name),
    ).toStrictEqual(['SliderPreview'])
    expect(
      findUiComponents('media-dialog-close').map(item => item.name),
    ).toStrictEqual(['MediaDialogClose'])
    expect(findUiComponents('', 'remote').map(item => item.name)).toStrictEqual(
      ['AirPlayButton', 'CastButton'],
    )
    expect(findUiComponents('Tooltip', 'remote')).toStrictEqual([])
    expect(findUiComponents('does-not-exist')).toStrictEqual([])
    expect(findUiComponents('')).toHaveLength(44)
  })

  it('provides contiguous local thumbnail ranges matching the chapter fixture', async () => {
    expect.hasAssertions()
    const chapters = await readFile(
      path.resolve('playground/public/ui-chapters.vtt'),
      'utf8',
    )
    const sprite = await readFile(
      path.resolve('playground/public/ui-thumbnails.svg'),
      'utf8',
    )
    expect(chapters).toMatch(/^WEBVTT/u)
    expect(chapters.match(/ --> /gu)).toHaveLength(4)
    expect(thumbnails.map(item => item.startTime)).toStrictEqual([0, 8, 18, 28])
    expect(thumbnails.every(item => item.url === '/ui-thumbnails.svg')).toBe(
      true,
    )
    expect(sprite).toContain('width="640"')
    expect(thumbnails.slice(0, -1).map(item => item.endTime)).toStrictEqual(
      thumbnails.slice(1).map(item => item.startTime),
    )
    for (const [index, thumbnail] of thumbnails.entries()) {
      expect(thumbnail.width).toBe(160)
      expect(thumbnail.height).toBe(90)
      expect(thumbnail.coords?.x).toBe(index * 160)
    }
  })

  it.each(Object.entries(messages))(
    'provides navigation and recipe instructions in %s',
    (_locale, translation) => {
      expect.hasAssertions()
      expect(
        translation.examples['ui-components'].title.length,
      ).toBeGreaterThan(0)
      expect(translation.uiComponents.search.length).toBeGreaterThan(0)
      for (const recipe of UI_RECIPES) {
        expect(
          translation.uiComponents.groups[recipe.id].title.length,
        ).toBeGreaterThan(0)
        expect(
          translation.uiComponents.groups[recipe.id].hint.length,
        ).toBeGreaterThan(0)
      }
    },
  )
})
