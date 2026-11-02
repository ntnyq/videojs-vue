<script setup lang="ts">
import { MediaMenu } from 'videojs-vue/ui/menu'
import { MediaMenuCheckboxItem } from 'videojs-vue/ui/menu-checkbox-item'
import { MediaMenuContent } from 'videojs-vue/ui/menu-content'
import { MediaMenuGroup } from 'videojs-vue/ui/menu-group'
import { MediaMenuGroupLabel } from 'videojs-vue/ui/menu-group-label'
import { MediaMenuItem } from 'videojs-vue/ui/menu-item'
import { MediaMenuItemIndicator } from 'videojs-vue/ui/menu-item-indicator'
import { MediaMenuRadioGroup } from 'videojs-vue/ui/menu-radio-group'
import { MediaMenuRadioItem } from 'videojs-vue/ui/menu-radio-item'
import { MediaMenuSeparator } from 'videojs-vue/ui/menu-separator'
import { useVideoPlayerActions } from 'videojs-vue/video/composables'
import type { VideoPlayerHandle } from 'videojs-vue/video/core'
import { shallowRef, useAttrs, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import RecipePlayer from './RecipePlayer.vue'
import type { UiRecipeProps } from './types'

defineOptions({ inheritAttrs: false })
defineProps<UiRecipeProps>()
const attrs = useAttrs()
const menuId = useId()
const player = shallowRef<VideoPlayerHandle | null>(null)
const actions = useVideoPlayerActions(player)
const checked = shallowRef(false)
const selected = shallowRef('1')
const disabled = shallowRef(false)
const { t: translate } = useI18n()
function updateChecked(event: Event) {
  if (
    event instanceof CustomEvent &&
    typeof event.detail.checked === 'boolean'
  ) {
    checked.value = event.detail.checked
  }
}
function updateRate(event: Event) {
  if (
    !(event instanceof CustomEvent) ||
    typeof event.detail.value !== 'string'
  ) {
    return
  }
  selected.value = event.detail.value
  actions.setPlaybackRate(Number(event.detail.value))
}
</script>

<template>
  <RecipePlayer
    v-bind="attrs"
    :settings="settings"
    :title="title"
    @ready="player = $event"
  >
    <button
      type="button"
      class="ui-button"
      :commandfor="menuId"
    >
      {{ translate('uiComponents.open') }} MediaMenu
    </button>
    <MediaMenu
      :id="menuId"
      side="top"
      align="start"
      class="ui-popup ui-menu"
    >
      <MediaMenuContent>
        <MediaMenuGroup>
          <MediaMenuGroupLabel class="ui-menu-heading">{{
            translate('uiComponents.menuSettings')
          }}</MediaMenuGroupLabel>
          <MediaMenuCheckboxItem
            :checked="checked"
            :disabled="disabled"
            @checked-change="updateChecked"
          >
            {{ translate('uiComponents.checkbox')
            }}<MediaMenuItemIndicator :checked="checked"
              >✓</MediaMenuItemIndicator
            >
          </MediaMenuCheckboxItem>
          <MediaMenuSeparator class="my-2 block border-t border-white/20" />
          <MediaMenuRadioGroup
            :value="selected"
            aria-label="Playback rate"
            @value-change="updateRate"
          >
            <MediaMenuRadioItem
              v-for="rate in ['0.5', '1', '1.5', '2']"
              :key="rate"
              :value="rate"
            >
              {{ rate }}×<MediaMenuItemIndicator :checked="selected === rate"
                >✓</MediaMenuItemIndicator
              >
            </MediaMenuRadioItem>
          </MediaMenuRadioGroup>
          <MediaMenuSeparator class="my-2 block border-t border-white/20" />
          <MediaMenuItem
            :disabled="disabled"
            @click="!disabled && actions.seek(0)"
            >{{ translate('uiComponents.restart') }}</MediaMenuItem
          >
        </MediaMenuGroup>
      </MediaMenuContent>
    </MediaMenu>
    <label class="ui-option mt-4"
      ><input
        v-model="disabled"
        type="checkbox"
      />
      disabled</label
    >
    <output class="mt-3 block text-xs"
      >checked: {{ checked }} / value: {{ selected }}</output
    >
  </RecipePlayer>
</template>
