import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, shallowRef } from 'vue'
import { PlayerRoot, Video, VideoPlayer } from '../../../src'
import type { PlayerHandle } from '../../../src'
import { HlsVideo } from '../../../src/media/hls'
import { MediaContainer } from '../../../src/ui'
import { mount, settle, cleanup } from '../../helpers'

describe('hls media adapter', () => {
  afterEach(cleanup)

  it('passes structured HLS sources as properties and replaces media adapters', async () => {
    expect.hasAssertions()
    const useHls = shallowRef(true)
    const source = shallowRef({
      src: '/stream.m3u8',
      preferPlayback: 'native' as const,
    })
    const { container } = mount(
      defineComponent(
        () => () =>
          h(PlayerRoot, null, {
            default: () =>
              h(MediaContainer, null, {
                default: () =>
                  // oxlint-disable-next-line vitest/no-conditional-in-test
                  useHls.value
                    ? h(HlsVideo, { source: source.value })
                    : h(Video, { src: '/movie.mp4' }),
              }),
          }),
      ),
    )
    await settle()
    const media = container.querySelector('hlsjs-video')!
    expect(media.getAttribute('source')).toBeNull()
    expect(media.source?.src).toBe('/stream.m3u8')
    source.value = { src: '/other.m3u8', preferPlayback: 'native' }
    await settle()
    expect(media.source?.src).toBe('/other.m3u8')
    useHls.value = false
    await settle()
    expect(container.querySelector('hlsjs-video')).toBeNull()
    expect(container.querySelector('video')?.getAttribute('src')).toBe(
      '/movie.mp4',
    )
  })

  it('keeps bound adapter settings in upstream state after metadata arrives', async () => {
    expect.hasAssertions()
    const player = shallowRef<PlayerHandle | null>(null)
    const { container } = mount(
      defineComponent(
        () => () =>
          h(VideoPlayer, {
            ref: player,
            media: HlsVideo,
            volume: 0.4,
            muted: true,
            playbackRate: 1.5,
          }),
      ),
    )
    await settle()
    const media = container.querySelector('hlsjs-video')!
    media.dispatchEvent(new Event('loadedmetadata'))
    await settle()
    expect(media.volume).toBe(0.4)
    expect(player.value!.store!.volume).toBe(0.4)
    expect(player.value!.store!.muted).toBe(true)
    expect(player.value!.store!.playbackRate).toBe(1.5)
  })
})
