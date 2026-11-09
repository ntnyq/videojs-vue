<script setup lang="ts">
import { RotateCcw } from '@lucide/vue'
import { computed, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Playground } from '../composables/usePlayground'
import ActionPanel from './ActionPanel.vue'
import NumberField from './NumberField.vue'
import SelectField from './SelectField.vue'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { ScrollArea } from './ui/scroll-area'
import { SheetTitle } from './ui/sheet'
import { Slider } from './ui/slider'
import { Switch } from './ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import UrlField from './UrlField.vue'

const props = defineProps<{ lab: Playground; drawer?: boolean }>()
const { t: translate } = useI18n()
const resetGeneration = shallowRef(0)
function resetParameters() {
  props.lab.resetConfig()
  resetGeneration.value++
}
const skins = [
  { value: 'default', label: 'default' },
  { value: 'neutral', label: 'neutral' },
] as const
const preloads = ['none', 'metadata', 'auto'].map(value => ({
  value,
  label: value,
}))
const cors = [
  { value: 'none', label: '—' },
  { value: 'anonymous', label: 'anonymous' },
  { value: 'use-credentials', label: 'use-credentials' },
]
const crossOrigin = computed({
  get: () => props.lab.config.crossorigin || 'none',
  set: value => {
    if (
      value === 'none' ||
      value === 'anonymous' ||
      value === 'use-credentials'
    ) {
      props.lab.updateConfig(
        'crossorigin',
        value === 'none' ? undefined : value,
      )
    }
  },
})
const preload = computed({
  get: () => props.lab.config.preload,
  set: value => {
    if (value === 'none' || value === 'metadata' || value === 'auto') {
      props.lab.updateConfig('preload', value)
    }
  },
})
const volume = computed({
  get: () => props.lab.config.volume,
  set: value => props.lab.updateConfig('volume', value),
})
const rate = computed({
  get: () => props.lab.config.playbackRate,
  set: value => props.lab.updateConfig('playbackRate', value),
})
const skin = computed({
  get: () => props.lab.config.skin,
  set: value => props.lab.updateConfig('skin', value),
})
const booleanProps = computed(() => {
  if (props.lab.example === 'playlist') {
    return ['muted', 'playsinline'] as const
  }
  return props.lab.example === 'audio'
    ? (['muted', 'autoplay', 'loop'] as const)
    : (['muted', 'autoplay', 'loop', 'playsinline'] as const)
})
</script>
<template>
  <section
    class="flex h-full min-h-0 flex-col bg-background"
    :aria-label="translate('app.settings')"
  >
    <div
      :class="[
        'flex min-h-16 shrink-0 items-center justify-between gap-2 px-5',
        { 'pr-12': drawer },
      ]"
    >
      <SheetTitle
        v-if="drawer"
        class="text-sm font-semibold"
        >{{ translate('app.settings') }}</SheetTitle
      >
      <h2
        v-else
        class="text-sm font-semibold"
      >
        {{ translate('app.settings') }}
      </h2>
      <Button
        variant="ghost"
        size="sm"
        @click="resetParameters"
        ><RotateCcw class="size-4" />{{ translate('settings.reset') }}</Button
      >
    </div>
    <ScrollArea class="min-h-0 flex-1 px-5 pb-5">
      <Tabs
        :key="`${lab.generation}:${resetGeneration}`"
        v-model="lab.inspectorTab"
      >
        <TabsList class="mb-2 grid w-full grid-cols-2"
          ><TabsTrigger value="props">{{
            translate('settings.props')
          }}</TabsTrigger
          ><TabsTrigger value="actions">{{
            translate('settings.actions')
          }}</TabsTrigger></TabsList
        >
        <TabsContent value="props">
          <Accordion
            type="multiple"
            :default-value="['media', 'playback']"
          >
            <AccordionItem value="media"
              ><AccordionTrigger>{{
                translate('settings.media')
              }}</AccordionTrigger
              ><AccordionContent class="space-y-4">
                <p
                  v-if="lab.example === 'playlist'"
                  class="text-xs text-muted-foreground"
                >
                  {{ translate('examples.playlist.hint') }}
                </p>
                <UrlField
                  v-else
                  id="source-url"
                  label="src"
                  :model-value="lab.config.src"
                  required
                  @apply="lab.updateConfig('src', $event)"
                />
                <SelectField
                  id="skin"
                  v-model="skin"
                  label="skin"
                  :options="skins"
                  :disabled="
                    [
                      'custom',
                      'captions',
                      'playlist',
                      'ui-components',
                    ].includes(lab.example)
                  "
                />
                <p
                  v-if="
                    ['custom', 'captions', 'ui-components'].includes(
                      lab.example,
                    )
                  "
                  class="text-xs text-muted-foreground"
                >
                  {{ translate('settings.customSkin') }}
                </p>
              </AccordionContent></AccordionItem
            >
            <AccordionItem
              v-if="lab.example !== 'playlist'"
              value="advanced"
            >
              <AccordionTrigger>{{
                translate('settings.advanced')
              }}</AccordionTrigger>
              <AccordionContent class="space-y-4">
                <div class="space-y-2">
                  <Label
                    for="player-title"
                    class="text-xs"
                    >title</Label
                  ><Input
                    id="player-title"
                    :model-value="lab.config.title"
                    @update:model-value="
                      lab.updateConfig('title', String($event))
                    "
                  />
                </div>
                <UrlField
                  id="poster-url"
                  label="poster"
                  :model-value="lab.config.poster"
                  @apply="lab.updateConfig('poster', $event)"
                />
                <SelectField
                  id="crossorigin"
                  v-model="crossOrigin"
                  label="crossorigin"
                  :options="cors"
                /> </AccordionContent
            ></AccordionItem>
            <AccordionItem value="playback"
              ><AccordionTrigger>{{
                translate('settings.playback')
              }}</AccordionTrigger
              ><AccordionContent class="space-y-5">
                <div class="grid grid-cols-[1fr_72px] items-end gap-4">
                  <div class="space-y-4 pb-3">
                    <Label
                      class="text-xs"
                      for="volume-slider"
                      >volume
                      <span class="ml-auto text-muted-foreground"
                        >{{ Math.round(volume * 100) }}%</span
                      ></Label
                    ><Slider
                      id="volume-slider"
                      thumb-label="volume"
                      :model-value="[volume]"
                      :min="0"
                      :max="1"
                      :step="0.01"
                      aria-label="volume"
                      @update:model-value="volume = $event?.[0] ?? volume"
                    />
                  </div>
                  <NumberField
                    id="volume"
                    v-model="volume"
                    label="0–1"
                    :max="1"
                    :step="0.01"
                  />
                </div>
                <NumberField
                  v-if="lab.example !== 'live'"
                  id="playback-rate"
                  v-model="rate"
                  label="playbackRate"
                  :min="0.25"
                  :max="4"
                  :step="0.25"
                />
                <div
                  v-for="key in booleanProps"
                  :key="key"
                  class="flex items-center justify-between"
                >
                  <Label
                    :for="key"
                    class="text-xs"
                    >{{ key }}</Label
                  ><Switch
                    :id="key"
                    :model-value="lab.config[key]"
                    @update:model-value="lab.updateConfig(key, $event)"
                  />
                </div>
                <SelectField
                  id="preload"
                  v-model="preload"
                  label="preload"
                  :options="preloads"
                /> </AccordionContent
            ></AccordionItem>
            <AccordionItem
              v-if="lab.example !== 'audio'"
              value="tracks"
              ><AccordionTrigger>{{
                translate('settings.tracks')
              }}</AccordionTrigger
              ><AccordionContent class="space-y-4">
                <div class="flex items-center justify-between">
                  <Label
                    for="captions-enabled"
                    class="text-xs"
                    >{{ translate('settings.enabled') }}</Label
                  ><Switch
                    id="captions-enabled"
                    :model-value="lab.config.hasCaptions"
                    @update:model-value="
                      lab.updateConfig('hasCaptions', $event)
                    "
                  />
                </div>
                <UrlField
                  id="track-src"
                  :label="translate('settings.trackSrc')"
                  :model-value="lab.config.trackSrc"
                  @apply="lab.updateConfig('trackSrc', $event)"
                />
                <div class="space-y-2">
                  <Label
                    for="track-language"
                    class="text-xs"
                    >{{ translate('settings.trackLanguage') }}</Label
                  ><Input
                    id="track-language"
                    :model-value="lab.config.trackLanguage"
                    @update:model-value="
                      lab.updateConfig('trackLanguage', String($event))
                    "
                  />
                </div>
                <div class="space-y-2">
                  <Label
                    for="track-label"
                    class="text-xs"
                    >{{ translate('settings.trackLabel') }}</Label
                  ><Input
                    id="track-label"
                    :model-value="lab.config.trackLabel"
                    @update:model-value="
                      lab.updateConfig('trackLabel', String($event))
                    "
                  />
                </div>
                <p class="text-xs text-muted-foreground">
                  {{ translate('settings.trackHint') }}
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <p class="pt-4 text-xs leading-relaxed text-muted-foreground">
            {{ translate('settings.live') }}
          </p>
        </TabsContent>
        <TabsContent value="actions"><ActionPanel :lab="lab" /></TabsContent>
      </Tabs>
    </ScrollArea>
  </section>
</template>
