<script setup lang="ts">
import { RotateCcw } from '@lucide/vue'
import { computed, reactive, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Playground } from '../composables/usePlayground'
import { isMediaUrl } from '../data'
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
import { Slider } from './ui/slider'
import { Switch } from './ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'

const props = defineProps<{ lab: Playground }>()
const { t: translate } = useI18n()
const drafts = reactive({ src: '', poster: '', trackSrc: '' })
const invalid = shallowRef('')
watch(
  () => [
    props.lab.config.src,
    props.lab.config.poster,
    props.lab.config.trackSrc,
  ],
  () => {
    Object.assign(drafts, {
      src: props.lab.config.src,
      poster: props.lab.config.poster,
      trackSrc: props.lab.config.trackSrc,
    })
    invalid.value = ''
  },
  { immediate: true },
)
function applyUrl(key: keyof typeof drafts) {
  const value = drafts[key].trim()
  if ((key === 'src' && !value) || (value && !isMediaUrl(value))) {
    invalid.value = key
    return
  }
  invalid.value = ''
  props.lab.updateConfig(key, value)
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
const booleanProps = computed(() =>
  props.lab.example === 'audio'
    ? (['muted', 'autoplay', 'loop'] as const)
    : (['muted', 'autoplay', 'loop', 'playsinline'] as const),
)
</script>
<template>
  <section
    class="flex h-full min-h-0 flex-col bg-background"
    :aria-label="translate('app.settings')"
  >
    <div class="flex h-14 shrink-0 items-center justify-between px-5">
      <h2 class="text-sm font-semibold">{{ translate('app.settings') }}</h2>
      <Button
        variant="ghost"
        size="icon-sm"
        :aria-label="translate('app.reset')"
        @click="lab.reset"
        ><RotateCcw class="size-4"
      /></Button>
    </div>
    <ScrollArea class="min-h-0 flex-1 px-5 pb-5">
      <Tabs v-model="lab.inspectorTab">
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
                <form @submit.prevent="applyUrl('src')">
                  <Label
                    for="source-url"
                    class="text-xs"
                    >src</Label
                  >
                  <div class="mt-2 flex gap-1">
                    <Input
                      id="source-url"
                      v-model="drafts.src"
                      class="min-w-0 text-xs"
                      :aria-invalid="invalid === 'src'"
                    /><Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      class="h-9"
                      >{{ translate('settings.apply') }}</Button
                    >
                  </div>
                  <p
                    v-if="invalid === 'src'"
                    role="alert"
                    class="mt-2 text-xs text-destructive"
                  >
                    {{ translate('settings.invalidUrl') }}
                  </p>
                </form>
                <SelectField
                  id="skin"
                  v-model="skin"
                  label="skin"
                  :options="skins"
                  :disabled="lab.example === 'custom'"
                />
                <p
                  v-if="lab.example === 'custom'"
                  class="text-xs text-muted-foreground"
                >
                  {{ translate('settings.customSkin') }}
                </p>
              </AccordionContent></AccordionItem
            >
            <AccordionItem value="advanced">
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
                <form @submit.prevent="applyUrl('poster')">
                  <Label
                    for="poster-url"
                    class="text-xs"
                    >poster</Label
                  >
                  <div class="mt-2 flex gap-1">
                    <Input
                      id="poster-url"
                      v-model="drafts.poster"
                      class="min-w-0 text-xs"
                      :aria-invalid="invalid === 'poster'"
                    /><Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      class="h-9"
                      >{{ translate('settings.apply') }}</Button
                    >
                  </div>
                  <p
                    v-if="invalid === 'poster'"
                    role="alert"
                    class="mt-2 text-xs text-destructive"
                  >
                    {{ translate('settings.invalidUrl') }}
                  </p>
                </form>
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
                <form @submit.prevent="applyUrl('trackSrc')">
                  <Label
                    for="track-src"
                    class="text-xs"
                    >{{ translate('settings.trackSrc') }}</Label
                  >
                  <div class="mt-2 flex gap-1">
                    <Input
                      id="track-src"
                      v-model="drafts.trackSrc"
                      class="min-w-0 text-xs"
                      :aria-invalid="invalid === 'trackSrc'"
                    /><Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      class="h-9"
                      >{{ translate('settings.apply') }}</Button
                    >
                  </div>
                  <p
                    v-if="invalid === 'trackSrc'"
                    role="alert"
                    class="mt-2 text-xs text-destructive"
                  >
                    {{ translate('settings.invalidUrl') }}
                  </p>
                </form>
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
