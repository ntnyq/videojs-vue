import type { ExtractPropTypes, PropType } from 'vue'
import type { MediaTrack } from './types'

export const commonMediaProps = {
  src: String as PropType<string | undefined>,
  autoplay: Boolean,
  loop: Boolean,
  preload: {
    type: String as PropType<'none' | 'metadata' | 'auto'>,
    default: 'metadata',
  },
  crossorigin: String as PropType<
    '' | 'anonymous' | 'use-credentials' | undefined
  >,
  tracks: Array as PropType<readonly MediaTrack[] | undefined>,
  volume: Number as PropType<number | undefined>,
  muted: { type: Boolean as PropType<boolean | undefined>, default: undefined },
  playbackRate: Number as PropType<number | undefined>,
} as const
export const videoMediaProps = {
  ...commonMediaProps,
  poster: String as PropType<string | undefined>,
  playsinline: { type: Boolean, default: true },
} as const
export type CommonMediaProps = ExtractPropTypes<typeof commonMediaProps>
export type VideoMediaProps = ExtractPropTypes<typeof videoMediaProps>
