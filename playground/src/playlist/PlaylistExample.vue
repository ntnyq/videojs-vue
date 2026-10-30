<script setup lang="ts">
import { ListVideo } from '@lucide/vue'
import type { VideoMediaProps, VideoPlayerHandle } from 'videojs-vue'
import { useVideoPlayerState } from 'videojs-vue/video/composables'
import { Video, VideoPlayerRoot } from 'videojs-vue/video/core'
import { DefaultVideoSkin } from 'videojs-vue/video/skins/default'
import {
  computed,
  onActivated,
  onDeactivated,
  onMounted,
  reactive,
  shallowRef,
  useId,
  useAttrs,
  useTemplateRef,
} from 'vue'
import { playlistLabels } from './labels'
import type { PlaylistLabels } from './labels'
import PlaylistPanel from './PlaylistPanel.vue'
import { usePlaylist } from './usePlaylist'

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    settings?: Partial<VideoMediaProps>
    labels?: PlaylistLabels
  }>(),
  {
    settings: () => ({}),
    labels: () => ({ ...playlistLabels }),
  },
)
const attrs = useAttrs()
const player = useTemplateRef<VideoPlayerHandle>('player')
const queueId = useId()
const isQueueOpen = shallowRef(true)
const queueToggle = useTemplateRef<HTMLButtonElement>('queueToggle')
const durations = shallowRef<Record<string, number>>({})
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
    poster: 'https://vjs.zencdn.net/v/oceans.png',
  },
]
const playlist = reactive(
  usePlaylist({
    items,
    advanceDelay: 5,
    getMedia: () => player.value?.media ?? null,
    // Replace this with fetch(..., { signal }) for signed URLs.
    resolveSource: (item, signal) => {
      signal.throwIfAborted()
      return item.src
    },
  }),
)
const currentTime = useVideoPlayerState(state => state.currentTime, player)
const duration = useVideoPlayerState(state => state.duration, player)
const orderedItems = computed(() =>
  playlist.order.map(index => {
    const item = items[index]!
    return { ...item, duration: durations.value[item.id] }
  }),
)
const currentItem = computed(() => items[playlist.index])
const nextItem = computed(() =>
  playlist.nextIndex === undefined ? undefined : items[playlist.nextIndex],
)
const countdownLabel = computed(() =>
  props.labels.countdown.replace('{seconds}', String(playlist.countdown)),
)
const progress = computed(() =>
  duration.value && Number.isFinite(duration.value)
    ? Math.min(
        100,
        Math.max(0, ((currentTime.value ?? 0) / duration.value) * 100),
      )
    : 0,
)
function loadedMetadata(version: number, event: Event) {
  const media = event.target instanceof HTMLVideoElement ? event.target : null
  const item = playlist.session?.item
  if (
    playlist.session?.version === version &&
    item &&
    media &&
    Number.isFinite(media.duration)
  ) {
    durations.value = { ...durations.value, [item.id]: media.duration }
  }
  return playlist.loadedMetadata(version)
}
function selectItem(id: string) {
  return playlist.select(items.findIndex(item => item.id === id))
}
function closeQueue() {
  isQueueOpen.value = false
  queueToggle.value?.focus()
}
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
  <section class="playlist-example">
    <header class="playlist-toolbar">
      <div class="playlist-title">
        <strong>{{ currentItem?.title || labels.title }}</strong
        ><span>{{ playlist.position + 1 }} / {{ items.length }}</span>
      </div>
      <button
        ref="queueToggle"
        class="playlist-toggle"
        type="button"
        :aria-label="isQueueOpen ? labels.hide : labels.show"
        :aria-expanded="isQueueOpen"
        :aria-controls="queueId"
        @click="isQueueOpen = !isQueueOpen"
      >
        <ListVideo
          :size="18"
          aria-hidden="true"
        />{{ labels.title }}
      </button>
    </header>
    <div
      class="playlist-layout"
      :class="{ 'playlist-collapsed': !isQueueOpen }"
    >
      <div class="playlist-stage">
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
              @loadedmetadata="loadedMetadata(session.version, $event)"
              @ended="playlist.ended(session.version)"
              @error="playlist.mediaError(session.version)"
              @playing="playlist.playing(session.version)"
            />
            <div
              v-if="playlist.countdown !== null && nextItem"
              class="playlist-next-up"
              role="status"
            >
              <img
                v-if="nextItem.poster"
                :src="nextItem.poster"
                alt=""
              />
              <div>
                <span>{{ labels.upNext }}</span
                ><strong>{{ nextItem.title }}</strong
                ><span>{{ countdownLabel }}</span>
              </div>
              <div class="playlist-next-actions">
                <button
                  type="button"
                  @click="playlist.cancelAdvance()"
                >
                  {{ labels.cancel }}</button
                ><button
                  type="button"
                  class="playlist-play-now"
                  @click="playlist.next(true)"
                >
                  {{ labels.playNow }}
                </button>
              </div>
            </div>
          </DefaultVideoSkin>
        </VideoPlayerRoot>
      </div>
      <PlaylistPanel
        v-if="isQueueOpen"
        :id="queueId"
        v-model:repeat="playlist.repeat"
        v-model:shuffle="playlist.shuffle"
        v-model:auto-advance="playlist.autoAdvance"
        :items="orderedItems"
        :current-id="currentItem?.id"
        :progress="progress"
        :next-id="nextItem?.id"
        :can-previous="playlist.canPrevious"
        :can-next="playlist.canNext"
        :labels="labels"
        @select="selectItem"
        @previous="playlist.previous()"
        @next="playlist.next()"
        @close="closeQueue"
      />
    </div>
    <p
      v-if="playlist.isLoading"
      class="playlist-status"
      role="status"
    >
      {{ labels.loading
      }}<button
        type="button"
        @click="playlist.cancel()"
      >
        {{ labels.cancel }}
      </button>
    </p>
    <div
      v-if="playlist.failure"
      class="playlist-status playlist-error"
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
  </section>
