<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Playground } from '../composables/usePlayground'
import MediaSelection from './MediaSelection.vue'
import NumberField from './NumberField.vue'
import SelectField from './SelectField.vue'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Separator } from './ui/separator'
import { Switch } from './ui/switch'

const props = defineProps<{
  lab: Playground
}>()

const { t: translate } = useI18n()

const DEFAULT_ACTION_VOLUME = 0.5
const DEFAULT_ACTION_RATE = 1.5

const volume = shallowRef(DEFAULT_ACTION_VOLUME)
const muted = shallowRef(true)
const rate = shallowRef(DEFAULT_ACTION_RATE)

const actionsHook = computed(() => {
  if (props.lab.example === 'audio') {
    return 'useAudioPlayerActions'
  }
  if (props.lab.example === 'live') {
    return 'useLiveVideoPlayerActions'
  }
  return 'useVideoPlayerActions'
})
const targets = computed(() => [
  {
    value: 'composable',
    label: `${actionsHook.value}(player)`,
  },
  { value: 'ref', label: 'player.value' },
])
const methods = computed(() =>
  (
    [
      { name: 'play', label: translate('player.play'), capability: 'ready' },
      { name: 'pause', label: translate('player.pause'), capability: 'ready' },
      {
        name: 'requestFullscreen',
        label: translate('player.fullscreen'),
        capability: 'fullscreen',
      },
      {
        name: 'exitFullscreen',
        label: translate('player.exitFullscreen'),
        capability: 'fullscreen',
      },
      {
        name: 'requestPictureInPicture',
        label: translate('player.pip'),
        capability: 'pip',
      },
      {
        name: 'exitPictureInPicture',
        label: translate('player.exitPip'),
        capability: 'pip',
      },
    ] as const
  ).filter(
    method => props.lab.example !== 'audio' || method.capability === 'ready',
  ),
)
</script>

<template>
  <div class="space-y-5 pt-3">
    <SelectField
      id="action-target"
      v-model="lab.actionTarget"
      :label="translate('settings.target')"
      :options="targets"
    />
    <div class="grid gap-2">
      <Button
        v-for="method in methods"
        :key="method.name"
        variant="outline"
        class="justify-between text-xs"
        :disabled="
          !lab.isReady ||
          (method.capability === 'pip' && !lab.canPip) ||
          (method.capability === 'fullscreen' && !lab.canFullscreen)
        "
        @click="lab.run(method.name)"
        ><code>{{ method.name }}()</code
        ><span class="text-muted-foreground">{{ method.label }}</span></Button
      >
    </div>
    <Separator />
    <MediaSelection
      v-if="lab.playerType === 'video' && lab.example !== 'live'"
      :lab="lab"
    />
    <NumberField
      id="action-seek"
      v-model="lab.seekTime"
      :label="translate('settings.seek')"
      :max="
        Number.isFinite(lab.snapshot?.duration)
          ? lab.snapshot?.duration
          : undefined
      "
      :disabled="!lab.isReady"
    />
    <Button
      class="w-full"
      variant="outline"
      :disabled="!lab.isReady"
      @click="lab.run('seek', lab.seekTime)"
      >seek({{ lab.seekTime }})</Button
    >
    <NumberField
      id="action-volume"
      v-model="volume"
      :label="translate('settings.volume')"
      :max="1"
      :step="0.05"
    />
    <Button
      class="w-full"
      variant="outline"
      :disabled="!lab.isReady"
      @click="lab.run('setVolume', volume)"
      >setVolume({{ volume }})</Button
    >
    <NumberField
      v-if="lab.example !== 'live'"
      id="action-rate"
      v-model="rate"
      :label="translate('settings.rate')"
      :min="0.25"
      :max="4"
      :step="0.25"
    />
    <Button
      class="w-full"
      variant="outline"
      :disabled="!lab.isReady"
      v-if="lab.example !== 'live'"
      @click="lab.run('setPlaybackRate', rate)"
      >setPlaybackRate({{ rate }})</Button
    >
    <div class="flex items-center justify-between">
      <Label for="action-muted">{{ translate('settings.muted') }}</Label
      ><Switch
        id="action-muted"
        v-model="muted"
      />
    </div>
    <Button
      class="w-full"
      variant="outline"
      :disabled="!lab.isReady"
      @click="lab.run('setMuted', muted)"
      >setMuted({{ muted }})</Button
    >
    <p class="text-xs leading-relaxed text-muted-foreground">
      {{ translate('examples.actions.hint') }}
    </p>
  </div>
</template>
