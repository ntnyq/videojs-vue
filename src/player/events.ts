import { mediaEmits } from '../media/events'

export function createPlayerEmits<Handle>() {
  return {
    ...mediaEmits,
    ready: (_player: Handle) => true,
    'update:volume': (_volume: number) => true,
    'update:muted': (_muted: boolean) => true,
    'update:playbackRate': (_rate: number) => true,
  }
}
