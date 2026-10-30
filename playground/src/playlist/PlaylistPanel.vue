<script setup lang="ts">
import {
  AudioLines,
  ListVideo,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  X,
} from '@lucide/vue'
import { onMounted, useTemplateRef, watch } from 'vue'
import type { PlaylistLabels } from './labels'
import type { PlaylistItem } from './usePlaylist'

interface Props {
  /**
   * Queue entries in playback order.
   */
  items: readonly PlaylistItem[]
  /**
   * Stable ID of the selected entry.
   */
  currentId?: string
  /**
   * Playback progress of the selected entry, from zero to one hundred.
   */
  progress: number
  /**
   * Stable ID of the upcoming entry.
   */
  nextId?: string
  /**
   * Whether previous-item navigation is available.
   */
  canPrevious: boolean
  /**
   * Whether next-item navigation is available.
   */
  canNext: boolean
  /**
   * Translated queue controls and status labels.
   */
  labels: PlaylistLabels
}
const props = defineProps<Props>()
const emit = defineEmits<{
  select: [id: string]
  previous: []
  next: []
  close: []
}>()
const repeat = defineModel<boolean>('repeat', { required: true })
const shuffle = defineModel<boolean>('shuffle', { required: true })
const autoAdvance = defineModel<boolean>('autoAdvance', { required: true })
const list = useTemplateRef<HTMLOListElement>('list')

function revealCurrent() {
  const element = list.value?.querySelector<HTMLElement>('[aria-current]')
  if (element && list.value) {
    // Scroll only the queue, without moving the surrounding page.
    list.value.scrollTop =
      element.offsetTop -
      list.value.offsetTop -
      (list.value.clientHeight - element.offsetHeight) / 2
  }
}
watch(() => props.currentId, revealCurrent, { flush: 'post' })
onMounted(revealCurrent)

function formatDuration(seconds?: number) {
  if (!seconds || !Number.isFinite(seconds)) {
    return ''
  }
  const total = Math.floor(seconds)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}
</script>

<template>
  <aside
    class="playlist-panel"
    :aria-label="labels.title"
  >
    <header class="playlist-heading">
      <div>
        <h3>{{ labels.title }}</h3>
        <p>{{ labels.collection }}</p>
      </div>
      <button
        type="button"
        :aria-label="labels.hide"
        @click="emit('close')"
      >
        <X
          :size="18"
          aria-hidden="true"
        />
      </button>
    </header>
    <div class="playlist-modes">
      <button
        type="button"
        :aria-label="labels.shuffle"
        :title="labels.shuffle"
        :aria-pressed="shuffle"
        @click="shuffle = !shuffle"
      >
        <Shuffle
          :size="18"
          aria-hidden="true"
        />
      </button>
      <button
        type="button"
        :aria-pressed="repeat"
        @click="repeat = !repeat"
      >
        <Repeat
          :size="18"
          aria-hidden="true"
        /><span>{{ labels.repeat }}</span>
      </button>
      <label class="playlist-auto"
        ><span>{{ labels.autoAdvance }}</span
        ><input
          v-model="autoAdvance"
          type="checkbox"
          role="switch" /><span
          class="playlist-switch"
          aria-hidden="true"
      /></label>
    </div>
    <ol
      ref="list"
      class="playlist-list"
    >
      <li
        v-for="(item, position) in items"
        :key="item.id"
      >
        <button
          class="playlist-item"
          type="button"
          :aria-current="currentId === item.id ? 'true' : undefined"
          @click="emit('select', item.id)"
        >
          <span class="playlist-number"
            ><AudioLines
              v-if="currentId === item.id"
              :size="16"
              aria-hidden="true"
            /><span v-else>{{ position + 1 }}</span></span
          >
          <span class="playlist-thumbnail">
            <img
              v-if="item.poster"
              :src="item.poster"
              alt=""
              loading="lazy"
            />
            <ListVideo
              v-else
              :size="28"
              aria-hidden="true"
            />
            <span
              v-if="formatDuration(item.duration)"
              class="playlist-duration"
              >{{ formatDuration(item.duration) }}</span
            >
            <span
              v-if="currentId === item.id"
              class="playlist-thumbnail-progress"
              :style="{ width: `${progress}%` }"
            />
          </span>
          <span class="playlist-description"
            ><strong>{{ item.title }}</strong
            ><span v-if="currentId === item.id">{{ labels.nowPlaying }}</span
            ><span v-else-if="nextId === item.id">{{
              labels.upNext
            }}</span></span
          >
        </button>
      </li>
    </ol>
    <footer class="playlist-navigation">
      <button
        type="button"
        :disabled="!canPrevious"
        @click="emit('previous')"
      >
        <SkipBack
          :size="18"
          aria-hidden="true"
        />{{ labels.previous }}
      </button>
      <button
        type="button"
        :disabled="!canNext"
        @click="emit('next')"
      >
        {{ labels.next
        }}<SkipForward
          :size="18"
          aria-hidden="true"
        />
      </button>
    </footer>
  </aside>
