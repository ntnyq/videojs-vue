<script setup lang="ts">
import { MediaControls } from 'videojs-vue/ui/controls'
import { MediaControlsBackdrop } from 'videojs-vue/ui/controls-backdrop'
import { MediaControlsContent } from 'videojs-vue/ui/controls-content'
import { Time } from 'videojs-vue/ui/time'
import { TimeGroup } from 'videojs-vue/ui/time-group'
import { TimeSeparator } from 'videojs-vue/ui/time-separator'
import { MediaTitle } from 'videojs-vue/ui/title'
import { shallowRef, useAttrs } from 'vue'
import RecipePlayer from './RecipePlayer.vue'
import type { UiRecipeProps } from './types'

defineOptions({ inheritAttrs: false })
defineProps<UiRecipeProps>()
const attrs = useAttrs()
const alwaysVisible = shallowRef(true)
</script>

<template>
  <RecipePlayer
    v-bind="attrs"
    :settings="settings"
    :title="title"
  >
    <template #overlay>
      <MediaControls :visibility="alwaysVisible ? 'always' : undefined">
        <MediaControlsBackdrop class="ui-controls-backdrop" />
        <MediaControlsContent class="ui-controls-content">
          <MediaTitle class="block text-lg font-semibold" />
          <TimeGroup
            class="inline-flex items-center gap-2 text-sm tabular-nums"
          >
            <Time type="current" /><TimeSeparator /><Time type="duration" />
          </TimeGroup>
        </MediaControlsContent>
      </MediaControls>
    </template>
    <label class="ui-option"
      ><input
        v-model="alwaysVisible"
        type="checkbox"
      />
      visibility="always"</label
    >
  </RecipePlayer>
</template>
