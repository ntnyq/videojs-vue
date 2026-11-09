<script setup lang="ts">
import { useForwardExpose } from 'reka-ui'
import type { VNode } from 'vue'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

defineProps<{ content: string }>()
defineOptions({ inheritAttrs: false })
defineSlots<{ default: () => VNode[] }>()
const { forwardRef } = useForwardExpose()
</script>

<template>
  <Tooltip>
    <TooltipTrigger
      :ref="forwardRef"
      as-child
      v-bind="$attrs"
      ><slot
    /></TooltipTrigger>
    <TooltipContent class="max-w-[min(24rem,calc(100vw-2rem))] break-all">{{
      content
    }}</TooltipContent>
  </Tooltip>
</template>
