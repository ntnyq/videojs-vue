import type { ExtractPropTypes, PropType } from 'vue'
import type { MediaTrack } from '../player/types'

export const mediaProps = {
  src: String as PropType<string | undefined>,
  poster: String as PropType<string | undefined>,
  autoplay: Boolean,
  loop: Boolean,
  preload: {
    type: String as PropType<'none' | 'metadata' | 'auto'>,
    default: 'metadata',
  },
  playsinline: { type: Boolean, default: true },
  crossorigin: String as PropType<
    '' | 'anonymous' | 'use-credentials' | undefined
  >,
  tracks: Array as PropType<readonly MediaTrack[] | undefined>,
  volume: Number as PropType<number | undefined>,
  muted: { type: Boolean as PropType<boolean | undefined>, default: undefined },
  playbackRate: Number as PropType<number | undefined>,
} as const
export type MediaProps = ExtractPropTypes<typeof mediaProps>
