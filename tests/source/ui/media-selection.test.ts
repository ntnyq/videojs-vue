import type { MenuElement } from '@videojs/html'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, shallowRef } from 'vue'
import {
  VideoPlayerRoot,
  Video,
  VideoPlayer,
  useVideoPlayerActions,
  useVideoPlayerState,
} from '../../../src'
import type { VideoPlayerHandle } from '../../../src'
import {
  AudioTrackRadioGroup,
  MediaContainer,
  MediaMenu,
  MediaMenuContent,
  QualityRadioGroup,
} from '../../../src/ui'
import { cleanup, disposals, mount, settle } from '../../helpers'
import { installMediaSelections } from '../../mediaSelections'

function formatRenditionId(item: { id: string }) {
  return item.id
}

function formatTrackLanguage(track: { language: string }) {
  return track.language
}

describe('media selection', () => {
  afterEach(cleanup)

  it('synchronizes optional menu and formatter props and restores upstream defaults', async () => {
    expect.hasAssertions()
    const qualityProps = shallowRef<
      InstanceType<typeof QualityRadioGroup>['$props']
    >({
      disabled: true,
      label: 'Custom quality',
      formatRendition: formatRenditionId,
    })
    const audioProps = shallowRef<
      InstanceType<typeof AudioTrackRadioGroup>['$props']
    >({
      disabled: true,
      label: 'Custom audio',
      formatTrack: formatTrackLanguage,
    })
    const menuProps = shallowRef<InstanceType<typeof MediaMenu>['$props']>({
      side: 'top',
      closeOnEscape: false,
      boundary: document.body,
    })
    const { container } = mount(
      defineComponent(
        () => () =>
          h(VideoPlayerRoot, null, {
            default: () =>
              h(MediaContainer, null, {
                default: () => [
                  h(Video),
                  h(MediaMenu, menuProps.value, {
                    default: () =>
                      h(MediaMenuContent, null, {
                        default: () => [
                          h(QualityRadioGroup, qualityProps.value),
                          h(AudioTrackRadioGroup, audioProps.value),
                        ],
                      }),
                  }),
                ],
              }),
          }),
      ),
    )
    await settle()
    const quality = container.querySelector('media-quality-radio-group')!
    const audio = container.querySelector('media-audio-track-radio-group')!
    const menu = container.querySelector<MenuElement>('media-menu')!
    expect(quality.formatRendition).toBe(formatRenditionId)
    expect(audio.formatTrack).toBe(formatTrackLanguage)
    expect(quality.disabled).toBe(true)
    expect(audio.label).toBe('Custom audio')
    expect(menu.side).toBe('top')
    expect(menu.closeOnEscape).toBe(false)
    expect(menu.boundary).toBe(document.body)
    qualityProps.value = {}
    audioProps.value = {}
    menuProps.value = {}
    await settle()
    expect(quality.disabled).toBe(false)
    expect(audio.disabled).toBe(false)
    expect(quality.label).toBe('')
    expect(audio.label).toBe('')
    expect(quality.formatRendition).not.toBe(formatRenditionId)
    expect(audio.formatTrack).not.toBe(formatTrackLanguage)
    expect(quality.formatRendition).toBeTypeOf('function')
    expect(audio.formatTrack).toBeTypeOf('function')
    expect(menu.side).toBe('bottom')
    expect(menu.closeOnEscape).toBe(true)
    expect(menu.boundary).toBe('container')
  })

  it('selects quality, auto and audio tracks through generated accessible menu items', async () => {
    expect.hasAssertions()
    const player = shallowRef<VideoPlayerHandle | null>(null)
    const onChange = vi.fn()
    const formatRendition = vi.fn(
      (rendition: { id: string }) => `Quality ${rendition.id}`,
    )
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
                    h('button', { commandfor: 'quality-menu' }, 'Quality'),
                    h(
                      MediaMenu,
                      { id: 'quality-menu' },
                      {
                        default: () =>
                          h(MediaMenuContent, null, {
                            default: () =>
                              h(QualityRadioGroup, {
                                label: 'Quality',
                                formatRendition,
                                'onValue-change': onChange,
                              }),
                          }),
                      },
                    ),
                    h('button', { commandfor: 'audio-menu' }, 'Audio'),
                    h(
                      MediaMenu,
                      { id: 'audio-menu' },
                      {
                        default: () =>
                          h(MediaMenuContent, null, {
                            default: () =>
                              h(AudioTrackRadioGroup, { label: 'Audio' }),
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
    const { renditions, tracks, videoRenditions, audioTracks } =
      installMediaSelections(container.querySelector('video')!)
    await settle()
    const quality = container.querySelector('media-quality-radio-group')!
    const audio = container.querySelector('media-audio-track-radio-group')!
    expect(quality.getAttribute('aria-label')).toBe('Quality')
    expect(quality.querySelectorAll('[role="menuitemradio"]')).toHaveLength(3)
    expect(quality.textContent).toContain('Quality 720p')
    expect(audio.textContent).toContain('English')
    expect(audio.textContent).toContain('中文')
    quality.querySelector<HTMLElement>('[data-rendition="1080p"]')!.click()
    await settle()
    expect(renditions.map(item => item.selected)).toStrictEqual([false, true])
    expect(
      quality
        .querySelector('[data-rendition="1080p"]')
        ?.getAttribute('aria-checked'),
    ).toBe('true')
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { value: '1080p' } }),
    )
    quality.querySelector<HTMLElement>('[data-rendition="auto"]')!.click()
    audio.querySelector<HTMLElement>('[data-track="zh"]')!.click()
    await settle()
    expect(videoRenditions.selectedIndex).toBe(-1)
    expect(tracks.map(track => track.enabled)).toStrictEqual([false, true])
    expect(
      player.value!.store!.audioTrackList.find(track => track.enabled)?.id,
    ).toBe('zh')
    renditions.splice(0)
    tracks.splice(0)
    videoRenditions.dispatchEvent(new Event('removerendition'))
    audioTracks.dispatchEvent(new Event('removetrack'))
    await settle()
    expect(quality.hidden).toBe(true)
    expect(audio.hidden).toBe(true)
    expect(
      container.querySelector<HTMLButtonElement>('[commandfor="quality-menu"]')!
        .hidden,
    ).toBe(true)
  })

  it('resolves selection actions against the current target and stops after unmount', async () => {
    expect.hasAssertions()
    const first = shallowRef<VideoPlayerHandle | null>(null)
    const second = shallowRef<VideoPlayerHandle | null>(null)
    const target = shallowRef<VideoPlayerHandle | null>(null)
    let actions: ReturnType<typeof useVideoPlayerActions> | undefined
    let readSelected = () =>
      target.value?.store?.videoRenditionList.find(item => item.selected)?.id
    const { container, unmount } = mount(
      defineComponent({
        setup() {
          actions = useVideoPlayerActions(target)
          const selected = useVideoPlayerState(
            state => state.videoRenditionList.find(item => item.selected)?.id,
            target,
          )
          readSelected = () => selected.value
          return () =>
            h('div', [
              h(VideoPlayer, { ref: first }),
              h(VideoPlayer, { ref: second }),
            ])
        },
      }),
    )
    expect(() => actions!.selectVideoRendition('720p')).toThrow('not ready')
    expect(() => actions!.selectAudioTrack('zh')).toThrow('not ready')
    await settle()
    const media = container.querySelectorAll('video')
    const firstLists = installMediaSelections(media[0]!)
    const secondLists = installMediaSelections(media[1]!)
    await settle()
    target.value = first.value
    actions!.selectVideoRendition('720p')
    actions!.selectAudioTrack('zh')
    await settle()
    expect(readSelected()).toBe('720p')
    expect(firstLists.tracks[1]!.enabled).toBe(true)
    expect(secondLists.tracks[1]!.enabled).toBe(false)
    target.value = second.value
    actions!.selectVideoRendition('1080p')
    await settle()
    expect(readSelected()).toBe('1080p')
    expect(firstLists.videoRenditions.selectedIndex).toBe(0)
    second.value!.selectVideoRendition('auto')
    second.value!.selectAudioTrack('zh')
    await settle()
    expect(readSelected()).toBeUndefined()
    expect(secondLists.tracks[1]!.enabled).toBe(true)
    actions!.selectVideoRendition('missing')
    actions!.selectAudioTrack('missing')
    expect(secondLists.videoRenditions.selectedIndex).toBe(-1)
    expect(secondLists.tracks[1]!.enabled).toBe(true)
    const reason = new Error('Selection failed')
    vi.spyOn(secondLists.tracks[0]!, 'enabled', 'set').mockImplementationOnce(
      () => {
        throw reason
      },
    )
    expect(() => actions!.selectAudioTrack('en')).toThrow(reason)
    const handle = second.value!
    unmount()
    disposals.pop()
    expect(readSelected()).toBeUndefined()
    expect(() => handle.selectAudioTrack('en')).toThrow('not ready')
    expect(() => actions!.selectVideoRendition('720p')).toThrow('not ready')
  })
})
