<script setup lang="ts" generic="Value extends string">
import { Label } from './ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

defineProps<{
  id: string
  label: string
  options: readonly { value: Value; label: string }[]
  disabled?: boolean
}>()
const model = defineModel<Value>({ required: true })
</script>
<template>
  <div class="space-y-2">
    <Label
      :for="id"
      class="text-xs"
      >{{ label }}</Label
    >
    <Select
      v-model="model"
      :disabled="disabled"
      ><SelectTrigger
        :id="id"
        class="w-full"
        ><SelectValue /></SelectTrigger
      ><SelectContent
        ><SelectItem
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          >{{ option.label }}</SelectItem
        ></SelectContent
      ></Select
    >
  </div>
</template>
