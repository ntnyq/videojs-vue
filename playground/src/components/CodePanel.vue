<script setup lang="ts">
import { Check, Copy } from '@lucide/vue'
import { useClipboard } from '@vueuse/core'
import { shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from './ui/button'

const props = defineProps<{ code: string }>()
const { t: translate } = useI18n()
const { copy, copied } = useClipboard({ legacy: true })
const hasFailed = shallowRef(false)
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
  <section class="overflow-hidden rounded-md border bg-muted/30">
    <div class="flex items-center justify-between border-b px-4 py-2">
      <span class="text-xs text-muted-foreground">Example.vue</span
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
    <pre
      class="overflow-x-auto p-4 text-xs leading-6 select-text"
      tabindex="0"
    ><code>{{ code }}</code></pre>
  </section>
</template>
