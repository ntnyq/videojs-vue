import type { PlayerTarget } from '@videojs/core/dom'
import { defineSlice } from '@videojs/store'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { App } from 'vue'
import { createApp, defineComponent, h, nextTick, ref } from 'vue'
import type { PlayerRuntimePlugin } from '../src'
import {
  AlertDialog,
  BufferingIndicator,
  CaptionsButton,
  CastButton,
  Controls,
  createPlayer,
  ErrorDialog,
  FullscreenButton,
  Gesture,
  Hotkey,
  MuteButton,
  Popover,
  PiPButton,
  PlayButton,
  PlaybackRateButton,
  Poster,
  SeekButton,
  Slider,
  Thumbnail,
  Time,
  TimeSlider,
  Tooltip,
  VolumeSlider,
  useContainer,
  useOptionalPlayer,
} from '../src'
import { Audio } from '../src/media/Audio'
import { BackgroundVideo } from '../src/media/BackgroundVideo'
import { Video } from '../src/media/Video'

const testFeature = defineSlice<PlayerTarget>()({
  name: 'test-feature',
  state: ({ set }) => ({
    attachCount: 0,
    hasContainer: false,
    label: 'idle',
    mediaTag: '',
    setLabel(value: string) {
      set({ label: value })
    },
  }),
  attach: ({ get, set, target }) => {
    set({
      attachCount: get().attachCount + 1,
      mediaTag: (target.media as HTMLMediaElement).tagName.toLowerCase(),
      hasContainer: Boolean(target.container),
    })
  },
})

const Player = createPlayer({
  displayName: 'TestPlayer',
  features: [testFeature] as const,
})

interface MountedApp {
  app: App
  root: HTMLDivElement
  unmount: () => void
}

function mount(component: Parameters<typeof createApp>[0]): MountedApp {
  const root = document.createElement('div')
  document.body.append(root)

  const app = createApp(component)
  app.mount(root)

  return {
    app,
    root,
    unmount() {
      app.unmount()
      root.remove()
    },
  }
}

const mountedApps: MountedApp[] = []

// oxlint-disable-next-line vitest/require-top-level-describe
afterEach(() => {
  for (const mounted of mountedApps.splice(0)) {
    mounted.unmount()
  }
  document.body.innerHTML = ''
})

describe(`${createPlayer}`, () => {
  it('wires Provider, Container, usePlayer and useMedia together', async () => {
    expect.hasAssertions()
    let store: { setLabel: (value: string) => void } | undefined
    let attachCount: { value: number } | undefined
    let label: { value: string } | undefined
    let media: { value: HTMLMediaElement | null } | undefined
    let container: { value: HTMLElement | null } | undefined

    const Probe = defineComponent({
      setup() {
        store = Player.usePlayer() as { setLabel: (value: string) => void }
        attachCount = Player.usePlayer(state => state.attachCount)
        label = Player.usePlayer(state => state.label)
        media = Player.useMedia()
        container = useContainer()

        return () => null
      },
    })

    const app = mount(
      defineComponent({
        setup() {
          return () =>
            h(Player.Provider, () =>
              h(Player.Container, { id: 'player-root' }, () => [
                h(Video, {
                  src: 'https://example.com/movie.mp4',
                }),
                h(Probe),
              ]),
            )
        },
      }),
    )

    mountedApps.push(app)
    await nextTick()

    expect(store).toBeDefined()
    expect(attachCount?.value).toBe(1)
    expect(label?.value).toBe('idle')
    expect(media?.value).toBeInstanceOf(HTMLVideoElement)
    expect((media?.value as HTMLVideoElement | null)?.getAttribute('src')).toBe(
      'https://example.com/movie.mp4',
    )
    expect(container?.value).toBeInstanceOf(HTMLDivElement)
    expect((container?.value as HTMLDivElement | null)?.id).toBe('player-root')

    store?.setLabel('ready')
    await nextTick()

    expect(label?.value).toBe('ready')
  })

  it('focuses the container on pointerup and preserves user handlers', async () => {
    expect.hasAssertions()
    const onPointerup = vi.fn()

    const app = mount(
      defineComponent({
        setup() {
          return () =>
            h(Player.Provider, () =>
              h(
                Player.Container,
                {
                  id: 'interactive-container',
                  onPointerup,
                },
                () => [h(Video)],
              ),
            )
        },
      }),
    )

    mountedApps.push(app)
    await nextTick()

    const container = app.root.querySelector(
      '#interactive-container',
    ) as HTMLDivElement
    container.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))

    expect(onPointerup).toHaveBeenCalledTimes(1)
    expect(document.activeElement).toBe(container)
  })

  it('runs runtime plugin hooks on provider and attach lifecycle', async () => {
    expect.hasAssertions()
    const onProviderSetup = vi.fn(() => vi.fn())
    const onProviderDestroy = vi.fn()
    const onAttach = vi.fn(() => vi.fn())
    const onDetach = vi.fn()

    const plugins: PlayerRuntimePlugin[] = [
      {
        onProviderSetup,
        onProviderDestroy,
        onAttach,
        onDetach,
      },
    ]

    const PluginPlayer = createPlayer({
      displayName: 'PluginPlayer',
      features: [testFeature] as const,
      plugins,
    })

    const app = mount(
      defineComponent({
        setup() {
          return () =>
            h(PluginPlayer.Provider, () =>
              h(PluginPlayer.Container, () => [h(Video)]),
            )
        },
      }),
    )

    mountedApps.push(app)
    await nextTick()

    expect(onProviderSetup).toHaveBeenCalledTimes(1)
    expect(onAttach).toHaveBeenCalledTimes(1)

    app.unmount()

    expect(onDetach).toHaveBeenCalledTimes(1)
    expect(onProviderDestroy).toHaveBeenCalledTimes(1)
  })
})