</template>

<style scoped>
.playlist-example {
  container-type: inline-size;
  overflow: hidden;
  border: 1px solid #ffffff1a;
  border-radius: 1.25rem;
  color: #fff;
  background: #16191c;
}
.playlist-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #ffffff1a;
}
.playlist-title {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
}
.playlist-title strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}
.playlist-title span {
  flex-shrink: 0;
  color: #a5abb2;
  font-variant-numeric: tabular-nums;
}
button {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 0;
  border-radius: 999px;
  padding: 0.5rem 0.75rem;
  background: #ffffff12;
  color: inherit;
  font: inherit;
  font-size: 0.75rem;
  cursor: pointer;
}
button:hover {
  background: #ffffff25;
}
button:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}
.playlist-toggle {
  flex-shrink: 0;
}
.playlist-layout {
  display: grid;
  min-width: 0;
}
.playlist-stage {
  display: flex;
  min-width: 0;
  flex-direction: column;
  justify-content: center;
  background: #000;
}
video-player {
  position: relative;
  display: block;
  width: 100%;
  min-width: 0;
  min-height: 180px;
}
.playlist-next-up {
  position: absolute;
  z-index: 5;
  right: 1rem;
  bottom: 5rem;
  display: grid;
  grid-template-columns: 72px 1fr;
  width: min(300px, calc(100% - 2rem));
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid #ffffff26;
  border-radius: 1.25rem;
  background: #202326ed;
  backdrop-filter: blur(20px);
}
.playlist-next-up img {
  width: 72px;
  aspect-ratio: 16/9;
  align-self: center;
  border-radius: 0.375rem;
  object-fit: cover;
}
.playlist-next-up > div {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.25rem;
}
.playlist-next-up span {
  font-size: 0.6875rem;
  color: #a5abb2;
}
.playlist-next-up strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.8125rem;
}
.playlist-next-up .playlist-next-actions {
  grid-column: 1/-1;
  flex-direction: row;
  justify-content: flex-end;
}
.playlist-next-actions .playlist-play-now {
  color: #16191c;
  background: #fff;
}
.playlist-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  padding: 0.75rem 1rem;
  font-size: 0.8125rem;
}
.playlist-error {
  flex-wrap: wrap;
  color: #fda4af;
}
@container (min-width: 760px) {
  .playlist-layout:not(.playlist-collapsed) {
    grid-template-columns: minmax(0, 1fr) 300px;
  }
}
</style>
