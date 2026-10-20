<script setup lang="ts">
import { VideoPlayer } from 'videojs-vue'
import type { VideoMediaProps, VideoPlayerHandle } from 'videojs-vue'
import { onDeactivated, reactive, useAttrs, useTemplateRef, watch } from 'vue'
import { useMediaExport } from './useMediaExport'

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    settings?: Partial<VideoMediaProps>
    skin?: 'default' | 'neutral'
    title?: string
    labels?: {
      capture: string
      download: string
      cancel: string
      busy: string
    }
  }>(),
  {
    settings: () => ({
      src: 'https://vjs.zencdn.net/v/oceans.mp4',
      crossorigin: 'anonymous',
      playsinline: true,
    }),
    skin: 'default',
    title: 'Video export',
    labels: () => ({
      capture: 'Save current frame',
      download: 'Download MP4',
      cancel: 'Cancel',
      busy: 'Preparing download…',
    }),
  },
)
const attrs = useAttrs()
const player = useTemplateRef<VideoPlayerHandle>('player')
const mediaExport = reactive(
  useMediaExport({
    getMedia: () => player.value?.media ?? null,
    getSource: () => props.settings.src ?? '',
  }),
)
// Invalidate late encodes/responses even if the browser cannot cancel them.
watch(() => props.settings.src, mediaExport.cancel, { flush: 'sync' })
onDeactivated(mediaExport.cancel)
</script>

<template>
  <div class="media-export-example">
    <VideoPlayer
      ref="player"
      v-bind="{ ...settings, ...attrs }"
      :skin="skin"
      :title="title"
    />
    <div class="media-export-actions">
      <button
        type="button"
        :disabled="mediaExport.isBusy"
        @click="mediaExport.capture"
      >
        {{ labels.capture }}
      </button>
      <button
        type="button"
        :disabled="mediaExport.isBusy || !settings.src"
        @click="mediaExport.download"
      >
        {{ labels.download }}
      </button>
      <button
        v-if="mediaExport.isBusy"
        type="button"
        @click="mediaExport.cancel"
      >
        {{ labels.cancel }}
      </button>
      <p
        v-if="mediaExport.isBusy"
        role="status"
      >
        {{ labels.busy }}
      </p>
      <p
        v-if="mediaExport.failure"
        role="alert"
      >
        {{ mediaExport.failure }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.media-export-example {
  color: white;
  background: #18181b;
}
.media-export-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  font-size: 0.875rem;
}
.media-export-actions button {
  border: 1px solid #71717a;
  border-radius: 0.25rem;
  padding: 0.375rem 0.75rem;
  color: inherit;
  background: transparent;
  cursor: pointer;
  font: inherit;
}
.media-export-actions button:disabled {
  opacity: 0.4;
  cursor: default;
}
.media-export-actions button:focus-visible {
  outline: 2px solid #a5b4fc;
  outline-offset: 3px;
}
.media-export-actions [role='alert'] {
  flex-basis: 100%;
  color: #fda4af;
}
</style>
