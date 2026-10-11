<script setup lang="ts">
import { Input } from './ui/input'
import { Label } from './ui/label'

const props = withDefaults(
  defineProps<{
    id: string
    label: string
    min?: number
    max?: number
    step?: number
    disabled?: boolean
  }>(),
  { min: 0, max: Number.MAX_SAFE_INTEGER, step: 1 },
)
const model = defineModel<number>({ required: true })
function commit(event: Event) {
  const input = event.target
  if (!(input instanceof HTMLInputElement)) {
    return
  }
  const value = input.valueAsNumber
  if (Number.isFinite(value)) {
    model.value = Math.min(props.max, Math.max(props.min, value))
  }
  input.value = String(model.value)
}
</script>
<template>
  <div class="space-y-2">
    <Label
      :for="id"
      class="text-xs"
      >{{ label }}</Label
    >
    <Input
      :id="id"
      :model-value="model"
      type="number"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      class="tabular-nums"
      @change="commit"
    />
  </div>
</template>
