/**
 * Common native and adapter media surface. Adapter-specific APIs remain on the element.
 */
export interface PlayerMedia extends HTMLElement {
  src: string
  volume: number
  muted: boolean
  playbackRate: number
  readonly paused: boolean
  readonly currentTime: number
  readonly error: MediaError | null
  play: () => Promise<void>
  pause: () => void
}

export interface MediaTrack {
  src: string
  kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata'
  srclang?: string
  label?: string
  default?: boolean
}
