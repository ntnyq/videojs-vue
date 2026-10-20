import { mediaEmits } from '../media/events'

export function createPlaybackEmits<Handle>() {
  return {
    ...mediaEmits,
    ready: (_player: Handle) => true,
    'update:volume': (_volume: number) => true,
    'update:muted': (_muted: boolean) => true,
  }
}

export function createOnDemandPlayerEmits<Handle>() {
  return {
    ...createPlaybackEmits<Handle>(),
    'update:playbackRate': (_rate: number) => true,
  }
}
