<script setup lang="ts">
import { AlertDialog } from 'videojs-vue/ui/alert-dialog'
import { MediaDialog } from 'videojs-vue/ui/dialog'
import { MediaDialogBackdrop } from 'videojs-vue/ui/dialog-backdrop'
import { MediaDialogClose } from 'videojs-vue/ui/dialog-close'
import { MediaDialogDescription } from 'videojs-vue/ui/dialog-description'
import { MediaDialogPopup } from 'videojs-vue/ui/dialog-popup'
import { MediaDialogTitle } from 'videojs-vue/ui/dialog-title'
import { ErrorDialog } from 'videojs-vue/ui/error-dialog'
import { computed, shallowRef, useAttrs, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import RecipePlayer from './RecipePlayer.vue'
import type { UiRecipeProps } from './types'

defineOptions({ inheritAttrs: false })
const props = defineProps<UiRecipeProps>()
const attrs = useAttrs()
const dialogId = useId()
const alertId = useId()
const closeOnEscape = shallowRef(true)
const brokenSource = shallowRef(false)
const errorSettings = computed(() => ({
  ...props.settings,
  ...(brokenSource.value
    ? { src: '/ui-components-missing-video.mp4', preload: 'auto' as const }
    : {}),
}))
const { t: translate } = useI18n()
</script>

<template>
  <RecipePlayer
    v-bind="attrs"
    :settings="errorSettings"
    :title="title"
  >
    <div class="flex flex-wrap gap-3">
      <button
        type="button"
        class="ui-button"
        :commandfor="dialogId"
      >
        {{ translate('uiComponents.open') }} MediaDialog
      </button>
      <MediaDialog
        :id="dialogId"
        :close-on-escape="closeOnEscape"
        class="ui-dialog"
      >
        <MediaDialogBackdrop class="ui-dialog-backdrop" />
        <MediaDialogPopup class="ui-dialog-popup">
          <MediaDialogTitle class="text-lg font-semibold"
            >MediaDialog</MediaDialogTitle
          >
          <MediaDialogDescription class="my-4 block text-sm opacity-75">{{
            translate('uiComponents.dialogContent')
          }}</MediaDialogDescription>
          <MediaDialogClose class="ui-button">{{
            translate('app.close')
          }}</MediaDialogClose>
        </MediaDialogPopup>
      </MediaDialog>
      <button
        type="button"
        class="ui-button"
        :commandfor="alertId"
      >
        {{ translate('uiComponents.open') }} AlertDialog
      </button>
      <AlertDialog
        :id="alertId"
        :close-on-escape="closeOnEscape"
        class="ui-dialog"
      >
        <MediaDialogBackdrop class="ui-dialog-backdrop" />
        <MediaDialogPopup class="ui-dialog-popup">
          <MediaDialogTitle class="text-lg font-semibold"
            >AlertDialog</MediaDialogTitle
          >
          <MediaDialogDescription class="my-4 block text-sm opacity-75">{{
            translate('uiComponents.alertContent')
          }}</MediaDialogDescription>
          <MediaDialogClose class="ui-button">{{
            translate('uiComponents.confirm')
          }}</MediaDialogClose>
        </MediaDialogPopup>
      </AlertDialog>
      <button
        type="button"
        class="ui-button"
        @click="brokenSource = !brokenSource"
      >
        {{
          translate(
            brokenSource
              ? 'uiComponents.restoreSource'
              : 'uiComponents.triggerError',
          )
        }}
      </button>
      <ErrorDialog class="ui-dialog">
        <MediaDialogBackdrop class="ui-dialog-backdrop" />
        <MediaDialogPopup class="ui-dialog-popup">
          <MediaDialogTitle class="text-lg font-semibold" />
          <MediaDialogDescription class="my-4 block text-sm opacity-75" />
          <MediaDialogClose
            class="ui-button"
            @click="brokenSource = false"
          />
        </MediaDialogPopup>
      </ErrorDialog>
    </div>
    <label class="ui-option mt-4"
      ><input
        v-model="closeOnEscape"
        type="checkbox"
      />
      closeOnEscape</label
    >
  </RecipePlayer>
</template>
