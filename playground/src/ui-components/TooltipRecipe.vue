<script setup lang="ts">
import { Hotkey } from 'videojs-vue/ui/hotkey'
import { MuteButton } from 'videojs-vue/ui/mute-button'
import { PlayButton } from 'videojs-vue/ui/play-button'
import { Tooltip } from 'videojs-vue/ui/tooltip'
import { TooltipGroup } from 'videojs-vue/ui/tooltip-group'
import { TooltipLabel } from 'videojs-vue/ui/tooltip-label'
import { TooltipShortcut } from 'videojs-vue/ui/tooltip-shortcut'
import { shallowRef, useAttrs } from 'vue'
import { useI18n } from 'vue-i18n'
import RecipePlayer from './RecipePlayer.vue'
import type { UiRecipeProps } from './types'

defineOptions({ inheritAttrs: false })
defineProps<UiRecipeProps>()
const attrs = useAttrs()
const DEFAULT_DELAY = 300
const delay = shallowRef(DEFAULT_DELAY)
const disabled = shallowRef(false)
const { t: translate } = useI18n()
</script>

<template>
  <RecipePlayer
    v-bind="attrs"
    :settings="settings"
    :title="title"
  >
    <Hotkey
      keys="k"
      action="togglePaused"
    />
    <Hotkey
      keys="m"
      action="toggleMuted"
    />
    <TooltipGroup
      :delay="delay"
      :timeout="800"
      class="flex flex-wrap gap-3"
    >
      <PlayButton class="ui-button"
        >{{ translate('player.play') }} /
        {{ translate('player.pause') }}</PlayButton
      >
      <Tooltip
        :disabled="disabled"
        side="top"
        class="ui-tooltip"
      >
        <TooltipLabel /><TooltipShortcut class="ml-3 opacity-60" />
      </Tooltip>
      <MuteButton class="ui-button">{{ translate('player.mute') }}</MuteButton>
      <Tooltip
        :disabled="disabled"
        side="top"
        class="ui-tooltip"
      >
        <TooltipLabel /><TooltipShortcut class="ml-3 opacity-60" />
      </Tooltip>
    </TooltipGroup>
    <div class="mt-4 flex flex-wrap gap-4">
      <label class="ui-option"
        >delay
        <input
          v-model.number="delay"
          type="range"
          min="0"
          max="1000"
          step="100"
        />
        {{ delay }}ms</label
      >
      <label class="ui-option"
        ><input
          v-model="disabled"
          type="checkbox"
        />
        disabled</label
      >
    </div>
  </RecipePlayer>
</template>
