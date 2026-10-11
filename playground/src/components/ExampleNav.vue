<script setup lang="ts">
import {
  Activity,
  Captions,
  Link,
  Play,
  Power,
  Radio,
  Search,
  Settings,
  SlidersHorizontal,
} from '@lucide/vue'
import { computed, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { EXAMPLES } from '../data'
import type { ExampleId } from '../data'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { ScrollArea } from './ui/scroll-area'

defineProps<{ selected: ExampleId }>()
const emit = defineEmits<{ select: [example: ExampleId] }>()
const { t: translate } = useI18n()
const query = shallowRef('')
const icons = {
  activity: Activity,
  captions: Captions,
  link: Link,
  play: Play,
  power: Power,
  radio: Radio,
  settings: Settings,
  sliders: SlidersHorizontal,
}
const groups = computed(() =>
  ['playback', 'api'].map(group => ({
    id: group,
    examples: EXAMPLES.filter(
      example =>
        example.group === group &&
        `${translate(`examples.${example.id}.title`)} ${example.id}`
          .toLowerCase()
          .includes(query.value.trim().toLowerCase()),
    ),
  })),
)
</script>

<template>
  <nav
    class="flex h-full flex-col bg-muted/20"
    :aria-label="translate('app.examples')"
  >
    <div class="relative m-4">
      <Search
        class="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground"
      />
      <Input
        v-model="query"
        :placeholder="translate('app.search')"
        :aria-label="translate('app.search')"
        class="pl-9"
      />
    </div>
    <ScrollArea class="min-h-0 flex-1 px-3">
      <div
        v-for="group in groups"
        :key="group.id"
        class="mb-7"
      >
        <h2 class="px-3 pb-2 text-xs font-medium text-muted-foreground">
          {{ translate(`app.${group.id}`) }}
        </h2>
        <Button
          v-for="example in group.examples"
          :key="example.id"
          variant="ghost"
          class="mb-1 h-10 w-full justify-start gap-3 text-sm"
          :class="{
            'bg-accent text-accent-foreground': selected === example.id,
          }"
          :aria-current="selected === example.id ? 'page' : undefined"
          @click="emit('select', example.id)"
        >
          <component
            :is="icons[example.icon]"
            class="size-4"
          />
          {{ translate(`examples.${example.id}.title`) }}
        </Button>
      </div>
      <p
        v-if="groups.every(group => !group.examples.length)"
        class="px-3 text-sm text-muted-foreground"
      >
        {{ translate('app.noExamples') }}
      </p>
    </ScrollArea>
    <div class="border-t px-6 py-4 text-xs text-muted-foreground">
      Vue 3 <span class="px-1 text-border">/</span> Video.js 10
    </div>
  </nav>
</template>
