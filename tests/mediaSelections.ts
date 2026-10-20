import type { PlayerState } from '../src/player/types'

class MockMediaList<Item> extends EventTarget {
  public readonly items: Item[]

  public constructor(items: Item[]) {
    super()
    this.items = items
  }

  public [Symbol.iterator]() {
    return this.items.values()
  }
}

/**
 * Supplies track lists and their browser events in jsdom's absent media pipeline.
 * @param {HTMLMediaElement} media - The native media element to augment.
 * @returns {object} Mutable lists for source changes and selection assertions.
 */
export function installMediaSelections(media: HTMLMediaElement) {
  const renditions: PlayerState['videoRenditionList'] = [
    { id: '720p', width: 1280, height: 720, selected: false },
    { id: '1080p', width: 1920, height: 1080, selected: false },
  ]
  const videoRenditions = Object.assign(new MockMediaList(renditions), {
    selectedIndex: -1,
  })
  Object.defineProperty(videoRenditions, 'selectedIndex', {
    get() {
      return renditions.findIndex(rendition => rendition.selected)
    },
    set(index: number) {
      for (const [position, rendition] of renditions.entries()) {
        rendition.selected = position === index
      }
      videoRenditions.dispatchEvent(new Event('change'))
    },
  })
  const tracks: PlayerState['audioTrackList'] = []
  const audioTracks = new MockMediaList(tracks)
  tracks.push(
    ...['en', 'zh'].map((language, index) => {
      let enabled = index === 0
      return {
        id: language,
        language,
        label: language === 'en' ? 'English' : '中文',
        get enabled() {
          return enabled
        },
        set enabled(value: boolean) {
          enabled = value
          audioTracks.dispatchEvent(new Event('change'))
        },
      }
    }),
  )
  Object.defineProperties(media, {
    videoRenditions: { configurable: true, value: videoRenditions },
    audioTracks: { configurable: true, value: audioTracks },
  })
  media.dispatchEvent(new Event('loadstart'))
  return { renditions, tracks, videoRenditions, audioTracks }
}
