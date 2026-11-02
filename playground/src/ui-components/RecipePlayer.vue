<script setup lang="ts">
import { MediaContainer } from 'videojs-vue/ui/container'
import { PlayButton } from 'videojs-vue/ui/play-button'
import { Time } from 'videojs-vue/ui/time'
import { Video, VideoPlayerRoot } from 'videojs-vue/video/core'
import { computed, useAttrs } from 'vue'
import type { VNode } from 'vue'
import { useI18n } from 'vue-i18n'
import type { UiRecipeProps } from './types'
import './recipe.css'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<UiRecipeProps>(), {
  settings: () => ({}),
  title: 'Video.js UI',
})
defineSlots<{ default?: () => VNode[]; overlay?: () => VNode[] }>()
const mediaSettings = computed(() => ({
  src: 'https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4',
  crossorigin: 'anonymous' as const,
  playsinline: true,
  preload: 'metadata' as const,
  ...props.settings,
}))
const attrs = useAttrs()
const { t: translate } = useI18n()
</script>

<template>
  <VideoPlayerRoot
    v-bind="attrs"
    :title="title"
    class="ui-recipe"
  >
    <MediaContainer class="relative block bg-zinc-950 text-white">
      <div class="relative">
        <Video
          v-bind="mediaSettings"
          class="block aspect-video max-h-72 w-full object-contain"
        />
        <slot name="overlay" />
      </div>
      <div
        class="flex min-h-12 flex-wrap items-center gap-3 border-t border-white/15 px-4 py-2"
      >
        <PlayButton class="ui-button"
          >{{ translate('player.play') }} /
          {{ translate('player.pause') }}</PlayButton
        >
        <Time type="current" />
        <span aria-hidden="true">/</span>
        <Time type="duration" />
      </div>
      <div class="ui-recipe-panel"><slot /></div>
    </MediaContainer>
  </VideoPlayerRoot>
</template>
