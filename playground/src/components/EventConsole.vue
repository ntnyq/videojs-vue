<script setup lang="ts">
import {
  ChevronRight,
  Download,
  Pause,
  Play,
  Search,
  Terminal,
  Trash2,
} from '@lucide/vue'
import { computed, shallowRef, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Playground } from '../composables/usePlayground'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

const props = defineProps<{ lab: Playground }>()
const { t: translate, locale } = useI18n()
const isAutoScroll = shallowRef(true)
const expanded = shallowRef<number | null>(null)
const viewport = useTemplateRef('viewport')
const exportError = shallowRef(false)
const kinds = ['event', 'action', 'model', 'lifecycle', 'error'] as const
const colors = {
  event: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
  action: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  model: 'bg-violet-500/10 text-violet-700 dark:text-violet-300',
  lifecycle: 'bg-muted text-muted-foreground',
  error: 'bg-destructive/10 text-destructive',
}
const clock = computed(
  () =>
    new Intl.DateTimeFormat(locale.value, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
      hour12: false,
    }),
)
watch(
  () => [props.lab.log.filtered.at(-1)?.id, isAutoScroll.value],
  () => {
    if (isAutoScroll.value && viewport.value) {
      viewport.value.scrollTop = viewport.value.scrollHeight
    }
  },
  { flush: 'post' },
)
function download() {
  try {
    exportError.value = false
    props.lab.log.exportLog()
  } catch {
    exportError.value = true
  }
}
function formatPayload(payload: string) {
  return JSON.stringify(JSON.parse(payload), null, 2)
}
</script>
<template>
  <section
    class="flex h-full min-h-64 flex-col bg-background"
    :aria-label="translate('logs.title')"
  >
    <div
      class="flex shrink-0 flex-wrap items-center justify-between gap-2 px-4 pt-3 sm:px-5"
    >
      <div class="flex items-center gap-2.5">
        <Terminal class="size-4" />
        <h2 class="text-sm font-semibold">{{ translate('logs.title') }}</h2>
        <Badge
          variant="secondary"
          class="text-[10px]"
          >{{ lab.log.entries.length }}</Badge
        ><span
          class="flex items-center gap-1.5 text-[11px] text-muted-foreground"
          ><span
            class="size-1.5 rounded-full"
            :class="lab.log.isRecording ? 'bg-emerald-500' : 'bg-amber-500'"
          />{{
            translate(lab.log.isRecording ? 'logs.recording' : 'logs.paused')
          }}</span
        >
      </div>
      <div class="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          @click="lab.log.isRecording = !lab.log.isRecording"
          ><Pause v-if="lab.log.isRecording" /><Play v-else /><span
            class="text-xs"
            >{{
              translate(lab.log.isRecording ? 'logs.pause' : 'logs.resume')
            }}</span
          ></Button
        ><Button
          variant="ghost"
          size="sm"
          :disabled="!lab.log.entries.length"
          @click="lab.log.clear"
          ><Trash2 /><span class="text-xs">{{
            translate('logs.clear')
          }}</span></Button
        ><Button
          variant="ghost"
          size="sm"
          :disabled="!lab.log.filtered.length"
          @click="download"
          ><Download /><span class="text-xs">{{
            translate('logs.export')
          }}</span></Button
        >
      </div>
    </div>
    <div class="flex shrink-0 flex-wrap items-center gap-3 px-4 py-3 sm:px-5">
      <div class="relative min-w-40 flex-1 sm:max-w-72">
        <Search
          class="pointer-events-none absolute top-2 left-2.5 size-4 text-muted-foreground"
        /><Input
          v-model="lab.log.query"
          :aria-label="translate('logs.search')"
          :placeholder="translate('logs.search')"
          class="h-8 pl-8 text-xs"
        />
      </div>
      <Select v-model="lab.log.kind"
        ><SelectTrigger
          class="h-8 w-36 text-xs"
          :aria-label="translate('logs.type')"
          ><SelectValue>{{
            translate(
              lab.log.kind === 'all' ? 'logs.all' : `logs.${lab.log.kind}Type`,
            )
          }}</SelectValue></SelectTrigger
        ><SelectContent
          ><SelectItem value="all">{{ translate('logs.all') }}</SelectItem
          ><SelectItem
            v-for="kind in kinds"
            :key="kind"
            :value="kind"
            >{{ translate(`logs.${kind}Type`) }}</SelectItem
          ></SelectContent
        ></Select
      >
      <div class="flex items-center gap-2">
        <Checkbox
          id="auto-scroll"
          :aria-label="translate('logs.autoScroll')"
          v-model="isAutoScroll"
        /><Label
          for="auto-scroll"
          class="text-xs"
          >{{ translate('logs.autoScroll') }}</Label
        >
      </div>
      <div
        class="flex items-center gap-2"
        :title="translate('logs.noisyHint')"
      >
        <Checkbox
          id="high-frequency"
          :aria-label="translate('logs.noisy')"
          v-model="lab.log.includesHighFrequency"
        /><Label
          for="high-frequency"
          class="text-xs"
          >{{ translate('logs.noisy') }}</Label
        >
      </div>
    </div>
    <p
      v-if="exportError"
      role="alert"
      class="px-5 pb-2 text-xs text-destructive"
    >
      {{ translate('logs.exportFailed') }}
    </p>
    <div
      ref="viewport"
      role="region"
      class="min-h-0 flex-1 overflow-auto border-y max-lg:max-h-80"
      tabindex="0"
      :aria-label="translate('logs.title')"
    >
      <table class="w-full min-w-[620px] table-fixed text-left text-xs">
        <thead class="sticky top-0 z-10 bg-muted text-muted-foreground">
          <tr>
            <th class="w-28 px-4 py-2 font-normal">
              {{ translate('logs.time') }}
            </th>
            <th class="w-24 px-2 py-2 font-normal">
              {{ translate('logs.type') }}
            </th>
            <th class="w-44 px-2 py-2 font-normal">
              {{ translate('logs.event') }}
            </th>
            <th class="min-w-52 px-2 py-2 font-normal">
              {{ translate('logs.payload') }}
            </th>
            <th class="w-10">
              <span class="sr-only">{{ translate('logs.detail') }}</span>
            </th>
          </tr>
        </thead>
        <tbody class="font-mono">
          <template
            v-for="entry in lab.log.filtered"
            :key="entry.id"
          >
            <tr class="border-b hover:bg-muted/40">
              <td
                class="px-4 py-2 text-[10px] text-muted-foreground tabular-nums"
              >
                {{ clock.format(new Date(entry.timestamp)) }}
              </td>
              <td class="px-2 py-2">
                <span
                  class="rounded px-1.5 py-0.5 text-[10px]"
                  :class="colors[entry.kind]"
                  >{{ entry.kind }}</span
                >
              </td>
              <td
                class="truncate px-2 py-2"
                :title="entry.name"
              >
                {{ entry.name }}
              </td>
              <td
                class="truncate px-2 py-2 text-muted-foreground"
                :title="entry.payload"
              >
                {{ entry.payload }}
              </td>
              <td>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  :aria-label="`${translate('logs.detail')}: ${entry.name}`"
                  :aria-expanded="expanded === entry.id"
                  @click="expanded = expanded === entry.id ? null : entry.id"
                  ><ChevronRight
                    :class="{ 'rotate-90': expanded === entry.id }"
                /></Button>
              </td>
            </tr>
            <tr v-if="expanded === entry.id">
              <td
                colspan="5"
                class="border-b bg-muted/30 p-4"
              >
                <pre class="overflow-auto text-xs">{{
                  formatPayload(entry.payload)
                }}</pre>
              </td>
            </tr>
          </template>
          <tr v-if="!lab.log.filtered.length">
            <td
              colspan="5"
              class="px-5 py-10 text-center font-sans text-muted-foreground"
            >
              {{ translate('logs.empty') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div
      class="flex shrink-0 items-center justify-between gap-3 px-5 py-2 text-[10px] text-muted-foreground"
    >
      <span>{{
        translate('logs.count', {
          shown: lab.log.filtered.length,
          total: lab.log.entries.length,
        })
      }}</span
      ><span>{{ translate('logs.limit') }}</span>
    </div>
  </section>
</template>