</template>

<style scoped>
.playlist-panel {
  display: flex;
  min-width: 0;
  flex-direction: column;
  background: #202326;
  color: #fff;
  font-size: 0.8125rem;
}
.playlist-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem 1rem 0.5rem;
}
h3 {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
}
p {
  margin: 0.25rem 0 0;
  color: #a5abb2;
  font-size: 0.75rem;
}
button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 44px;
  border: 0;
  border-radius: 0.75rem;
  padding: 0.5rem;
  color: inherit;
  background: transparent;
  font: inherit;
  cursor: pointer;
}
button:hover {
  background: #ffffff12;
}
button:focus-visible,
input:focus-visible + .playlist-switch {
  outline: 2px solid white;
  outline-offset: -2px;
}
button:disabled {
  opacity: 0.35;
  cursor: default;
}
.playlist-modes {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
  margin: 0 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #ffffff1a;
  font-size: 0.6875rem;
}
button[aria-pressed='true'] {
  background: #ffffff1a;
  box-shadow: inset 0 0 0 1px #ffffff1a;
}
.playlist-auto {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  min-height: 44px;
  margin-left: auto;
  cursor: pointer;
}
.playlist-auto input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}
.playlist-switch {
  width: 28px;
  height: 16px;
  border-radius: 999px;
  background: #60666c;
}
.playlist-switch::after {
  display: block;
  width: 12px;
  height: 12px;
  margin: 2px;
  border-radius: 50%;
  background: #fff;
  content: '';
}
input:checked + .playlist-switch {
  background: #fff;
}
input:checked + .playlist-switch::after {
  transform: translateX(12px);
  background: #202326;
}
.playlist-list {
  position: relative;
  flex: 1;
  min-height: 0;
  max-height: 340px;
  overflow-y: auto;
  overscroll-behavior: contain;
  list-style: none;
  margin: 0;
  padding: 0.5rem;
  scrollbar-width: thin;
  scrollbar-color: #ffffff40 transparent;
}
.playlist-item {
  position: relative;
  display: flex;
  width: 100%;
  gap: 0.625rem;
  padding: 0.625rem 0.5rem;
  text-align: left;
}
.playlist-item[aria-current] {
  background: #ffffff12;
}
.playlist-item[aria-current]::before {
  position: absolute;
  inset: 0.625rem auto 0.625rem 0;
  width: 3px;
  border-radius: 3px;
  background: #fff;
  content: '';
}
.playlist-number {
  display: flex;
  flex: 0 0 16px;
  justify-content: center;
  color: #a5abb2;
  font-variant-numeric: tabular-nums;
}
.playlist-thumbnail {
  position: relative;
  display: flex;
  flex: 0 0 88px;
  aspect-ratio: 16/9;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 0.375rem;
  background: #16191c;
  color: #a5abb2;
}
.playlist-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.playlist-duration {
  position: absolute;
  right: 3px;
  bottom: 3px;
  padding: 1px 3px;
  border-radius: 3px;
  color: white;
  background: #000b;
  font-size: 0.625rem;
  font-variant-numeric: tabular-nums;
}
.playlist-thumbnail-progress {
  position: absolute;
  inset: auto auto 0 0;
  height: 2px;
  background: white;
}
.playlist-description {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 0.375rem;
}
.playlist-description strong {
  overflow: hidden;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.playlist-description > span {
  color: #a5abb2;
  font-size: 0.6875rem;
}
.playlist-navigation {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  margin: 0 1rem;
  padding: 0.5rem 0;
  border-top: 1px solid #ffffff1a;
}
</style>
