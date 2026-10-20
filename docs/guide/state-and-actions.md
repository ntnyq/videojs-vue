---
description: Read reactive playback state, call player actions, and handle failures from application UI.
---

# State and actions

Use selectors to read the Video.js store and actions to request playback changes. The controls and your application share one playback state.

## Control a player from its parent

Pass a typed template ref when the component calling the composables is outside `VideoPlayerRoot`:

```vue
<script setup lang="ts">
import { computed, shallowRef, useTemplateRef } from 'vue'
import {
  VideoPlayer,
  useVideoPlayerActions,
  useVideoPlayerState,
} from 'videojs-vue'
import type { VideoPlayerHandle } from 'videojs-vue'

const player = useTemplateRef<VideoPlayerHandle>('player')
const paused = useVideoPlayerState(state => state.paused, player)
const currentTime = useVideoPlayerState(state => state.currentTime, player)
const actions = useVideoPlayerActions(player)
const errorMessage = shallowRef('')
const playbackLabel = computed(() =>
  paused.value === undefined ? 'Not ready' : paused.value ? 'Play' : 'Pause',
)

async function togglePlayback() {
  errorMessage.value = ''
  try {
    if (paused.value) {
      await actions.play()
    } else {
      actions.pause()
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : String(error)
  }
}
</script>

<template>
  <VideoPlayer
    ref="player"
    src="/demo.mp4"
  />
  <button
    type="button"
    :disabled="paused === undefined"
    @click="togglePlayback"
  >
    {{ playbackLabel }}
  </button>
  <p>Position: {{ currentTime?.toFixed(1) ?? '—' }} seconds</p>
  <p
    v-if="errorMessage"
    role="alert"
  >
    {{ errorMessage }}
  </p>
</template>
```

Before readiness, selectors return `undefined`. Keep that state distinct from values such as `false` or `0`. A rejected action does not automatically become a media `error` event, so handle the rejection where the command is called.

## Use context in a child component

A component rendered inside `VideoPlayerRoot` can omit the target:

```ts
import { useVideoPlayerActions, useVideoPlayerState } from 'videojs-vue'

const paused = useVideoPlayerState(state => state.paused)
const actions = useVideoPlayerActions()
```

Call these from a descendant's setup, not from the setup that renders the root itself. Missing injected context throws immediately. See [composition](./composition.md) for the parent layout.

## Select only what the UI needs

Prefer a selector for each primitive value, such as `state.paused` or `state.currentTime`. Selections update only when `Object.is` detects a change. Returning a new object on every store update also creates a new selection on every update.

Selectors are readonly. To change playback, call an action or bind a supported setting prop. The wrapper provides no whole-state change event.

## Follow a changing target

Pass a ref or getter when a player may be replaced. Subscriptions follow the current store and clean up the old subscription automatically. Actions resolve the target when called, so they do not retain an old player's store.

Do not pass `player.value` during setup: it is initially `null` and will not follow later ref assignments. Pass `player` or `() => player.value`.

## Readiness and failures

The `ready` event makes the store available; it does not guarantee loaded metadata or playable media. Commands issued while unavailable reject or throw and are never replayed later.

See the [action reference](../api/composables.md#usevideoplayeractions) for return types, [events](../api/events.md) for media milestones, and [lifecycle](./lifecycle.md) for KeepAlive behavior.
