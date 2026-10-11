<script setup lang="ts">
import { Headphones, Video } from '@lucide/vue'
import type { VNode } from 'vue'
import { useI18n } from 'vue-i18n'
import type { PlayerType } from '../data'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'

defineProps<{ selected: PlayerType }>()
const emit = defineEmits<{ select: [type: PlayerType] }>()
defineSlots<{ default: () => VNode[] }>()
const { t: translate } = useI18n()

function select(value: string | number) {
  if (value === 'video' || value === 'audio') {
    emit('select', value)
  }
}
</script>

<template>
  <Tabs
    :model-value="selected"
    class="block"
    @update:model-value="select"
  >
    <TabsList
      class="mb-4"
      :aria-label="translate('app.playerType')"
    >
      <TabsTrigger value="video">
        <Video class="size-4" />{{ translate('app.videoPlayer') }}
      </TabsTrigger>
      <TabsTrigger value="audio">
        <Headphones class="size-4" />{{ translate('app.audioPlayer') }}
      </TabsTrigger>
    </TabsList>
    <TabsContent
      :value="selected"
      class="mt-0"
      ><slot
    /></TabsContent>
  </Tabs>
</template>
