<script setup lang="ts">
import type { VideoMediaProps } from 'videojs-vue'
import {
  computed,
  defineAsyncComponent,
  shallowRef,
  useAttrs,
  useId,
  watch,
} from 'vue'
import type { Component } from 'vue'
import { useI18n } from 'vue-i18n'
import CodePanel from '../components/CodePanel.vue'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { UI_COMPONENTS, UI_RECIPES, findUiComponents } from './catalog'
import type { UiComponentName, UiRecipeId } from './catalog'
// oxlint-disable-next-line import/default -- Vite's raw loader exports the source text.
import fixtureSource from './fixtures.ts?raw'
import shellSource from './RecipePlayer.vue?raw'
// oxlint-disable-next-line import/default -- Vite's raw loader exports the source text.
import typeSource from './types.ts?raw'
import styleSource from './recipe.css?raw'

defineOptions({ inheritAttrs: false })
defineProps<{ settings?: Partial<VideoMediaProps>; title?: string }>()
const emit = defineEmits<{
  interaction: [value: { name: string; component: string; detail: unknown }]
  selectRecipe: []
}>()
const attrs = useAttrs()
const { t: translate } = useI18n()
const searchId = useId()
const componentId = useId()
const query = shallowRef('')
const group = shallowRef<UiRecipeId | 'all'>('all')
const selected = shallowRef<UiComponentName>('MediaControlsBackdrop')
const generation = shallowRef(0)
const showSource = shallowRef(false)
const visible = computed(() => findUiComponents(query.value, group.value))
const activeRecipe = computed(
  () =>
    UI_RECIPES.find(recipe =>
      recipe.components.some(name => name === selected.value),
    ) ?? UI_RECIPES[0],
)
const sourceFiles = import.meta.glob<string>('./*Recipe.vue', {
  eager: true,
  query: '?raw',
  import: 'default',
})
const source = computed(
  () => sourceFiles[`./${activeRecipe.value.filename}`] ?? '',
)
const recipes: Record<UiRecipeId, Component> = {
  layout: defineAsyncComponent(() => import('./LayoutRecipe.vue')),
  popovers: defineAsyncComponent(() => import('./PopoverRecipe.vue')),
  tooltips: defineAsyncComponent(() => import('./TooltipRecipe.vue')),
  sliders: defineAsyncComponent(() => import('./SliderRecipe.vue')),
  chapters: defineAsyncComponent(() => import('./ChapterRecipe.vue')),
  menus: defineAsyncComponent(() => import('./MenuRecipe.vue')),
  dialogs: defineAsyncComponent(() => import('./DialogRecipe.vue')),
  feedback: defineAsyncComponent(() => import('./FeedbackRecipe.vue')),
  remote: defineAsyncComponent(() => import('./RemoteRecipe.vue')),
}
function selectComponent(name: UiComponentName) {
  const current = activeRecipe.value.id
  selected.value = name
  if (activeRecipe.value.id !== current) {
    generation.value++
    emit('selectRecipe')
  }
}
const selectedIndex = computed(() =>
  visible.value.findIndex(item => item.name === selected.value),
)
watch(visible, items => {
  const [first] = items
  if (first && !items.some(item => item.name === selected.value)) {
    selectComponent(first.name)
  }
})
function selectValue(event: Event) {
  if (!(event.target instanceof HTMLSelectElement)) {
    return
  }
  const { value } = event.target
  const component = UI_COMPONENTS.find(item => item.name === value)
  if (component) {
    selectComponent(component.name)
  }
}
function stepComponent(direction: -1 | 1) {
  const next = visible.value[selectedIndex.value + direction]
  if (next) {
    selectComponent(next.name)
  }
}

function resetRecipe() {
  generation.value++
  emit('selectRecipe')
}
function recordInteraction(event: Event) {
  if (!(event.target instanceof HTMLElement)) {
    return
  }
  emit('interaction', {
    name: event.type,
    component: event.target.localName,
    detail: event instanceof CustomEvent ? event.detail : null,
  })
}
</script>