describe('context helpers', () => {
  it('returns undefined from useOptionalPlayer outside a provider', () => {
    expect.hasAssertions()
    let player = 'missing'

    const app = mount(
      defineComponent({
        setup() {
          player = String(useOptionalPlayer())
          return () => null
        },
      }),
    )

    mountedApps.push(app)
    expect(player).toBe('undefined')
  })
})

describe('media components', () => {
  it('keeps media attached when swapping from video to audio', async () => {
    expect.hasAssertions()
    const activeTag = ref<'video' | 'audio'>('video')
    let mediaRef: { value: HTMLMediaElement | null } | undefined

    const Probe = defineComponent({
      setup() {
        mediaRef = Player.useMedia() as { value: HTMLMediaElement | null }
        return () => null
      },
    })

    const app = mount(
      defineComponent({
        setup() {
          const registry = {
            audio: Audio,
            video: Video,
          } as const

          return () =>
            h(Player.Provider, () =>
              h(Player.Container, () => [
                h(registry[activeTag.value], {
                  id: `swap-${activeTag.value}`,
                }),
                h(Probe),
              ]),
            )
        },
      }),
    )

    mountedApps.push(app)
    await nextTick()

    expect(mediaRef?.value).toBeInstanceOf(HTMLVideoElement)
    expect(app.root.querySelector('#swap-video')).toBeInstanceOf(
      HTMLVideoElement,
    )

    activeTag.value = 'audio'
    await nextTick()

    expect(mediaRef?.value).toBeInstanceOf(HTMLAudioElement)
    expect(app.root.querySelector('#swap-audio')).toBeInstanceOf(
      HTMLAudioElement,
    )
  })

  it('renders audio and background video elements with expected defaults', async () => {
    expect.hasAssertions()
    const app = mount(
      defineComponent({
        setup() {
          return () =>
            h('div', [
              h(Audio, { src: 'https://example.com/audio.mp3' }),
              h(BackgroundVideo, { src: 'https://example.com/background.mp4' }),
            ])
        },
      }),
    )

    mountedApps.push(app)
    await nextTick()

    const audio = app.root.querySelector('audio') as HTMLAudioElement
    const background = app.root.querySelector('video') as HTMLVideoElement

    expect(audio.getAttribute('src')).toBe('https://example.com/audio.mp3')
    expect(background.getAttribute('src')).toBe(
      'https://example.com/background.mp4',
    )
    expect(background.autoplay).toBe(true)
    expect(background.loop).toBe(true)
    expect(background.muted).toBe(true)
    expect(background.playsInline).toBe(true)
  })

  it('syncs reactive media props to the mounted video element', async () => {
    expect.hasAssertions()
    const src = ref('https://example.com/first.mp4')
    const muted = ref(false)
    const autoplay = ref(false)
    const playsInline = ref(false)
    const poster = ref('https://example.com/a.jpg')
    const playbackRate = ref(1)

    const app = mount(
      defineComponent({
        setup() {
          return () =>
            h(Video, {
              id: 'synced-video',
              src: src.value,
              muted: muted.value,
              autoplay: autoplay.value,
              playsInline: playsInline.value,
              poster: poster.value,
              playbackRate: playbackRate.value,
            })
        },
      }),
    )

    mountedApps.push(app)
    await nextTick()

    const video = app.root.querySelector('#synced-video') as HTMLVideoElement
    expect(video.getAttribute('src')).toBe('https://example.com/first.mp4')
    expect(video.muted).toBe(false)
    expect(video.autoplay).toBe(false)
    expect(video.playsInline).toBe(false)
    expect(video.poster).toContain('example.com/a.jpg')
    expect(video.playbackRate).toBe(1)

    src.value = 'https://example.com/next.mp4'
    muted.value = true
    autoplay.value = true
    playsInline.value = true
    poster.value = 'https://example.com/b.jpg'
    playbackRate.value = 1.5
    await nextTick()

    expect(video.getAttribute('src')).toBe('https://example.com/next.mp4')
    expect(video.muted).toBe(true)
    expect(video.autoplay).toBe(true)
    expect(video.playsInline).toBe(true)
    expect(video.poster).toContain('example.com/b.jpg')
    expect(video.playbackRate).toBe(1.5)
  })

  it('cycles playback rate and toggles fullscreen through UI buttons', async () => {
    expect.hasAssertions()
    const app = mount(
      defineComponent({
        setup() {
          return () =>
            h(Player.Provider, () =>
              h(Player.Container, { id: 'ui-container' }, () => [
                h(Video),
                h(PlaybackRateButton, { id: 'rate-button' }),
                h(FullscreenButton, { id: 'fullscreen-button' }),
              ]),
            )
        },
      }),
    )

    mountedApps.push(app)
    await nextTick()

    const rateButton = app.root.querySelector(
      '#rate-button',
    ) as HTMLButtonElement
    const mediaElement = app.root.querySelector('video') as HTMLVideoElement
    const container = app.root.querySelector('#ui-container') as HTMLDivElement
    const fullscreenButton = app.root.querySelector(
      '#fullscreen-button',
    ) as HTMLButtonElement

    expect(mediaElement).toBeInstanceOf(HTMLVideoElement)
    expect(container).toBeInstanceOf(HTMLDivElement)

    mediaElement.playbackRate = 1
    rateButton.click()

    expect(mediaElement.playbackRate).toBe(1.25)

    const requestFullscreen = vi.fn()
    Object.assign(container, {
      requestFullscreen,
    })

    fullscreenButton.click()
    expect(requestFullscreen).toHaveBeenCalledTimes(1)
  })

  it('renders Poster and Time primitives', async () => {
    expect.hasAssertions()
    const app = mount(
      defineComponent({
        setup() {
          return () =>
            h(Player.Provider, () =>
              h(Player.Container, () => [
                h(Video, { poster: 'https://example.com/poster.jpg' }),
                h(Poster, { id: 'poster-view' }),
                h(Time.Group, { id: 'time-group' }, () => [
                  h(Time.Value, { id: 'time-current' }),
                  h(Time.Separator, { id: 'time-separator' }),
                  h(Time.Value, { id: 'time-duration', type: 'duration' }),
                ]),
              ]),
            )
        },
      }),
    )

    mountedApps.push(app)
    await nextTick()

    const poster = app.root.querySelector('#poster-view') as HTMLImageElement
    const timeGroup = app.root.querySelector('#time-group') as HTMLSpanElement
    const separator = app.root.querySelector(
      '#time-separator',
    ) as HTMLSpanElement
    const current = app.root.querySelector('#time-current') as HTMLTimeElement
    const duration = app.root.querySelector('#time-duration') as HTMLTimeElement

    expect(poster.getAttribute('src')).toBe('https://example.com/poster.jpg')
    expect(timeGroup).toBeInstanceOf(HTMLSpanElement)
    expect(separator.textContent).toBe('/')
    expect(current.textContent).toBe('0:00')
    expect(duration.textContent).toBe('0:00')
  })

  it('handles play, mute, pip and seek actions', async () => {
    expect.hasAssertions()
    Object.defineProperty(document, 'pictureInPictureEnabled', {
      configurable: true,
      value: true,
    })
    Object.defineProperty(document, 'pictureInPictureElement', {
      configurable: true,
      get: () => null,
    })

    const app = mount(
      defineComponent({
        setup() {
          return () =>
            h(Player.Provider, () =>
              h(Player.Container, () => [
                h(Video),
                h(PlayButton, { id: 'play-button' }),
                h(MuteButton, { id: 'mute-button' }),
                h(PiPButton, { id: 'pip-button' }),
                h(SeekButton, { id: 'seek-button', seconds: 15 }),
              ]),
            )
        },
      }),
    )

    mountedApps.push(app)
    await nextTick()

    const media = app.root.querySelector('video') as HTMLVideoElement
    const playButton = app.root.querySelector(
      '#play-button',
    ) as HTMLButtonElement
    const muteButton = app.root.querySelector(
      '#mute-button',
    ) as HTMLButtonElement
    const pipButton = app.root.querySelector('#pip-button') as HTMLButtonElement
    const seekButton = app.root.querySelector(
      '#seek-button',
    ) as HTMLButtonElement

    const play = vi.fn().mockResolvedValue(null)
    const pause = vi.fn()
    const requestPictureInPicture = vi.fn().mockResolvedValue(null)

    Object.assign(media, {
      play,
      pause,
    })

    Object.defineProperty(media, 'requestPictureInPicture', {
      configurable: true,
      value: requestPictureInPicture,
    })

    Object.defineProperty(media, 'paused', {
      configurable: true,
      get: () => true,
    })

    Object.defineProperty(media, 'duration', {
      configurable: true,
      value: 120,
      writable: true,
    })
    media.currentTime = 20

    playButton.click()
    muteButton.click()
    pipButton.click()
    seekButton.click()
    await Promise.resolve()

    expect(play).toHaveBeenCalledTimes(1)
    expect(media.muted).toBe(true)
    expect(requestPictureInPicture).toHaveBeenCalledTimes(1)
    expect(media.currentTime).toBe(35)
  })

  it('updates volume and time through sliders', async () => {
    expect.hasAssertions()
    const app = mount(
      defineComponent({
        setup() {
          return () =>
            h(Player.Provider, () =>
              h(Player.Container, () => [
                h(Video),
                h(VolumeSlider.Root, { id: 'volume-root' }, () => [
                  h(VolumeSlider.Track),
                  h(VolumeSlider.Fill),
                  h(VolumeSlider.Thumb),
                  h(VolumeSlider.Value, { id: 'volume-value' }),
                ]),
                h(TimeSlider.Root, { id: 'time-root' }, () => [
                  h(TimeSlider.Track),
                  h(TimeSlider.Buffer),
                  h(TimeSlider.Fill),
                  h(TimeSlider.Thumb),
                  h(TimeSlider.Value, { id: 'time-value' }),
                ]),
              ]),
            )
        },
      }),
    )

    mountedApps.push(app)
    await nextTick()

    const media = app.root.querySelector('video') as HTMLVideoElement
    const volumeRoot = app.root.querySelector('#volume-root') as HTMLDivElement
    const timeRoot = app.root.querySelector('#time-root') as HTMLDivElement

    media.volume = 1
    media.currentTime = 0

    Object.defineProperty(media, 'duration', {
      configurable: true,
      value: 120,
      writable: true,
    })
    Object.defineProperty(media, 'buffered', {
      configurable: true,
      value: {
        length: 1,
        end: () => 90,
      },
    })

    media.dispatchEvent(new Event('loadedmetadata'))
    media.dispatchEvent(new Event('durationchange'))

    Object.defineProperty(volumeRoot, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        x: 0,
        y: 0,
        left: 0,
        top: 0,
        right: 200,
        bottom: 20,
        width: 200,
        height: 20,
        toJSON: () => ({}),
      }),
    })

    Object.defineProperty(timeRoot, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        x: 0,
        y: 0,
        left: 0,
        top: 0,
        right: 200,
        bottom: 20,
        width: 200,
        height: 20,
        toJSON: () => ({}),
      }),
    })

    volumeRoot.dispatchEvent(new PointerEvent('pointerdown', { clientX: 100 }))
    timeRoot.dispatchEvent(new PointerEvent('pointerdown', { clientX: 100 }))
    await nextTick()

    const volumeValue = app.root.querySelector(
      '#volume-value',
    ) as HTMLOutputElement
    const timeValue = app.root.querySelector('#time-value') as HTMLOutputElement

    expect(media.volume).toBe(0.5)
    expect(media.currentTime).toBe(60)
    expect(volumeValue.textContent).toBe('50%')
    expect(timeValue.textContent).toBe('1:00')
  })

  it('handles captions, cast and buffering indicator behavior', async () => {
    expect.hasAssertions()
    const app = mount(
      defineComponent({
        setup() {
          return () =>
            h(Player.Provider, () =>
              h(Player.Container, () => [
                h(Video),
                h(CaptionsButton, { id: 'captions-button' }),
                h(CastButton, { id: 'cast-button' }),
                h(BufferingIndicator, { id: 'buffering', delay: 0 }),
              ]),
            )
        },
      }),
    )

    mountedApps.push(app)
    await nextTick()

    const media = app.root.querySelector('video') as HTMLVideoElement
    const captionsButton = app.root.querySelector(
      '#captions-button',
    ) as HTMLButtonElement
    const castButton = app.root.querySelector(
      '#cast-button',
    ) as HTMLButtonElement
    const buffering = app.root.querySelector('#buffering') as HTMLDivElement

    const track = { kind: 'captions', mode: 'hidden' } as TextTrack
    Object.defineProperty(media, '__vjsTextTracks', {
      configurable: true,
      value: [track],
    })

    const prompt = vi.fn().mockResolvedValue(null)
    Object.defineProperty(media, 'remote', {
      configurable: true,
      value: {
        prompt,
      },
    })

    captionsButton.click()
    expect(track.mode).toBe('showing')

    captionsButton.click()
    expect(track.mode).toBe('hidden')

    castButton.click()
    await Promise.resolve()
    expect(prompt).toHaveBeenCalledTimes(1)

    media.dispatchEvent(new Event('waiting'))
    await vi.waitFor(() => {
      expect(buffering.hidden).toBe(false)
    })

    media.dispatchEvent(new Event('playing'))
    await nextTick()
    expect(buffering.hidden).toBe(true)
  })

  it('keeps captions button inert when no caption tracks exist', async () => {
    expect.hasAssertions()
    const app = mount(
      defineComponent({
        setup() {
          return () =>
            h(Player.Provider, () =>
              h(Player.Container, () => [
                h(Video),
                h(CaptionsButton, { id: 'captions-empty' }),
              ]),
            )
        },
      }),
    )

    mountedApps.push(app)
    await nextTick()

    const captionsButton = app.root.querySelector(
      '#captions-empty',
    ) as HTMLButtonElement

    captionsButton.click()
    expect(captionsButton.getAttribute('aria-pressed')).toBe('false')
  })

  it('renders controls and toggles tooltip/popover primitives', async () => {
    expect.hasAssertions()
    const app = mount(
      defineComponent({
        setup() {
          return () =>
            h('div', [
              h(Controls.Root, { id: 'controls-root' }, () => [
                h(Controls.Group, { id: 'controls-group' }, () => [
                  h('button', 'Action'),
                ]),
              ]),
              h(Tooltip.Provider, () => [
                h(Tooltip.Root, { id: 'tooltip-root' }, () => [
                  h(Tooltip.Trigger, { id: 'tooltip-trigger' }, () => [
                    'Hover',
                  ]),
                  h(Tooltip.Popup, { id: 'tooltip-popup' }, () => [
                    h(Tooltip.Arrow),
                    h('span', 'Tip'),
                  ]),
                ]),
              ]),
              h(Popover.Root, { id: 'popover-root' }, () => [
                h(Popover.Trigger, { id: 'popover-trigger' }, () => ['Open']),
                h(Popover.Popup, { id: 'popover-popup' }, () => [
                  h(Popover.Arrow),
                  h('span', 'Panel'),
                ]),
              ]),
            ])
        },
      }),
    )

    mountedApps.push(app)
    await nextTick()

    const controlsRoot = app.root.querySelector('#controls-root')
    const controlsGroup = app.root.querySelector('#controls-group')
    const tooltipTrigger = app.root.querySelector(
      '#tooltip-trigger',
    ) as HTMLElement
    const popoverTrigger = app.root.querySelector(
      '#popover-trigger',
    ) as HTMLElement

    expect(controlsRoot).toBeInstanceOf(HTMLDivElement)
    expect(controlsGroup).toBeInstanceOf(HTMLDivElement)
    expect(app.root.querySelector('#tooltip-popup')).toBeNull()
    expect(app.root.querySelector('#popover-popup')).toBeNull()

    tooltipTrigger.dispatchEvent(new Event('mouseenter'))
    await nextTick()
    expect(app.root.querySelector('#tooltip-popup')).toBeInstanceOf(
      HTMLDivElement,
    )

    tooltipTrigger.dispatchEvent(new Event('mouseleave'))
    await nextTick()
    expect(app.root.querySelector('#tooltip-popup')).toBeNull()

    popoverTrigger.dispatchEvent(new Event('click'))
    await nextTick()
    expect(app.root.querySelector('#popover-popup')).toBeInstanceOf(
      HTMLDivElement,
    )

    popoverTrigger.dispatchEvent(new Event('click'))
    await nextTick()
    expect(app.root.querySelector('#popover-popup')).toBeNull()
  })

  it('supports shared Slider parts and Thumbnail preview', async () => {
    expect.hasAssertions()
    const app = mount(
      defineComponent({
        setup() {
          return () =>
            h(Player.Provider, () =>
              h(Player.Container, () => [
                h(Video),
                h(
                  Slider.Root,
                  {
                    id: 'shared-slider',
                    min: 0,
                    max: 100,
                    defaultValue: 50,
                    formatValue: value => `${value.toFixed(0)}%`,
                  },
                  () => [
                    h(Slider.Track),
                    h(Slider.Buffer),
                    h(Slider.Fill),
                    h(Slider.Thumb),
                    h(Slider.Preview, () => [
                      h(Slider.Thumbnail, {
                        id: 'slider-thumbnail',
                        thumbnails: [
                          {
                            start: 0,
                            end: 100,
                            url: 'https://example.com/t.jpg',
                          },
                        ],
                      }),
                    ]),
                    h(Slider.Value, { id: 'slider-value' }),
                  ],
                ),
                h(Thumbnail, {
                  id: 'standalone-thumbnail',
                  time: 10,
                  thumbnails: [
                    { start: 0, end: 20, url: 'https://example.com/a.jpg' },
                  ],
                }),
              ]),
            )
        },
      }),
    )

    mountedApps.push(app)
    await nextTick()

    const slider = app.root.querySelector('#shared-slider') as HTMLDivElement
    const value = app.root.querySelector('#slider-value') as HTMLOutputElement
    const thumbnail = app.root.querySelector(
      '#slider-thumbnail',
    ) as HTMLDivElement
    const standalone = app.root.querySelector(
      '#standalone-thumbnail',
    ) as HTMLDivElement

    Object.defineProperty(slider, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        x: 0,
        y: 0,
        left: 0,
        top: 0,
        right: 200,
        bottom: 20,
        width: 200,
        height: 20,
        toJSON: () => ({}),
      }),
    })

    slider.dispatchEvent(new PointerEvent('pointerdown', { clientX: 150 }))
    await nextTick()

    expect(value.textContent).toBe('75%')
    expect(thumbnail.style.backgroundImage).toContain('example.com/t.jpg')
    expect(standalone.style.backgroundImage).toContain('example.com/a.jpg')
  })

  it('triggers actions via Hotkey and Gesture', async () => {
    expect.hasAssertions()
    const app = mount(
      defineComponent({
        setup() {
          return () =>
            h(Player.Provider, () =>
              h(Player.Container, { id: 'hotkey-gesture-container' }, () => [
                h(Video),
                h(Hotkey, {
                  keys: 'k',
                  action: 'togglePaused',
                  target: 'document',
                }),
                h(Gesture, {
                  type: 'tap',
                  action: 'toggleMuted',
                }),
              ]),
            )
        },
      }),
    )

    mountedApps.push(app)
    await nextTick()

    const media = app.root.querySelector('video') as HTMLVideoElement
    const container = app.root.querySelector(
      '#hotkey-gesture-container',
    ) as HTMLDivElement
    const play = vi.fn().mockResolvedValue(null)

    Object.assign(media, { play })
    Object.defineProperty(media, 'paused', {
      configurable: true,
      get: () => true,
    })
    media.muted = false

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }))
    container.dispatchEvent(
      new PointerEvent('pointerup', { pointerType: 'mouse' }),
    )
    await Promise.resolve()

    expect(play).toHaveBeenCalledTimes(1)
    expect(media.muted).toBe(true)
  })

  it('renders AlertDialog and ErrorDialog states', async () => {
    expect.hasAssertions()
    const app = mount(
      defineComponent({
        setup() {
          return () =>
            h('div', [
              h(AlertDialog.Root, { defaultOpen: true }, () => [
                h(AlertDialog.Popup, { id: 'alert-popup' }, () => [
                  h(AlertDialog.Title, { id: 'alert-title' }, () => [
                    'Heads up',
                  ]),
                  h(AlertDialog.Description, { id: 'alert-desc' }, () => [
                    'Something happened',
                  ]),
                  h(AlertDialog.Close, { id: 'alert-close' }),
                ]),
              ]),
              h(Player.Provider, () =>
                h(Player.Container, () => [
                  h(Video),
                  h(ErrorDialog.Root, () => [
                    h(ErrorDialog.Popup, { id: 'error-popup' }, () => [
                      h(ErrorDialog.Title, { id: 'error-title' }, () => [
                        'Playback Error',
                      ]),
                      h(ErrorDialog.Description, { id: 'error-desc' }),
                      h(ErrorDialog.Close, { id: 'error-close' }),
                    ]),
                  ]),
                ]),
              ),
            ])
        },
      }),
    )

    mountedApps.push(app)
    await nextTick()

    const alertPopup = app.root.querySelector('#alert-popup') as HTMLDivElement
    const alertClose = app.root.querySelector(
      '#alert-close',
    ) as HTMLButtonElement
    expect(alertPopup).toBeInstanceOf(HTMLDivElement)
    alertClose.click()
    await nextTick()
    expect(app.root.querySelector('#alert-popup')).toBeNull()

    const media = app.root.querySelector('video') as HTMLVideoElement
    Object.defineProperty(media, 'error', {
      configurable: true,
      get: () => ({ message: 'Media failed to load' }) as MediaError,
    })

    media.dispatchEvent(new Event('error'))
    await nextTick()

    const errorPopup = app.root.querySelector('#error-popup') as HTMLDivElement
    const errorDesc = app.root.querySelector(
      '#error-desc',
    ) as HTMLParagraphElement
    expect(errorPopup).toBeInstanceOf(HTMLDivElement)
    expect(errorDesc.textContent).toContain('Media failed to load')
  })
})
