<script setup lang="ts">
import {
  Maximize,
  Pause,
  PictureInPicture2,
  Play,
  Power,
  RotateCcw,
  SlidersHorizontal,
} from '@lucide/vue'
import { useI18n } from 'vue-i18n'
import type { Playground } from '../composables/usePlayground'
import CodePanel from './CodePanel.vue'
import { PlayerDemo } from './PlayerDemo'
import PlayerModeTabs from './PlayerModeTabs.vue'
import PlayerStatePanel from './PlayerStatePanel.vue'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'

defineProps<{ lab: Playground }>()
const emit = defineEmits<{ openSettings: [] }>()
const { t: translate } = useI18n()
function setSeek(lab: Playground, value: string | number) {
  const time = Number(value)
  if (Number.isFinite(time) && time >= 0) {
    lab.seekTime = time
  }
}
</script>
<template>
  <section
    class="p-4 sm:p-5"
    :aria-label="translate('app.preview')"
  >
    <PlayerModeTabs
      :selected="lab.playerType"
      @select="lab.selectPlayerType"
    >
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="flex flex-wrap items-center gap-3">
            <h1 class="text-xl font-semibold tracking-tight sm:text-2xl">
              {{ translate(`examples.${lab.example}.title`) }}
            </h1>
            <Badge
              variant="secondary"
              class="gap-1.5 text-[10px] font-normal"
              ><span
                class="size-1.5 rounded-full"
                :class="lab.isReady ? 'bg-emerald-500' : 'bg-zinc-400'"
              />{{
                translate(
                  lab.isReady
                    ? 'app.ready'
                    : lab.isMounted
                      ? 'app.loading'
                      : 'app.inactive',
                )
              }}</Badge
            >
          </div>
          <p class="mt-2 text-sm text-muted-foreground">
            {{ translate(`examples.${lab.example}.description`) }}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          :aria-label="translate('app.reset')"
          @click="lab.reset"
          ><RotateCcw /><span class="hidden sm:inline">{{
            translate('app.reset')
          }}</span></Button
        >
      </div>
      <Tabs
        v-model="lab.view"
        class="block"
      >
        <div class="mt-3 flex items-center justify-between gap-2 border-b pb-2">
          <TabsList
            ><TabsTrigger value="preview">{{
              translate('app.preview')
            }}</TabsTrigger
            ><TabsTrigger value="code">{{ translate('app.code') }}</TabsTrigger
            ><TabsTrigger value="state">{{
              translate('app.state')
            }}</TabsTrigger></TabsList
          >
          <Button
            variant="outline"
            size="icon-sm"
            class="xl:hidden"
            :aria-label="translate('app.mobileSettings')"
            @click="emit('openSettings')"
            ><SlidersHorizontal
          /></Button>
        </div>
        <TabsContent
          value="preview"
          force-mount
          v-show="lab.view === 'preview'"
          class="mx-auto mt-3 overflow-hidden rounded-md bg-black text-white [&_video-player]:block [&_video-player]:w-full [&_audio-player]:block [&_audio-player]:w-full"
          :class="
            lab.example === 'audio'
              ? 'max-w-3xl p-4 sm:p-8'
              : 'lg:max-w-[clamp(240px,calc((100cqh-21rem)*1.7778),100%)]'
          "
        >
          <PlayerDemo
            v-if="lab.isMounted"
            :lab="lab"
          />
          <div
            v-else
            class="flex aspect-video flex-col items-center justify-center gap-3 px-4 text-center"
          >
            <Power class="mb-1 size-8 text-zinc-500" />
            <p class="font-medium">{{ translate('player.empty') }}</p>
            <p class="text-xs text-zinc-400">
              {{ translate('player.emptyHint') }}
            </p>
            <Button
              variant="secondary"
              class="mt-2"
              @click="lab.toggleMount"
              >{{ translate('player.mount') }}</Button
            >
          </div>
        </TabsContent>
        <TabsContent value="code"
          ><CodePanel
            class="mt-4"
            :code="lab.code"
          />
        </TabsContent>
        <TabsContent value="state"
          ><PlayerStatePanel
            class="mt-4"
            :lab="lab"
          />
        </TabsContent>
        <div class="mt-3 flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            :disabled="!lab.isReady"
            @click="lab.run('play')"
            ><Play />{{ translate('player.play') }}</Button
          >
          <Button
            size="sm"
            variant="outline"
            :disabled="!lab.isReady"
            @click="lab.run('pause')"
            ><Pause />{{ translate('player.pause') }}</Button
          >
          <form
            class="flex items-center"
            @submit.prevent="lab.run('seek', lab.seekTime)"
          >
            <Input
              :model-value="lab.seekTime"
              type="number"
              min="0"
              :aria-label="translate('player.seekTime')"
              class="h-8 w-16 rounded-r-none text-xs"
              :disabled="!lab.isReady"
              @update:model-value="setSeek(lab, $event)"
            /><Button
              type="submit"
              size="sm"
              variant="outline"
              class="rounded-l-none border-l-0"
              :disabled="!lab.isReady"
              >{{ translate('player.seek') }}</Button
            >
          </form>
          <Button
            size="sm"
            variant="outline"
            v-if="lab.example !== 'audio'"
            :disabled="!lab.canPip"
            @click="lab.run('requestPictureInPicture')"
            ><PictureInPicture2 />{{ translate('player.pip') }}</Button
          >
          <Button
            size="sm"
            variant="outline"
            v-if="lab.example !== 'audio'"
            :disabled="!lab.canFullscreen"
            @click="lab.run('requestFullscreen')"
            ><Maximize />{{ translate('player.fullscreen') }}</Button
          >
          <Button
            size="sm"
            variant="outline"
            @click="lab.toggleMount"
            ><Power />{{
              translate(lab.isMounted ? 'player.unmount' : 'player.mount')
            }}</Button
          >
        </div>
        <div
          v-if="lab.failure"
          role="alert"
          class="mt-3 flex items-start justify-between gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive"
        >
          <div>
            <p>{{ translate('player.error') }}</p>
            <p
              v-if="lab.failure !== 'media-error'"
              class="mt-1 break-all opacity-80"
            >
              {{ lab.failure }}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            @click="lab.retry"
            >{{ translate('player.retry') }}</Button
          >
        </div>
        <div
          class="mt-3 flex flex-wrap gap-x-6 gap-y-2 rounded border bg-muted/40 px-3 py-2 font-mono text-[11px] text-muted-foreground"
        >
          <span
            >paused:
            <span class="text-foreground">{{
              lab.snapshot?.paused ?? '—'
            }}</span></span
          ><span
            >currentTime:
            <span class="text-foreground">{{
              lab.snapshot?.currentTime?.toFixed(1) ?? '—'
            }}</span></span
          ><span
            >volume:
            <span class="text-foreground">{{
              lab.snapshot?.volume?.toFixed(2) ?? '—'
            }}</span></span
          >
        </div>
        <p
          class="mt-4 max-w-[80ch] text-xs leading-relaxed text-muted-foreground"
        >
          {{ translate(`examples.${lab.example}.hint`) }}
        </p>
      </Tabs>
    </PlayerModeTabs>
  </section>
</template>
