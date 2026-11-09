<script setup lang="ts">
import { Check, Copy, ScanText } from '@lucide/vue'
import { useClipboard, useTimeoutFn } from '@vueuse/core'
import { computed, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { isMediaUrl } from '../data'
import HintTooltip from './HintTooltip.vue'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'

interface Props {
  /**
   * Stable field identifier.
   */
  id: string
  /**
   * Media property label.
   */
  label: string
  /**
   * Currently applied URL.
   */
  modelValue: string
  /**
   * Whether an empty URL is disallowed.
   */
  required?: boolean
}
const FEEDBACK_DURATION = 2000
const props = defineProps<Props>()
const emit = defineEmits<{ apply: [value: string] }>()
const { t: translate } = useI18n()
const draft = shallowRef(props.modelValue)
const invalid = shallowRef(false)
const isExpanded = shallowRef(false)
const appliedValue = shallowRef<string | null>(null)
const copyFailed = shallowRef(false)
const { copy, copied } = useClipboard({ legacy: true })
const { start: clearFeedback } = useTimeoutFn(
  () => {
    appliedValue.value = null
  },
  FEEDBACK_DURATION,
  { immediate: false },
)
const isDirty = computed(() => draft.value.trim() !== props.modelValue)
const isApplied = computed(
  () => !isDirty.value && appliedValue.value === props.modelValue,
)

watch(
  () => props.modelValue,
  value => {
    draft.value = value
    invalid.value = false
  },
)
watch(draft, () => {
  invalid.value = false
  copyFailed.value = false
})
function apply() {
  if (!isDirty.value) {
    return
  }
  const value = draft.value.trim()
  if ((props.required && !value) || (value && !isMediaUrl(value))) {
    invalid.value = true
    return
  }
  invalid.value = false
  emit('apply', value)
  appliedValue.value = value
  clearFeedback()
}
async function copyUrl() {
  try {
    copyFailed.value = false
    await copy(draft.value)
  } catch {
    copyFailed.value = true
  }
}
</script>

<template>
  <form
    class="space-y-2"
    @submit.prevent="apply"
  >
    <div class="flex items-center justify-between gap-2">
      <Label
        :for="id"
        class="text-xs"
        >{{ label }}</Label
      >
      <span
        role="status"
        class="text-xs text-muted-foreground"
      >
        {{
          isDirty
            ? translate('settings.unapplied')
            : isApplied
              ? translate('settings.applied')
              : ''
        }}
      </span>
    </div>
    <div class="flex gap-1">
      <Input
        :id="id"
        v-model="draft"
        class="min-w-0 text-xs"
        :aria-invalid="invalid"
        :aria-describedby="invalid ? `${id}-error` : undefined"
      />
      <Button
        type="submit"
        variant="outline"
        size="sm"
        class="h-9"
        :disabled="!isDirty"
        >{{ translate('settings.apply') }}</Button
      >
    </div>
    <div class="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        class="h-9 text-xs"
        :aria-expanded="isExpanded"
        :aria-controls="`${id}-full`"
        @click="isExpanded = !isExpanded"
      >
        <ScanText />{{ translate('settings.fullUrl') }}
      </Button>
      <HintTooltip
        :content="translate(copied ? 'app.copied' : 'settings.copyUrl')"
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          class="size-9"
          :disabled="!draft"
          :aria-label="translate(copied ? 'app.copied' : 'settings.copyUrl')"
          @click="copyUrl"
          ><Check v-if="copied" /><Copy v-else
        /></Button>
      </HintTooltip>
    </div>
    <p
      v-if="isExpanded"
      :id="`${id}-full`"
      class="rounded-md border bg-muted/30 p-2 text-xs leading-relaxed break-all select-text"
    >
      {{ draft || '—' }}
    </p>
    <p
      v-if="invalid"
      :id="`${id}-error`"
      role="alert"
      class="text-xs text-destructive"
    >
      {{ translate('settings.invalidUrl') }}
    </p>
    <p
      v-if="copyFailed"
      role="alert"
      class="text-xs text-destructive"
    >
      {{ translate('app.copyFailed') }}
    </p>
  </form>
</template>
