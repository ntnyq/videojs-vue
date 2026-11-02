<script setup lang="ts">
import { BufferingIndicator } from 'videojs-vue/ui/buffering-indicator'
import { MediaGesture } from 'videojs-vue/ui/gesture'
import { Hotkey } from 'videojs-vue/ui/hotkey'
import { SeekIndicator } from 'videojs-vue/ui/seek-indicator'
import { SeekIndicatorValue } from 'videojs-vue/ui/seek-indicator-value'
import { StatusIndicator } from 'videojs-vue/ui/status-indicator'
import { StatusIndicatorValue } from 'videojs-vue/ui/status-indicator-value'
import { VolumeIndicator } from 'videojs-vue/ui/volume-indicator'
import { VolumeIndicatorFill } from 'videojs-vue/ui/volume-indicator-fill'
import { VolumeIndicatorValue } from 'videojs-vue/ui/volume-indicator-value'
import type { VideoPlayerHandle } from 'videojs-vue/video/core'
import { computed, nextTick, onBeforeUnmount, shallowRef, useAttrs } from 'vue'
import { useI18n } from 'vue-i18n'
import RecipePlayer from './RecipePlayer.vue'
import type { UiRecipeProps } from './types'

defineOptions({ inheritAttrs: false })
const props = defineProps<UiRecipeProps>()
const attrs = useAttrs()
const disabled = shallowRef(false)
const DEFAULT_DELAY = 300
const delay = shallowRef(DEFAULT_DELAY)
const player = shallowRef<VideoPlayerHandle | null>(null)
const { t: translate } = useI18n()
const supportsMediaSource = typeof MediaSource !== 'undefined'
const bufferingSource = shallowRef<string | null>(null)
const failure = shallowRef('')
const mediaSettings = computed(() => ({
  ...props.settings,
  ...(bufferingSource.value ? { src: bufferingSource.value } : {}),
}))
function restoreSource() {
  if (bufferingSource.value) {
    URL.revokeObjectURL(bufferingSource.value)
  }
  bufferingSource.value = null
}
async function simulateBuffering() {
  if (!supportsMediaSource || bufferingSource.value) {
    return
  }
  failure.value = ''
  // A real empty MediaSource keeps readyState below HAVE_FUTURE_DATA.
  // Dispatching waiting on an already-buffered video cannot produce this state.
  const source = URL.createObjectURL(new MediaSource())
  bufferingSource.value = source
  await nextTick()
  if (bufferingSource.value !== source) {
    return
  }
  try {
    const media = player.value?.media
    if (!(media instanceof HTMLMediaElement)) {
      throw new Error('Native video is not ready.')
    }
    await media.play()
  } catch (error) {
    if (bufferingSource.value !== source) {
      return
    }
    if (error instanceof DOMException && error.name === 'AbortError') {
      return
    }
    failure.value = error instanceof Error ? error.message : String(error)
    restoreSource()
  }
}
onBeforeUnmount(restoreSource)
</script>

<template>
  <RecipePlayer
    v-bind="attrs"
    :settings="mediaSettings"
    :title="title"
    @ready="player = $event"
  >
    <template #overlay>
      <MediaGesture
        type="tap"
        action="togglePaused"
        :disabled="disabled"
      />
      <MediaGesture
        type="doubletap"
        action="seekStep"
        :value="-5"
        region="left"
        :disabled="disabled"
      />
      <MediaGesture
        type="doubletap"
        action="seekStep"
        :value="5"
        region="right"
        :disabled="disabled"
      />
      <Hotkey
        keys="k"
        action="togglePaused"
      />
      <Hotkey
        keys="ArrowLeft"
        action="seekStep"
        :value="-5"
      />
      <Hotkey
        keys="ArrowRight"
        action="seekStep"
        :value="5"
      />
      <Hotkey
        keys="ArrowUp"
        action="volumeStep"
        :value="0.1"
      />
      <Hotkey
        keys="ArrowDown"
        action="volumeStep"
        :value="-0.1"
      />
      <SeekIndicator
        class="ui-feedback ui-seek-feedback"
        :close-delay="900"
        ><SeekIndicatorValue
      /></SeekIndicator>
      <StatusIndicator
        class="ui-feedback"
        :close-delay="900"
        actions="togglePaused"
        ><StatusIndicatorValue
      /></StatusIndicator>
      <VolumeIndicator
        class="ui-feedback ui-volume-feedback"
        :close-delay="900"
      >
        <VolumeIndicatorValue /><span class="ui-volume-meter"
          ><VolumeIndicatorFill
        /></span>
      </VolumeIndicator>
      <BufferingIndicator
        :delay="delay"
        class="ui-buffering"
        ><span
          class="size-10 animate-spin rounded-full border-2 border-white/30 border-t-white"
          aria-hidden="true"
      /></BufferingIndicator>
    </template>
    <div class="flex flex-wrap gap-3">
      <button
        type="button"
        class="ui-button"
        :disabled="!supportsMediaSource || !!bufferingSource"
        @click="simulateBuffering"
      >
        {{ translate('uiComponents.waiting') }}
      </button>
      <button
        type="button"
        class="ui-button"
        :disabled="!bufferingSource"
        @click="restoreSource"
      >
        {{ translate('uiComponents.playing') }}
      </button>
    </div>
    <p
      v-if="!supportsMediaSource"
      class="mt-3 text-xs opacity-70"
    >
      {{ translate('settings.unsupported') }}: MediaSource
    </p>
    <p
      v-if="failure"
      role="alert"
      class="mt-3 text-sm text-red-300"
    >
      {{ failure }}
    </p>
    <div class="mt-4 flex flex-wrap gap-4">
      <label class="ui-option"
        ><input
          v-model="disabled"
          type="checkbox"
        />
        MediaGesture disabled</label
      >
      <label class="ui-option"
        >Buffering delay
        <input
          v-model.number="delay"
          type="range"
          min="0"
          max="1000"
          step="100"
        />
        {{ delay }}ms</label
      >
    </div>
  </RecipePlayer>
</template>
