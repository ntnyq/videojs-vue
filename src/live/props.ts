import type { ExtractPropTypes } from 'vue'
import { videoMediaProps } from '../media/props'

const { playbackRate: _playbackRate, ...props } = videoMediaProps

/**
 * Shared video settings supported by the live preset.
 */
export const liveVideoMediaProps = props
export type LiveVideoMediaProps = ExtractPropTypes<typeof liveVideoMediaProps>
