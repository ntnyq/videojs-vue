import type { MenuElement } from '@videojs/html'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, shallowRef } from 'vue'
import {
  CaptionsRadioGroup,
  MediaContainer,
  MediaMenu,
  MediaMenuContent,
  PlaybackRateButton,
  PlaybackRateRadioGroup,
} from '../../../src/ui'
import { Video, VideoPlayerRoot } from '../../../src/video/core'
import type {
  VideoPlayerHandle,
  VideoPlayerState,
} from '../../../src/video/core'
import { cleanup, mount, settle } from '../../helpers'

function formatTrackLanguage(track: { language: string }) {
  return track.language
}

function formatRateLabel(rate: number) {
  return `${rate}x`
}

describe('captions and playback rate controls', () => {
  afterEach(cleanup)

  it('selects subtitle languages and Off, follows external selection and hides without tracks', async () => {
    expect.hasAssertions()
    const player = shallowRef<VideoPlayerHandle | null>(null)
    const onChange = vi.fn()
    const { container } = mount(
      defineComponent(
        () => () =>
          h(
            VideoPlayerRoot,
            { ref: player },
            {
              default: () =>
                h(MediaContainer, null, {
                  default: () => [
                    h(Video),
                    h('button', { commandfor: 'captions-menu' }, 'Subtitles'),
                    h(
                      MediaMenu,
                      { id: 'captions-menu' },
                      {
                        default: () =>
                          h(MediaMenuContent, null, {
                            default: () =>
                              h(CaptionsRadioGroup, {
                                label: 'Subtitle language',
                                formatTrack: track => track.language,
                                'onValue-change': onChange,
                              }),
                          }),
                      },
                    ),
                  ],
                }),
            },
          ),
      ),
    )
    const media = container.querySelector('video')!
    const tracks: VideoPlayerState['textTrackList'] = []
    const textTracks = Object.assign(new EventTarget(), {
      length: 0,
      [Symbol.iterator]: () => tracks.values(),
    })
    tracks.push(
      ...['en', 'zh'].map(language => {
        let mode: TextTrackMode = 'disabled'
        return {
          id: language,
          kind: 'subtitles' as const,
          language,
          label: language,
          get mode() {
            return mode
          },
          set mode(value: TextTrackMode) {
            mode = value
            textTracks.dispatchEvent(new Event('change'))
          },
        }
      }),
    )
    Object.assign(textTracks, tracks, { length: tracks.length })
    Object.defineProperty(media, 'textTracks', { value: textTracks })
    await settle()
    const group = container.querySelector('media-captions-radio-group')!
    expect(group.getAttribute('aria-label')).toBe('Subtitle language')
    expect(group.querySelectorAll('[role="menuitemradio"]')).toHaveLength(3)
    expect(group.textContent).toContain('zh')
    group.querySelector<HTMLElement>('[data-track="zh"]')!.click()
    await settle()
    expect(tracks.map(track => track.mode)).toStrictEqual([
      'disabled',
      'showing',
    ])
    expect(player.value!.store!.subtitlesShowing).toBe(true)
    expect(
      group.querySelector('[data-track="zh"]')?.getAttribute('aria-checked'),
    ).toBe('true')
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { value: 'zh' } }),
    )
    player.value!.store!.selectSubtitlesTrack('en')
    await settle()
    expect(
      group.querySelector('[data-track="en"]')?.getAttribute('aria-checked'),
    ).toBe('true')
    group.querySelector<HTMLElement>('[data-track="off"]')!.click()
    await settle()
    expect(tracks.map(track => track.mode)).toStrictEqual([
      'disabled',
      'disabled',
    ])
    expect(player.value!.store!.subtitlesShowing).toBe(false)
    tracks.splice(0)
    textTracks.length = 0
    textTracks.dispatchEvent(new Event('removetrack'))
    await settle()
    expect(group.hidden).toBe(true)
    expect(
      container.querySelector<HTMLButtonElement>(
        '[commandfor="captions-menu"]',
      )!.hidden,
    ).toBe(true)
  })

  it('cycles playback rates and selects generated menu items with store-owned state', async () => {
    expect.hasAssertions()
    const player = shallowRef<VideoPlayerHandle | null>(null)
    const onChange = vi.fn()
    const { container } = mount(
      defineComponent(
        () => () =>
          h(
            VideoPlayerRoot,
            { ref: player },
            {
              default: () =>
                h(MediaContainer, null, {
                  default: () => [
                    h(Video),
                    h(
                      PlaybackRateButton,
                      { class: 'cycle' },
                      { default: () => 'Speed' },
                    ),
                    h(
                      PlaybackRateButton,
                      { commandfor: 'speed-menu' },
                      { default: () => 'Choose speed' },
                    ),
                    h(
                      MediaMenu,
                      { id: 'speed-menu' },
                      {
                        default: () =>
                          h(MediaMenuContent, null, {
                            default: () =>
                              h(PlaybackRateRadioGroup, {
                                'aria-label': 'Speed choices',
                                formatRate: rate => `${rate}x speed`,
                                'onValue-change': onChange,
                              }),
                          }),
                      },
                    ),
                  ],
                }),
            },
          ),
      ),
    )
    await settle()
    const media = container.querySelector('video')!
    const group = container.querySelector('media-playback-rate-radio-group')!
    const button = container.querySelector<HTMLElement>('.cycle')!
    expect(button.textContent).toBe('Speed')
    expect(group.getAttribute('aria-label')).toBe('Speed choices')
    expect(group.querySelectorAll('[role="menuitemradio"]')).toHaveLength(
      player.value!.store!.playbackRates.length,
    )
    expect(group.textContent).toContain('1.5x speed')
    const nextRate = player.value!.store!.playbackRates.find(
      rate => rate > media.playbackRate,
    )
    expect(nextRate).toBeDefined()
    button.click()
    await settle()
    expect(media.playbackRate).toBe(nextRate)
    expect(player.value!.store!.playbackRate).toBe(nextRate)
    expect(button.dataset['rate']).toBe(String(nextRate))
    group.querySelector<HTMLElement>('[data-rate="1.5"]')!.click()
    await settle()
    expect(media.playbackRate).toBe(1.5)
    expect(player.value!.store!.playbackRate).toBe(1.5)
    expect(
      group.querySelector('[data-rate="1.5"]')?.getAttribute('aria-checked'),
    ).toBe('true')
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { value: '1.5' } }),
    )
    player.value!.setPlaybackRate(2)
    await settle()
    expect(
      group.querySelector('[data-rate="2"]')?.getAttribute('aria-checked'),
    ).toBe('true')
    container.querySelector<HTMLElement>('[commandfor="speed-menu"]')!.click()
    await settle()
    expect(media.playbackRate).toBe(2)
    expect(container.querySelector<MenuElement>('media-menu')!.open).toBe(true)
    button.click()
    await settle()
    expect(media.playbackRate).toBe(player.value!.store!.playbackRates[0])
  })

  it('synchronizes optional props and restores constructor defaults when removed', async () => {
    expect.hasAssertions()
    const captionsProps = shallowRef<
      InstanceType<typeof CaptionsRadioGroup>['$props']
    >({
      disabled: true,
      label: 'Languages',
      formatTrack: formatTrackLanguage,
    })
    const rateProps = shallowRef<
      InstanceType<typeof PlaybackRateRadioGroup>['$props']
    >({
      disabled: true,
      formatRate: formatRateLabel,
    })
    const buttonProps = shallowRef<
      InstanceType<typeof PlaybackRateButton>['$props']
    >({
      disabled: true,
      label: 'Speed',
      commandfor: 'speed-menu',
    })
    const { container } = mount(
      defineComponent(
        () => () =>
          h(VideoPlayerRoot, null, {
            default: () => [
              h(Video),
              h(CaptionsRadioGroup, captionsProps.value),
              h(PlaybackRateRadioGroup, rateProps.value),
              h(PlaybackRateButton, buttonProps.value),
            ],
          }),
      ),
    )
    await settle()
    const captions = container.querySelector('media-captions-radio-group')!
    const rates = container.querySelector('media-playback-rate-radio-group')!
    const button = container.querySelector('media-playback-rate-button')!
    expect(captions.formatTrack).toBe(formatTrackLanguage)
    expect(captions.label).toBe('Languages')
    expect(captions.disabled).toBe(true)
    expect(rates.formatRate).toBe(formatRateLabel)
    expect(rates.disabled).toBe(true)
    expect(button.label).toBe('Speed')
    expect(button.disabled).toBe(true)
    expect(button.getAttribute('commandfor')).toBe('speed-menu')
    captionsProps.value = {}
    rateProps.value = {}
    buttonProps.value = {}
    await settle()
    expect(captions.disabled).toBe(false)
    expect(captions.label).toBe('')
    expect(captions.formatTrack).not.toBe(formatTrackLanguage)
    expect(rates.disabled).toBe(false)
    expect(rates.formatRate).not.toBe(formatRateLabel)
    expect(button.disabled).toBe(false)
    expect(button.label).toBe('')
    expect(button.commandfor).toBeNull()
    expect(button.hasAttribute('commandfor')).toBe(false)
  })
})
