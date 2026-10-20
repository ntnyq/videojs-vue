import { VideoPlayer } from 'videojs-vue'
import type { PlayerHandle } from 'videojs-vue'
import type { AudioPlayerHandle } from 'videojs-vue/audio'
import { Video } from 'videojs-vue/core'
import type { LivePlayerHandle } from 'videojs-vue/live/core'
import { defineAsyncComponent, defineComponent } from 'vue'
import type { PropType } from 'vue'
import type { Playground } from '../composables/usePlayground'

const LiveDemo = defineAsyncComponent(async () => {
  const module = await import('./LiveDemo')
  return module.LiveDemo
})

const AudioDemo = defineAsyncComponent(async () => {
  const module = await import('./AudioDemo')
  return module.AudioDemo
})
const CustomPlayerDemo = defineAsyncComponent(async () => {
  const module = await import('./CustomPlayerDemo')
  return module.CustomPlayerDemo
})

const HlsVideo = defineAsyncComponent(async () => {
  const media = await import('videojs-vue/media/hls')
  return media.HlsVideo
})

export const PlayerDemo = defineComponent({
  props: { lab: { type: Object as PropType<Playground>, required: true } },
  setup(props) {
    function onReady(
      handle: PlayerHandle | AudioPlayerHandle | LivePlayerHandle,
    ) {
      props.lab.setPlayer(handle)
      props.lab.log.record('lifecycle', 'ready', { example: props.lab.example })
    }
    return () => {
      const { lab } = props
      const listeners = {
        ...lab.listeners,
        onReady,
        'onUpdate:volume': (value: number) => lab.syncModel('volume', value),
        'onUpdate:muted': (value: boolean) => lab.syncModel('muted', value),
        'onUpdate:playbackRate': (value: number) =>
          lab.syncModel('playbackRate', value),
      }
      if (lab.example === 'live') {
        return (
          <LiveDemo
            key={lab.generation}
            lab={lab}
            {...listeners}
          />
        )
      }
      if (lab.example === 'audio') {
        return (
          <AudioDemo
            key={lab.generation}
            lab={lab}
            {...listeners}
          />
        )
      }
      if (lab.example === 'custom') {
        return (
          <CustomPlayerDemo
            key={lab.generation}
            lab={lab}
            {...listeners}
          />
        )
      }
      return (
        <VideoPlayer
          key={lab.generation}
          {...lab.mediaProps}
          title={lab.config.title}
          skin={lab.config.skin}
          media={lab.example === 'hls' ? HlsVideo : Video}
          {...listeners}
        />
      )
    }
  },
})
