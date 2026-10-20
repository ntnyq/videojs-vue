<script setup lang="ts">
import { Check, Copy } from '@lucide/vue'
import { useClipboard } from '@vueuse/core'
import { shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from './ui/button'

const props = withDefaults(defineProps<{ code: string; filename?: string }>(), {
  filename: 'Example.vue',
})
const { t: translate } = useI18n()
const { copy, copied } = useClipboard({ legacy: true })
const hasFailed = shallowRef(false)
const highlightedCode = shallowRef('')

watch(
  () => props.code,
  async (code, _, onCleanup) => {
    let isActive = true
    onCleanup(() => {
      isActive = false
    })
    highlightedCode.value = ''
    try {
      const { highlightExampleCode } =
        await import('../lib/highlightExampleCode')
      const html = await highlightExampleCode(code)
      if (isActive) {
        highlightedCode.value = html
      }
    } catch {
      // Highlighting is best-effort; keep the plain code readable and copyable.
    }
  },
  { immediate: true },
)

async function copyCode() {
  try {
    hasFailed.value = false
    await copy(props.code)
  } catch {
    hasFailed.value = true
  }
}
</script>
<template>
  <section
    class="overflow-hidden rounded-md border bg-muted/30 [contain:inline-size]"
  >
    <div class="flex items-center justify-between border-b px-4 py-2">
      <span class="text-xs text-muted-foreground">{{ filename }}</span
      ><Button
        variant="ghost"
        size="sm"
        @click="copyCode"
        ><Check v-if="copied" /><Copy v-else />{{
          translate(copied ? 'app.copied' : 'app.copy')
        }}</Button
      >
    </div>
    <p
      v-if="hasFailed"
      role="alert"
      class="px-4 pt-3 text-xs text-destructive"
    >
      {{ translate('app.copyFailed') }}
    </p>
    <div
      v-if="highlightedCode"
      class="example-code"
      v-html="highlightedCode"
    />
    <pre
      v-else
      class="overflow-x-auto p-4 text-xs leading-6 select-text"
      tabindex="0"
    ><code>{{ code }}</code></pre>
  </section>
</template>

<style scoped>
@reference '../style.css';

.example-code :deep(pre) {
  @apply overflow-x-auto p-4 text-xs leading-6 select-text;
  background-color: var(--shiki-light-bg);
}

.example-code :deep(.shiki),
.example-code :deep(span) {
  color: var(--shiki-light);
  font-style: var(--shiki-light-font-style, normal);
  font-weight: var(--shiki-light-font-weight, normal);
  text-decoration: var(--shiki-light-text-decoration, none);
}

:global(.dark .example-code pre) {
  background-color: var(--shiki-dark-bg);
}

:global(.dark .example-code .shiki),
:global(.dark .example-code span) {
  color: var(--shiki-dark);
  font-style: var(--shiki-dark-font-style, normal);
  font-weight: var(--shiki-dark-font-weight, normal);
  text-decoration: var(--shiki-dark-text-decoration, none);
}
</style>
