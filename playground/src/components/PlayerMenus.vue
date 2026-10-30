<script setup lang="ts">
import { Captions } from '@lucide/vue'
import { CaptionsRadioGroup } from 'videojs-vue/ui/captions-radio-group'
import { MediaMenu } from 'videojs-vue/ui/menu'
import { MediaMenuContent } from 'videojs-vue/ui/menu-content'
import { PlaybackRateButton } from 'videojs-vue/ui/playback-rate-button'
import { PlaybackRateRadioGroup } from 'videojs-vue/ui/playback-rate-radio-group'
import { useVideoPlayerState } from 'videojs-vue/video/composables'
import { useId } from 'vue'
import { useI18n } from 'vue-i18n'

const { t: translate } = useI18n()
const captionsId = useId()
const speedId = useId()
const rate = useVideoPlayerState(state => state.playbackRate)
const captionsEnabled = useVideoPlayerState(state =>
  state.textTrackList.some(
    track =>
      track.mode === 'showing' &&
      (track.kind === 'captions' || track.kind === 'subtitles'),
  ),
)
function formatRate(value: number) {
  return value === 1 ? `1× ${translate('player.normalSpeed')}` : `${value}×`
}
function revealSelected(event: Event) {
  const menu = event.currentTarget
  if (!(menu instanceof HTMLElement)) {
    return
  }
  requestAnimationFrame(() => {
    const selected = menu.querySelector<HTMLElement>('[aria-checked="true"]')
    if (menu.dataset['open'] !== undefined && selected) {
      menu.scrollTop =
        selected.offsetTop - (menu.clientHeight - selected.offsetHeight) / 2
    }
  })
}
</script>

<template>
  <button
    type="button"
    class="player-menu-trigger"
    :class="{ 'captions-enabled': captionsEnabled }"
    :commandfor="captionsId"
    :aria-label="translate('player.captions')"
  >
    <Captions
      :size="20"
      aria-hidden="true"
    />
  </button>
  <MediaMenu
    :id="captionsId"
    class="player-menu"
    side="top"
    align="end"
    @open-change="revealSelected"
  >
    <MediaMenuContent :aria-label="translate('player.captions')">
      <div class="player-menu-heading">{{ translate('player.captions') }}</div>
      <CaptionsRadioGroup :label="translate('player.captions')" />
    </MediaMenuContent>
  </MediaMenu>
  <PlaybackRateButton
    class="player-menu-trigger player-speed-trigger"
    :commandfor="speedId"
    :label="translate('player.speed')"
    >{{ rate ?? 1 }}×</PlaybackRateButton
  >
  <MediaMenu
    :id="speedId"
    class="player-menu"
    side="top"
    align="end"
    @open-change="revealSelected"
  >
    <MediaMenuContent :aria-label="translate('player.speed')">
      <div class="player-menu-heading">{{ translate('player.speed') }}</div>
      <PlaybackRateRadioGroup :format-rate="formatRate" />
    </MediaMenuContent>
  </MediaMenu>
</template>

<style scoped>
.player-menu-trigger {
  position: relative;
  display: inline-flex;
  min-width: 44px;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: white;
  font: inherit;
  cursor: pointer;
}
.player-menu-trigger[hidden] {
  display: none;
}
.player-menu-trigger:hover {
  background: #ffffff1a;
}
.player-menu-trigger:focus-visible {
  outline: 2px solid white;
  outline-offset: -2px;
}
.player-speed-trigger {
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
}
.captions-enabled::after {
  position: absolute;
  bottom: 6px;
  width: 18px;
  height: 2px;
  border-radius: 2px;
  background: white;
  content: '';
}
.player-menu {
  z-index: 20;
  width: 224px;
  max-width: calc(100% - 1rem);
  max-height: min(360px, calc(100cqh - 4rem));
  overflow-y: auto;
  padding: 0.5rem;
  border: 1px solid #ffffff26;
  border-radius: 1.25rem;
  color: white;
  background: #202326ed;
  box-shadow: 0 8px 24px #0003;
  backdrop-filter: blur(20px);
  font-size: 0.8125rem;
}
.player-menu:not([data-open]) {
  display: none;
}
.player-menu-heading {
  margin: 0 0.5rem 0.25rem;
  padding: 0.625rem 0;
  border-bottom: 1px solid #ffffff1a;
  font-weight: 600;
}
.player-menu :deep(media-menu-radio-item) {
  display: flex;
  min-height: 44px;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.75rem;
  cursor: pointer;
}
.player-menu :deep([aria-checked='true']) {
  background: #ffffff12;
}
.player-menu :deep([aria-checked='true'])::after {
  content: '✓';
}
.player-menu :deep([data-highlighted]) {
  outline: 2px solid white;
  outline-offset: -2px;
}
</style>
