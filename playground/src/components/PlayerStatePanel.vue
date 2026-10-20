<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Playground } from '../composables/usePlayground'
import { Badge } from './ui/badge'

const props = defineProps<{ lab: Playground }>()
const { t: translate } = useI18n()
const fields = computed(() =>
  Object.entries(props.lab.snapshot ?? {}).map(([key, value]) => ({
    key,
    value:
      typeof value === 'number' && !Number.isInteger(value)
        ? value.toFixed(3)
        : (JSON.stringify(value) ?? '—'),
  })),
)
</script>
<template>
  <section class="min-h-64 rounded-md border bg-muted/20 p-4">
    <p class="mb-4 text-xs text-muted-foreground">
      {{ translate('state.hint') }}
      <code
        >{{
          lab.example === 'audio'
            ? 'useAudioPlayerState'
            : lab.example === 'live'
              ? 'useLivePlayerState'
              : 'usePlayerState'
        }}(state =&gt; state, player)</code
      >
    </p>
    <p
      v-if="!lab.isReady"
      class="py-10 text-center text-sm text-muted-foreground"
    >
      {{ translate('state.empty') }}
    </p>
    <dl
      v-else
      class="grid gap-x-6 sm:grid-cols-2"
    >
      <div
        v-for="field in fields"
        :key="field.key"
        class="flex min-w-0 items-start justify-between gap-3 border-b py-2.5 text-xs"
      >
        <dt class="font-mono text-muted-foreground">{{ field.key }}</dt>
        <dd class="min-w-0 text-right font-mono break-all">
          <Badge
            v-if="field.value === 'true' || field.value === 'false'"
            variant="secondary"
            >{{ field.value }}</Badge
          ><span v-else>{{ field.value }}</span>
        </dd>
      </div>
    </dl>
  </section>
</template>
