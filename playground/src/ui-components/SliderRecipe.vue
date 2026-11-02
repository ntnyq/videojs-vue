<script setup lang="ts">
import { MediaSlider } from 'videojs-vue/ui/slider'
import { SliderFill } from 'videojs-vue/ui/slider-fill'
import { SliderPreview } from 'videojs-vue/ui/slider-preview'
import { SliderThumb } from 'videojs-vue/ui/slider-thumb'
import { SliderThumbnail } from 'videojs-vue/ui/slider-thumbnail'
import { SliderTrack } from 'videojs-vue/ui/slider-track'
import { SliderValue } from 'videojs-vue/ui/slider-value'
import { Thumbnail } from 'videojs-vue/ui/thumbnail'
import { TimeSlider } from 'videojs-vue/ui/time-slider'
import { shallowRef, useAttrs } from 'vue'
import { thumbnails } from './fixtures'
import RecipePlayer from './RecipePlayer.vue'
import type { UiRecipeProps } from './types'

defineOptions({ inheritAttrs: false })
defineProps<UiRecipeProps>()
const attrs = useAttrs()
const DEFAULT_VALUE = 35
const DEFAULT_TIME = 12
const value = shallowRef(DEFAULT_VALUE)
const time = shallowRef(DEFAULT_TIME)
const disabled = shallowRef(false)
function updateValue(event: Event) {
  if (event instanceof CustomEvent && typeof event.detail.value === 'number') {
    value.value = event.detail.value
  }
}
</script>

<template>
  <RecipePlayer
    v-bind="attrs"
    :settings="settings"
    :title="title"
  >
    <label class="ui-option"
      ><input
        v-model="disabled"
        type="checkbox"
      />
      disabled</label
    >
    <p class="mt-4 mb-2 text-xs opacity-70">MediaSlider: {{ value }}</p>
    <MediaSlider
      :value="value"
      :disabled="disabled"
      :min="0"
      :max="100"
      label="Demo value"
      class="ui-slider"
      @value-change="updateValue"
    >
      <SliderTrack /><SliderFill /><SliderThumb /><SliderValue
        class="ui-slider-current"
      />
      <SliderPreview class="ui-preview"
        ><SliderValue type="pointer"
      /></SliderPreview>
    </MediaSlider>
    <p class="mt-4 mb-2 text-xs opacity-70">TimeSlider + SliderThumbnail</p>
    <TimeSlider
      :disabled="disabled"
      class="ui-slider"
    >
      <SliderTrack /><SliderFill /><SliderThumb />
      <SliderPreview class="ui-preview">
        <SliderThumbnail
          :thumbnails="thumbnails"
          class="ui-thumbnail"
        />
        <SliderValue
          type="pointer"
          class="block pt-1"
        />
      </SliderPreview>
    </TimeSlider>
    <div class="mt-5 flex flex-wrap items-center gap-4">
      <Thumbnail
        :time="time"
        :thumbnails="thumbnails"
        class="ui-thumbnail"
      />
      <label class="ui-option"
        >Thumbnail time
        <input
          v-model.number="time"
          type="range"
          min="0"
          max="35"
        />
        {{ time }}s</label
      >
    </div>
  </RecipePlayer>
</template>