<template>
  <div
    class="space-y-4 bg-background p-1 text-foreground"
    @open-change.capture="recordInteraction"
    @value-change.capture="recordInteraction"
    @checked-change.capture="recordInteraction"
    @drag-start.capture="recordInteraction"
    @drag-end.capture="recordInteraction"
  >
    <div class="flex flex-wrap items-end gap-2">
      <label
        class="min-w-48 flex-1 space-y-2 text-xs font-medium"
        :for="componentId"
      >
        <span class="block">{{ translate('uiComponents.components') }}</span>
        <select
          :id="componentId"
          :value="selected"
          class="h-9 w-full rounded-md border bg-background px-2 text-sm"
          @change="selectValue"
        >
          <option
            v-for="item in visible"
            :key="item.name"
            :value="item.name"
          >
            {{ item.name }}
          </option>
        </select>
      </label>
      <label class="space-y-2 text-xs font-medium">
        <span class="block">{{ translate('uiComponents.group') }}</span>
        <select
          v-model="group"
          class="h-9 max-w-full rounded-md border bg-background px-2 text-sm"
        >
          <option value="all">{{ translate('uiComponents.all') }}</option>
          <option
            v-for="recipe in UI_RECIPES"
            :key="recipe.id"
            :value="recipe.id"
          >
            {{ translate(`uiComponents.groups.${recipe.id}.title`) }}
          </option>
        </select>
      </label>
      <Button
        variant="outline"
        size="sm"
        :disabled="selectedIndex <= 0"
        @click="stepComponent(-1)"
        >{{ translate('uiComponents.previous') }}</Button
      >
      <Button
        variant="outline"
        size="sm"
        :disabled="selectedIndex < 0 || selectedIndex >= visible.length - 1"
        @click="stepComponent(1)"
        >{{ translate('uiComponents.next') }}</Button
      >
    </div>
    <details class="rounded-md border px-3 py-2 text-xs">
      <summary class="cursor-pointer">
        {{ translate('uiComponents.search') }} ({{ visible.length }} /
        {{ UI_COMPONENTS.length }})
      </summary>
      <div class="mt-3 space-y-3">
        <label
          class="sr-only"
          :for="searchId"
          >{{ translate('uiComponents.search') }}</label
        >
        <Input
          :id="searchId"
          v-model="query"
          :placeholder="translate('uiComponents.searchPlaceholder')"
        />
        <div class="flex max-h-36 flex-wrap gap-1.5 overflow-y-auto">
          <Button
            v-for="item in visible"
            :key="item.name"
            :variant="selected === item.name ? 'secondary' : 'ghost'"
            size="sm"
            class="h-8 max-w-full text-xs"
            :aria-pressed="selected === item.name"
            @click="selectComponent(item.name)"
            >{{ item.name }}</Button
          >
          <p
            v-if="!visible.length"
            role="status"
            class="p-2 text-sm text-muted-foreground"
          >
            {{ translate('app.noExamples') }}
          </p>
        </div>
      </div>
    </details>
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0 flex-1">
        <p
          class="mt-1 max-w-[75ch] text-xs leading-relaxed text-muted-foreground"
        >
          {{ translate(`uiComponents.groups.${activeRecipe.id}.hint`) }}
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        @click="resetRecipe"
        >{{ translate('app.reset') }}</Button
      >
    </div>
    <div
      class="overflow-visible rounded-md border"
      :data-ui-recipe="activeRecipe.id"
    >
      <component
        :is="recipes[activeRecipe.id]"
        :key="generation"
        v-bind="attrs"
        :settings="settings"
        :title="title"
      />
    </div>
    <p class="text-xs leading-relaxed text-muted-foreground">
      {{ translate('uiComponents.composed') }}
      {{ activeRecipe.components.join(', ') }}
    </p>
    <Button
      variant="outline"
      size="sm"
      :aria-expanded="showSource"
      @click="showSource = !showSource"
      >{{
        translate(
          showSource ? 'uiComponents.hideSource' : 'uiComponents.showSource',
        )
      }}</Button
    >
    <div
      v-if="showSource"
      class="space-y-3"
    >
      <CodePanel
        :code="source"
        :filename="activeRecipe.filename"
      />
      <details class="rounded-md border p-3 text-sm">
        <summary class="cursor-pointer">
          {{ translate('uiComponents.sharedSource') }}
        </summary>
        <div class="mt-3 space-y-3">
          <div class="flex flex-wrap gap-4 text-xs">
            <a
              href="/ui-chapters.vtt"
              target="_blank"
              rel="noreferrer"
              class="underline"
              >ui-chapters.vtt</a
            >
            <a
              href="/ui-thumbnails.svg"
              target="_blank"
              rel="noreferrer"
              class="underline"
              >ui-thumbnails.svg</a
            >
          </div>
          <CodePanel
            :code="shellSource"
            filename="RecipePlayer.vue"
          />
          <CodePanel
            :code="typeSource"
            filename="types.ts"
          />
          <CodePanel
            :code="fixtureSource"
            filename="fixtures.ts"
          />
          <CodePanel
            :code="styleSource"
            filename="recipe.css"
          />
        </div>
      </details>
    </div>
  </div>
</template>
