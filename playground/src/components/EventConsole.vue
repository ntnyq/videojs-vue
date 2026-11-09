<script setup lang="ts">
import {
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Download,
  Pause,
  Play,
  Search,
  Terminal,
  Trash2,
} from '@lucide/vue'
import { computed, shallowRef, useId, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLogScroll } from '../composables/useLogScroll'
import type { Playground } from '../composables/usePlayground'
import HintTooltip from './HintTooltip.vue'
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

const props = defineProps<{ lab: Playground; collapsed: boolean }>()
const emit = defineEmits<{ toggle: [] }>()
const { t: translate, locale } = useI18n()
const contentId = useId()
const expanded = shallowRef<number | null>(null)
const viewport = useTemplateRef('viewport')
const { isAutoScroll, isFollowing, unread, goLatest, onScroll } = useLogScroll(
  () => props.lab.log.filtered,
  viewport,
  () => !props.collapsed,
)
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
    class="flex h-full min-h-0 flex-col bg-background"
    :aria-label="translate('logs.title')"
  >
    <div
      class="flex min-h-12 shrink-0 flex-wrap items-center justify-between gap-x-2 px-3 sm:px-5"
    >
      <Button
        variant="ghost"
        size="sm"
        class="h-12 min-w-0 gap-2 px-0 hover:bg-transparent"
        :aria-expanded="!collapsed"
        :aria-controls="contentId"
        :aria-label="translate(collapsed ? 'logs.expand' : 'logs.collapse')"
        @click="emit('toggle')"
      >
        <Terminal class="size-4" />
        <span
          role="heading"
          aria-level="2"
          class="text-sm font-semibold"
          >{{ translate('logs.title') }}</span
        >
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
      </Button>
      <HintTooltip
        :content="translate(collapsed ? 'logs.expand' : 'logs.collapse')"
        ><Button
          variant="ghost"
          size="icon-sm"
          class="size-9"
          :aria-label="translate(collapsed ? 'logs.expand' : 'logs.collapse')"
          :aria-expanded="!collapsed"
          :aria-controls="contentId"
          @click="emit('toggle')"
          ><ChevronUp v-if="collapsed" /><ChevronDown v-else /></Button
      ></HintTooltip>
    </div>
    <div
      v-show="!collapsed"
      :id="contentId"
      class="flex min-h-0 flex-1 flex-col"
    >
      <div class="flex shrink-0 flex-wrap items-center gap-1 px-3 sm:px-5">
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
      <div class="flex shrink-0 flex-wrap items-center gap-3 px-3 py-2 sm:px-5">
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
                lab.log.kind === 'all'
                  ? 'logs.all'
                  : `logs.${lab.log.kind}Type`,
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
        <div class="flex items-center gap-2">
          <HintTooltip :content="translate('logs.noisyHint')">
            <Checkbox
              id="high-frequency"
              :aria-label="translate('logs.noisy')"
              v-model="lab.log.includesHighFrequency" /></HintTooltip
          ><Label
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
        @scroll="onScroll"
      >
        <ul class="divide-y sm:hidden">
          <li
            v-for="entry in lab.log.filtered"
            :key="entry.id"
            class="min-w-0"
          >
            <button
              type="button"
              class="flex min-h-16 w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-inset"
              :aria-label="`${translate('logs.detail')}: ${entry.name}`"
              :aria-expanded="expanded === entry.id"
              @click="expanded = expanded === entry.id ? null : entry.id"
            >
              <div class="min-w-0 flex-1 space-y-1.5">
                <p class="font-mono text-xs break-all">{{ entry.name }}</p>
                <div class="flex flex-wrap items-center gap-2 text-[11px]">
                  <span
                    class="rounded px-1.5 py-0.5"
                    :class="colors[entry.kind]"
                    >{{ entry.kind }}</span
                  >
                  <time
                    class="text-muted-foreground tabular-nums"
                    :datetime="entry.timestamp"
                    >{{ clock.format(new Date(entry.timestamp)) }}</time
                  >
                </div>
              </div>
              <ChevronRight
                class="size-4 shrink-0"
                :class="{ 'rotate-90': expanded === entry.id }"
              />
            </button>
            <pre
              v-if="expanded === entry.id"
              class="border-t bg-muted/30 p-3 text-xs whitespace-pre-wrap break-all"
              >{{ formatPayload(entry.payload) }}</pre>
          </li>
          <li
            v-if="!lab.log.filtered.length"
            class="px-4 py-8 text-center text-xs leading-relaxed text-muted-foreground"
          >
            {{
              translate(
                lab.log.entries.length ? 'logs.noMatches' : 'logs.empty',
              )
            }}
          </li>
        </ul>
        <table
          class="hidden w-full min-w-[620px] table-fixed text-left text-xs sm:table"
        >
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
                <td class="truncate px-2 py-2">
                  <HintTooltip :content="entry.name"
                    ><span
                      tabindex="0"
                      class="block truncate"
                      >{{ entry.name }}</span
                    ></HintTooltip
                  >
                </td>
                <td class="truncate px-2 py-2 text-muted-foreground">
                  <HintTooltip :content="entry.payload"
                    ><span
                      tabindex="0"
                      class="block truncate"
                      >{{ entry.payload }}</span
                    ></HintTooltip
                  >
                </td>
                <td>
                  <HintTooltip :content="translate('logs.detail')"
                    ><Button
                      variant="ghost"
                      size="icon-xs"
                      :aria-label="`${translate('logs.detail')}: ${entry.name}`"
                      :aria-expanded="expanded === entry.id"
                      @click="
                        expanded = expanded === entry.id ? null : entry.id
                      "
                      ><ChevronRight
                        :class="{
                          'rotate-90': expanded === entry.id,
                        }" /></Button
                  ></HintTooltip>
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
                {{
                  translate(
                    lab.log.entries.length ? 'logs.noMatches' : 'logs.empty',
                  )
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Button
        v-if="!isFollowing || unread"
        variant="secondary"
        size="sm"
        class="mx-3 my-1 shrink-0 self-center text-xs"
        @click="goLatest"
        >{{
          unread
            ? translate('logs.newEntries', { count: unread })
            : translate('logs.latest')
        }}</Button
      >
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
    </div>
  </section>
</template>
