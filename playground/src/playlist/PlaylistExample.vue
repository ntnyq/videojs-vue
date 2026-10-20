<script setup lang="ts">
import type { VideoMediaProps, VideoPlayerHandle } from 'videojs-vue'
import { Video, VideoPlayerRoot } from 'videojs-vue/video/core'
import { DefaultVideoSkin } from 'videojs-vue/video/skins/default'
import {
  computed,
  onActivated,
  onDeactivated,
  onMounted,
  reactive,
  useAttrs,
  useTemplateRef,
} from 'vue'
import { usePlaylist } from './usePlaylist'

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    settings?: Partial<VideoMediaProps>
    labels?: {
      previous: string
      next: string
      repeat: string
      loading: string
      retry: string
      cancel: string
    }
  }>(),
  {
    settings: () => ({}),
    labels: () => ({
      previous: 'Previous',
      next: 'Next',
      repeat: 'Repeat playlist',
      loading: 'Resolving source…',
      retry: 'Retry item',
      cancel: 'Cancel',
    }),
  },
)
const attrs = useAttrs()
const player = useTemplateRef<VideoPlayerHandle>('player')
const items = [
  {
    id: 'mux',
    title: 'Video.js demo',
    src: 'https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4',
    poster:
      'https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.jpg',
  },
  {
    id: 'oceans',
    title: 'Oceans',
    src: 'https://vjs.zencdn.net/v/oceans.mp4',
  },
]
const playlist = reactive(
  usePlaylist({
    items,
    getMedia: () => player.value?.media ?? null,
    // Replace this with fetch(..., { signal }) for signed URLs.
    resolveSource: (item, signal) => {
      signal.throwIfAborted()
      return item.src
    },
  }),
)
// A new media element per selection isolates late events from previous items.
const sessions = computed(() => (playlist.session ? [playlist.session] : []))
const mediaSettings = computed(() => {
  const {
    src: _src,
    poster: _poster,
    autoplay: _autoplay,
    loop: _loop,
    ...settings
  } = props.settings
  return settings
})
let isActive = false
async function activate() {
  if (!isActive) {
    isActive = true
    await playlist.select(Math.max(0, playlist.index), false)
  }
}
onMounted(activate)
onActivated(activate)
onDeactivated(() => {
  isActive = false
  playlist.cancel()
})
</script>

<template>
  <div class="playlist-example">
    <VideoPlayerRoot
      ref="player"
      v-bind="attrs"
      :title="playlist.session?.item.title"
      :poster="playlist.session?.item.poster"
    >
      <DefaultVideoSkin>
        <Video
          v-for="session in sessions"
          :key="session.version"
          v-bind="mediaSettings"
          :src="session.src"
          :poster="session.item.poster"
          :loop="false"
          :autoplay="false"
          @loadedmetadata="playlist.loadedMetadata(session.version)"
          @ended="playlist.ended(session.version)"
          @error="playlist.mediaError(session.version)"
          @playing="playlist.playing(session.version)"
        />
      </DefaultVideoSkin>
    </VideoPlayerRoot>
    <div class="playlist-panel">
      <div class="playlist-actions">
        <button
          type="button"
          :disabled="!playlist.canPrevious"
          @click="playlist.previous()"
        >
          {{ labels.previous }}
        </button>
        <button
          type="button"
          :disabled="!playlist.canNext"
          @click="playlist.next()"
        >
          {{ labels.next }}
        </button>
        <label
          ><input
            v-model="playlist.repeat"
            type="checkbox"
          />
          {{ labels.repeat }}</label
        >
      </div>
      <ol>
        <li
          v-for="(item, index) in items"
          :key="item.id"
        >
          <button
            type="button"
            :aria-current="playlist.index === index ? 'true' : undefined"
            @click="playlist.select(index)"
          >
            {{ index + 1 }}. {{ item.title }}
          </button>
        </li>
      </ol>
      <p
        v-if="playlist.isLoading"
        role="status"
      >
        {{ labels.loading }}
        <button
          type="button"
          @click="playlist.cancel()"
        >
          {{ labels.cancel }}
        </button>
      </p>
      <div
        v-if="playlist.failure"
        role="alert"
      >
        <p>{{ playlist.failure }}</p>
        <button
          type="button"
          @click="playlist.select(playlist.index, true)"
        >
          {{ labels.retry }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.playlist-example {
  color: white;
  background: #18181b;
}
video-player {
  display: block;
  width: 100%;
  min-height: 180px;
}
.playlist-panel {
  padding: 1rem;
  font-size: 0.875rem;
}
.playlist-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}
ol {
  margin: 0.75rem 0 0;
  padding: 0;
  list-style: none;
}
button {
  border: 1px solid #71717a;
  border-radius: 0.25rem;
  padding: 0.375rem 0.75rem;
  color: inherit;
  background: transparent;
  cursor: pointer;
  font: inherit;
}
li + li {
  margin-top: 0.5rem;
}
li button {
  width: 100%;
  text-align: left;
}
button[aria-current] {
  background: #3f3f46;
  border-color: white;
}
button:disabled {
  opacity: 0.4;
  cursor: default;
}
button:focus-visible,
input:focus-visible {
  outline: 2px solid #a5b4fc;
  outline-offset: 3px;
}
[role='alert'] {
  margin-top: 0.75rem;
  color: #fda4af;
}
</style>
