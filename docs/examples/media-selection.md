---
description: Select video quality and alternate audio tracks with Vue controls and player actions.
---

# Quality and audio selection

The packaged video skins already include quality and audio menus. Pass `HlsVideo` as the `VideoPlayer` media component and use an HLS master playlist with multiple renditions or alternate audio tracks. A single MP4 does not create extra qualities or languages.

Availability depends on the source, adapter, and browser. Native HLS may expose fewer manual choices than hls.js. Menus follow upstream availability and hide when there are no choices. The audio-only preset does not include these selection features.

## Compose independent menus

`QualityRadioGroup` generates an Auto item and one item per rendition. `AudioTrackRadioGroup` generates one item per audio track. Both use upstream selection, keyboard navigation, accessible labels, and selected state.

Each group belongs inside `MediaMenuContent`, which must be a direct child of `MediaMenu`. A native button with `commandfor` opens the menu. Keep IDs unique across players.

```vue
<script setup lang="ts">
import { useId } from 'vue'
import { PlayerRoot } from 'videojs-vue/core'
import { HlsVideo } from 'videojs-vue/media/hls'
import { AudioTrackRadioGroup } from 'videojs-vue/ui/audio-track-radio-group'
import { MediaContainer } from 'videojs-vue/ui/container'
import { MediaMenu } from 'videojs-vue/ui/menu'
import { MediaMenuContent } from 'videojs-vue/ui/menu-content'
import { PlayButton } from 'videojs-vue/ui/play-button'
import { QualityRadioGroup } from 'videojs-vue/ui/quality-radio-group'

const qualityId = useId()
const audioId = useId()
</script>

<template>
  <PlayerRoot>
    <MediaContainer>
      <HlsVideo src="https://example.com/master.m3u8" />
      <PlayButton>Play / pause</PlayButton>
      <button
        type="button"
        :commandfor="qualityId"
      >
        Quality
      </button>
      <MediaMenu :id="qualityId">
        <MediaMenuContent aria-label="Quality">
          <QualityRadioGroup label="Quality" />
        </MediaMenuContent>
      </MediaMenu>
      <button
        type="button"
        :commandfor="audioId"
      >
        Audio
      </button>
      <MediaMenu :id="audioId">
        <MediaMenuContent aria-label="Audio">
          <AudioTrackRadioGroup label="Audio" />
        </MediaMenuContent>
      </MediaMenu>
    </MediaContainer>
  </PlayerRoot>
</template>

<style scoped>
media-container,
hlsjs-video {
  display: block;
  width: 100%;
}
media-menu {
  padding: 0.5rem;
  background: #18181b;
  color: white;
}
media-menu:not([data-open]) {
  display: none;
}
media-menu :deep(media-menu-radio-item) {
  display: block;
  padding: 0.5rem;
  cursor: pointer;
}
media-menu :deep([aria-checked='true']) {
  font-weight: bold;
  text-decoration: underline;
}
media-menu :deep([data-highlighted]) {
  outline: 2px solid currentColor;
}
</style>
```

Individual group entries also register the radio items they generate. Style those items with `:deep()` in scoped styles. `formatRendition` and `formatTrack` customize option labels with typed callbacks. Default labels participate in [player internationalization](../guide/internationalization.md).

## Select with actions

Read IDs from the current source through `usePlayerState`. Re-read them after a source change. Manual selection and the currently playing rendition are different: ABR can change the active rendition while selection remains Auto.

```vue
<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { VideoPlayer, usePlayerActions, usePlayerState } from 'videojs-vue'
import type { PlayerHandle } from 'videojs-vue'
import { HlsVideo } from 'videojs-vue/media/hls'

const player = shallowRef<PlayerHandle | null>(null)
const actions = usePlayerActions(player)
const renditions = usePlayerState(state => state.videoRenditionList, player)
const tracks = usePlayerState(state => state.audioTrackList, player)
const active = usePlayerState(state => state.activeVideoRendition, player)
const quality = computed(
  () => renditions.value?.find(item => item.selected)?.id ?? 'auto',
)
</script>

<template>
  <VideoPlayer
    ref="player"
    :media="HlsVideo"
    src="https://example.com/master.m3u8"
  />
  <p>Selection: {{ quality }}; playing: {{ active?.height ?? '—' }}p</p>
  <button
    :disabled="!renditions?.length"
    @click="actions.selectVideoRendition('auto')"
  >
    Auto
  </button>
  <button
    v-for="rendition in renditions"
    :key="rendition.id"
    :aria-pressed="rendition.selected"
    @click="actions.selectVideoRendition(rendition.id)"
  >
    {{ rendition.height ? `${rendition.height}p` : rendition.id }}
  </button>
  <button
    v-for="track in tracks"
    :key="track.id"
    :aria-pressed="track.enabled"
    @click="actions.selectAudioTrack(track.id)"
  >
    {{ track.label || track.language || track.id }}
  </button>
</template>
```

The same methods are exposed on the component ref. They throw while the player is unavailable, preserve upstream errors, and never queue selections. Unknown IDs and unsupported media capabilities follow upstream no-op behavior. Requested quality can take time to become active as buffered segments finish playing.

Try the HLS example's Actions tab in the [Playground](https://videojs-vue-playground.vercel.app), or see the upstream [quality selector guide](https://videojs.org/docs/framework/html/guides/quality-selector).
