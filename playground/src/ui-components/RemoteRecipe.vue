<script setup lang="ts">
import { AirPlayButton } from 'videojs-vue/ui/airplay-button'
import { CastButton } from 'videojs-vue/ui/cast-button'
import { useVideoPlayerState } from 'videojs-vue/video/composables'
import type { VideoPlayerHandle } from 'videojs-vue/video/core'
import { shallowRef, useAttrs } from 'vue'
import RecipePlayer from './RecipePlayer.vue'
import type { UiRecipeProps } from './types'

defineOptions({ inheritAttrs: false })
defineProps<UiRecipeProps>()
const attrs = useAttrs()
const player = shallowRef<VideoPlayerHandle | null>(null)
const availability = useVideoPlayerState(
  state => state.remotePlaybackAvailability,
  player,
)
const connection = useVideoPlayerState(
  state => state.remotePlaybackState,
  player,
)
</script>

<template>
  <RecipePlayer
    v-bind="attrs"
    :settings="settings"
    :title="title"
    @ready="player = $event"
  >
    <div class="flex flex-wrap gap-3">
      <AirPlayButton class="ui-button">AirPlay</AirPlayButton>
      <CastButton class="ui-button">Chromecast</CastButton>
    </div>
    <output class="mt-4 block text-xs"
      >remotePlaybackAvailability: {{ availability ?? '—' }} /
      remotePlaybackState: {{ connection ?? '—' }}</output
    >
  </RecipePlayer>
</template>
