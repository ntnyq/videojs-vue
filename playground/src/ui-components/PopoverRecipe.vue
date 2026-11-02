<script setup lang="ts">
import { MediaPopover } from 'videojs-vue/ui/popover'
import { SliderFill } from 'videojs-vue/ui/slider-fill'
import { SliderThumb } from 'videojs-vue/ui/slider-thumb'
import { SliderTrack } from 'videojs-vue/ui/slider-track'
import { VolumePopover } from 'videojs-vue/ui/volume-popover'
import { VolumeSlider } from 'videojs-vue/ui/volume-slider'
import { shallowRef, useAttrs, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import RecipePlayer from './RecipePlayer.vue'
import type { UiRecipeProps } from './types'

defineOptions({ inheritAttrs: false })
defineProps<UiRecipeProps>()
const attrs = useAttrs()
const popoverId = useId()
const volumeId = useId()
const openOnHover = shallowRef(false)
const { t: translate } = useI18n()
</script>

<template>
  <RecipePlayer
    v-bind="attrs"
    :settings="settings"
    :title="title"
  >
    <div class="flex flex-wrap items-center gap-3">
      <button
        type="button"
        class="ui-button"
        :commandfor="popoverId"
      >
        {{ translate('uiComponents.open') }} MediaPopover
      </button>
      <MediaPopover
        :id="popoverId"
        side="top"
        :open-on-hover="openOnHover"
        class="ui-popup"
      >
        <p class="mb-3">{{ translate('uiComponents.popoverContent') }}</p>
        <label class="ui-option"
          ><input type="checkbox" />
          {{ translate('uiComponents.checkbox') }}</label
        >
      </MediaPopover>
      <button
        type="button"
        class="ui-button"
        :commandfor="volumeId"
      >
        {{ translate('uiComponents.open') }} VolumePopover
      </button>
      <VolumePopover
        :id="volumeId"
        side="top"
        class="ui-popup"
      >
        <VolumeSlider
          orientation="vertical"
          class="ui-slider ui-slider-vertical"
        >
          <SliderTrack /><SliderFill /><SliderThumb />
        </VolumeSlider>
      </VolumePopover>
    </div>
    <label class="ui-option mt-4"
      ><input
        v-model="openOnHover"
        type="checkbox"
      />
      openOnHover</label
    >
  </RecipePlayer>
</template>
