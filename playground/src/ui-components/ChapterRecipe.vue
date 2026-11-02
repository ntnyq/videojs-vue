<script setup lang="ts">
import { SliderPreview } from 'videojs-vue/ui/slider-preview'
import { SliderThumb } from 'videojs-vue/ui/slider-thumb'
import { SliderValue } from 'videojs-vue/ui/slider-value'
import { TimeSlider } from 'videojs-vue/ui/time-slider'
import { TimeSliderChapterTitle } from 'videojs-vue/ui/time-slider-chapter-title'
import { TimeSliderChapters } from 'videojs-vue/ui/time-slider-chapters'
import { computed, useAttrs } from 'vue'
import RecipePlayer from './RecipePlayer.vue'
import type { UiRecipeProps } from './types'

defineOptions({ inheritAttrs: false })
const props = defineProps<UiRecipeProps>()
const attrs = useAttrs()
const settingsWithChapters = computed(() => ({
  ...props.settings,
  tracks: [
    ...(props.settings?.tracks ?? []),
    {
      kind: 'chapters' as const,
      src: '/ui-chapters.vtt',
      srclang: 'en',
      label: 'Chapters',
      default: true,
    },
  ],
}))
// Static authored markup only: Vue must populate template.content for upstream cloning.
const chapterMarkup =
  '<div class="ui-chapter"><span class="ui-chapter-buffer"></span><span class="ui-chapter-fill"></span></div>'
</script>

<template>
  <RecipePlayer
    v-bind="attrs"
    :settings="settingsWithChapters"
    :title="title"
  >
    <TimeSlider class="ui-slider">
      <TimeSliderChapters class="ui-chapters"
        ><template v-html="chapterMarkup"
      /></TimeSliderChapters>
      <SliderThumb />
      <SliderPreview class="ui-preview"
        ><SliderValue type="pointer" /><TimeSliderChapterTitle class="block"
      /></SliderPreview>
      <TimeSliderChapterTitle class="ui-slider-current" />
    </TimeSlider>
    <p class="mt-4 text-xs opacity-70">
      00:00 Intro / 00:08 Coast / 00:18 Ride / 00:28 Finish
    </p>
  </RecipePlayer>
</template>
