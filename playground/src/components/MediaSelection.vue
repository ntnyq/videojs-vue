<script setup lang="ts">
import { useVideoPlayerState } from 'videojs-vue/video/composables'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Playground } from '../composables/usePlayground'
import SelectField from './SelectField.vue'

const props = defineProps<{ lab: Playground }>()
const { t: translate } = useI18n()

const player = computed(() => {
  const handle = props.lab.player
  return handle && 'selectVideoRendition' in handle ? handle : null
})

const renditions = useVideoPlayerState(
  state => state.videoRenditionList,
  player,
)
const tracks = useVideoPlayerState(state => state.audioTrackList, player)
const quality = computed({
  get: () => renditions.value?.find(item => item.selected)?.id ?? 'auto',
  set: (id: string) => {
    props.lab.run('selectVideoRendition', id)
  },
})
const audioTrack = computed({
  get: () => tracks.value?.find(track => track.enabled)?.id ?? '',
  set: (id: string) => {
    props.lab.run('selectAudioTrack', id)
  },
})
const qualityOptions = computed(() => [
  { value: 'auto', label: translate('player.autoQuality') },
  ...(renditions.value ?? []).map(item => ({
    value: item.id,
    label: item.height ? `${item.height}p` : item.id,
  })),
])
const audioOptions = computed(() =>
  (tracks.value ?? []).map(track => ({
    value: track.id,
    label: track.label || track.language || track.id,
  })),
)
</script>

<template>
  <div class="space-y-4">
    <SelectField
      id="action-quality"
      v-model="quality"
      :label="translate('player.quality')"
      :options="qualityOptions"
      :disabled="!lab.isReady || !renditions?.length"
    />
    <SelectField
      id="action-audio-track"
      v-model="audioTrack"
      :label="translate('player.audioTrack')"
      :options="audioOptions"
      :disabled="!lab.isReady || !tracks?.length"
    />
    <p class="text-xs leading-relaxed text-muted-foreground">
      {{ translate('player.selectionHint') }}
    </p>
  </div>
</template>
