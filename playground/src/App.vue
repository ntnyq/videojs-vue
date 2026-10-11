<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import { MediaI18n } from 'videojs-vue/i18n'
import { shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AppHeader from './components/AppHeader.vue'
import EventConsole from './components/EventConsole.vue'
import ExampleNav from './components/ExampleNav.vue'
import PlayerSettings from './components/PlayerSettings.vue'
import PlayerStage from './components/PlayerStage.vue'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from './components/ui/resizable'
import { ScrollArea } from './components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from './components/ui/sheet'
import { usePlayground } from './composables/usePlayground'
import type { ExampleId } from './data'

const { t: translate, locale } = useI18n()
const lab = usePlayground()
const isWide = useMediaQuery('(min-width: 1280px)')
const isDesktop = useMediaQuery('(min-width: 1024px)')
const isNavigationOpen = shallowRef(false)
const isSettingsOpen = shallowRef(false)
watch(isWide, wide => {
  if (wide) {
    isSettingsOpen.value = false
  }
})
watch(isDesktop, desktop => {
  if (desktop) {
    isNavigationOpen.value = false
  }
})
function selectExample(example: ExampleId) {
  lab.selectExample(example)
  isNavigationOpen.value = false
}
</script>
<template>
  <MediaI18n
    :lang="locale"
    class="block"
  >
    <div
      class="min-h-dvh bg-background text-foreground lg:h-dvh lg:overflow-hidden"
    >
      <AppHeader @open-navigation="isNavigationOpen = true" />
      <div class="flex lg:h-[calc(100dvh-3.5rem)]">
        <aside class="hidden w-56 shrink-0 border-r lg:block">
          <ExampleNav
            :selected="lab.example"
            @select="selectExample"
          />
        </aside>
        <main class="min-w-0 flex-1">
          <ResizablePanelGroup
            direction="vertical"
            class="max-lg:!h-auto"
          >
            <ResizablePanel
              :default-size="70"
              :min-size="35"
              class="max-lg:!flex-none max-lg:!overflow-visible"
            >
              <ResizablePanelGroup
                direction="horizontal"
                class="max-lg:!h-auto"
              >
                <ResizablePanel
                  :default-size="isWide ? 72 : 100"
                  :min-size="45"
                  class="max-lg:!overflow-visible"
                >
                  <ScrollArea
                    class="h-full [container-type:size] max-lg:h-auto max-lg:[container-type:normal]"
                    ><PlayerStage
                      :lab="lab"
                      @open-settings="isSettingsOpen = true"
                  /></ScrollArea>
                </ResizablePanel>
                <ResizableHandle
                  v-if="isWide"
                  with-handle
                />
                <ResizablePanel
                  v-if="isWide"
                  :default-size="28"
                  :min-size="23"
                  :max-size="40"
                  ><PlayerSettings :lab="lab"
                /></ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
            <ResizableHandle
              :disabled="!isDesktop"
              :with-handle="isDesktop"
            />
            <ResizablePanel
              :default-size="30"
              :min-size="20"
              class="max-lg:!flex-none"
              ><EventConsole :lab="lab"
            /></ResizablePanel>
          </ResizablePanelGroup>
        </main>
      </div>
      <Sheet v-model:open="isNavigationOpen"
        ><SheetContent
          side="left"
          class="w-72 gap-0 p-0"
          :close-label="translate('app.close')"
          ><SheetHeader class="px-6 pt-6 pb-2"
            ><SheetTitle>{{ translate('app.examples') }}</SheetTitle
            ><SheetDescription>{{
              translate('app.inspect')
            }}</SheetDescription></SheetHeader
          ><ExampleNav
            :selected="lab.example"
            @select="selectExample" /></SheetContent
      ></Sheet>
      <Sheet v-model:open="isSettingsOpen"
        ><SheetContent
          class="w-[min(100vw,400px)] gap-0 p-0"
          :close-label="translate('app.close')"
          ><SheetHeader class="px-5 pt-6 pb-2"
            ><SheetTitle>{{ translate('app.settings') }}</SheetTitle
            ><SheetDescription>{{
              translate('settings.live')
            }}</SheetDescription></SheetHeader
          >
          <div class="min-h-0 flex-1">
            <PlayerSettings :lab="lab" /></div></SheetContent
      ></Sheet></div
  ></MediaI18n>
</template>
