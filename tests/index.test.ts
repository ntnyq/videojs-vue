import type { PlayerTarget } from '@videojs/core/dom'
import { defineSlice } from '@videojs/store'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { App } from 'vue'
import { createApp, defineComponent, h, nextTick } from 'vue'
import { createPlayer, useContainer, useOptionalPlayer } from '../src'
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
      mediaTag: target.media.tagName.toLowerCase(),
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

afterEach(() => {
  for (const mounted of mountedApps.splice(0)) {
    mounted.unmount()
  }
  document.body.innerHTML = ''
})

describe(createPlayer, () => {
  it('wires Provider, Container, usePlayer and useMedia together', async () => {
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

    expect(store).toBe(true)
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
})

describe('context helpers', () => {
  it('returns undefined from useOptionalPlayer outside a provider', () => {
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
  it('renders audio and background video elements with expected defaults', async () => {
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
})
