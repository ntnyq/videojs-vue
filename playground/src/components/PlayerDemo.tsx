import { VideoPlayer } from 'videojs-vue'
import type { VideoPlayerHandle } from 'videojs-vue'
import type { AudioPlayerHandle } from 'videojs-vue/audio'
import type { LiveVideoPlayerHandle } from 'videojs-vue/live/core'
import { Video } from 'videojs-vue/video/core'
import { defineAsyncComponent, defineComponent } from 'vue'
import type { PropType } from 'vue'
import type { Playground } from '../composables/usePlayground'

const LiveDemo = defineAsyncComponent(async () => {
  const module = await import('./LiveDemo')
  return module.LiveDemo
})

const PlaylistDemo = defineAsyncComponent(async () => {
  const module = await import('./PlaylistDemo')
  return module.PlaylistDemo
})

const MediaExportDemo = defineAsyncComponent(async () => {
  const module = await import('./MediaExportDemo')
  return module.MediaExportDemo
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
      handle: VideoPlayerHandle | AudioPlayerHandle | LiveVideoPlayerHandle,
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
      if (lab.example === 'playlist') {
        return (
          <PlaylistDemo
            key={lab.generation}
            lab={lab}
            {...listeners}
          />
        )
      }
      if (lab.example === 'media-export') {
        return (
          <MediaExportDemo
            key={lab.generation}
            lab={lab}
            {...listeners}
          />
        )
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
