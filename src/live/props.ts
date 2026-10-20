import type { ExtractPropTypes } from 'vue'
import { mediaProps } from '../media/props'

const { playbackRate: _playbackRate, ...props } = mediaProps

/**
 * Shared video settings supported by the live preset.
 */
export const liveMediaProps = props
export type LiveMediaProps = ExtractPropTypes<typeof liveMediaProps>
