import '@videojs/html/video/player'
import {
  defineComponent,
  h,
  nextTick,
  onActivated,
  onBeforeUnmount,
  onDeactivated,
  onMounted,
  provide,
  shallowRef,
} from 'vue'
import type { PropType } from 'vue'
import { mediaEmits } from '../media/events'
import type { MediaEventName } from '../media/events'
import { createPlayerActions } from './actions'
import { PLAYER_CONTEXT } from './context'
import type {
  PlayerElement,
  PlayerHandle,
  PlayerMedia,
  PlayerStore,
} from './types'

export const playerEmits = {
  ...mediaEmits,
  ready: (_player: PlayerHandle) => true,
  'update:volume': (_volume: number) => true,
  'update:muted': (_muted: boolean) => true,
  'update:playbackRate': (_rate: number) => true,
}

const component = defineComponent({
  name: 'PlayerRoot',
  inheritAttrs: false,
  props: {
    title: String as PropType<string | undefined>,
    poster: String as PropType<string | undefined>,
  },
  emits: playerEmits,
  setup(props, { attrs, slots, emit, expose }) {
    const element = shallowRef<PlayerElement | null>(null)
    const store = shallowRef<PlayerStore | null>(null)
    const media = shallowRef<PlayerMedia | null>(null)
    let isActive = true
    let activation = 0
    const handle: PlayerHandle = {
      get element() {
        return store.value ? element.value : null
      },
      get store() {
        return store.value
      },
      get media() {
        return store.value ? media.value : null
      },
      ...createPlayerActions(() => store.value),
    }
    let isSettingsSyncPending = false
    let confirmedSettings:
      | { volume: number; muted: boolean; playbackRate: number }
      | undefined
    function confirmSettings() {
      if (isSettingsSyncPending) {
        return
      }
      isSettingsSyncPending = true
      nextTick(() => {
        isSettingsSyncPending = false
        const current = media.value
        if (!isActive || !current) {
          return
        }
        // Read after Vue finishes applying a batch of settings. A muted update can
        // Fire volumechange before the new volume prop has reached the media.
        const actual = {
          volume: current.volume,
          muted: current.muted,
          playbackRate: current.playbackRate,
        }
        if (actual.volume !== confirmedSettings?.volume) {
          emit('update:volume', actual.volume)
        }
        if (actual.muted !== confirmedSettings?.muted) {
          emit('update:muted', actual.muted)
        }
        if (actual.playbackRate !== confirmedSettings?.playbackRate) {
          emit('update:playbackRate', actual.playbackRate)
        }
        confirmedSettings = actual
      })
    }
    const emitMedia = emit as (name: MediaEventName, event: Event) => void
    provide(PLAYER_CONTEXT, {
      handle,
      setMedia(next) {
        media.value = next
        confirmedSettings = undefined
      },
      onMediaEvent(name, event) {
        emitMedia(name, event)
        if (name === 'volumechange' || name === 'ratechange') {
          confirmSettings()
        }
      },
    })
    expose(handle)

    async function activate() {
      isActive = true
      const token = ++activation
      await nextTick()
      const current = element.value
      if (!current) {
        return
      }
      await current.updateComplete
      if (!isActive || token !== activation || element.value !== current) {
        return
      }
      const next = current.store
      if (store.value === next) {
        return
      }
      store.value = next
      emit('ready', handle)
    }
    function deactivate() {
      isActive = false
      activation++
      media.value?.pause()
      store.value = null
    }
    onMounted(activate)
    onActivated(activate)
    onDeactivated(deactivate)
    onBeforeUnmount(deactivate)

    return () =>
      h(
        'video-player',
        {
          ...attrs,
          ref: element,
          title: props.title,
          poster: props.poster,
        },
        slots['default']?.(),
      )
  },
})

/**
 * Vue component ref exposes the player handle alongside the standard instance.
 */
export const PlayerRoot = component as typeof component & {
  new (): InstanceType<typeof component> & PlayerHandle
}
