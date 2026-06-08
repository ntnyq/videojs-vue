import { watch } from 'vue'
import type { ShallowRef } from 'vue'

type AttrsRecord = Record<string, unknown>

function hasOwn(attrs: AttrsRecord, key: string): boolean {
  return Object.hasOwn(attrs, key)
}

function toStringValue(value: unknown): string {
  return value === null || value === undefined ? '' : String(value)
}

function toBoolean(value: unknown): boolean {
  if (value === '' || value === true || value === 'true') {
    return true
  }

  return false
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.length > 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }

  return undefined
}

function toPreload(value: unknown): HTMLMediaElement['preload'] | undefined {
  const normalized = toStringValue(value)

  if (
    normalized === '' ||
    normalized === 'auto' ||
    normalized === 'metadata' ||
    normalized === 'none'
  ) {
    return normalized
  }

  return undefined
}

interface SyncedMediaProps {
  srcProvided: boolean
  src: unknown
  posterProvided: boolean
  poster: unknown
  autoplayProvided: boolean
  autoplay: unknown
  controlsProvided: boolean
  controls: unknown
  loopProvided: boolean
  loop: unknown
  mutedProvided: boolean
  muted: unknown
  playsInlineProvided: boolean
  playsInline: unknown
  preloadProvided: boolean
  preload: unknown
  crossOriginProvided: boolean
  crossOrigin: unknown
  volumeProvided: boolean
  volume: unknown
  playbackRateProvided: boolean
  playbackRate: unknown
  defaultPlaybackRateProvided: boolean
  defaultPlaybackRate: unknown
}

function getSyncedProps(attrs: AttrsRecord): SyncedMediaProps {
  return {
    srcProvided: hasOwn(attrs, 'src'),
    src: attrs['src'],
    posterProvided: hasOwn(attrs, 'poster'),
    poster: attrs['poster'],
    autoplayProvided: hasOwn(attrs, 'autoplay'),
    autoplay: attrs['autoplay'],
    controlsProvided: hasOwn(attrs, 'controls'),
    controls: attrs['controls'],
    loopProvided: hasOwn(attrs, 'loop'),
    loop: attrs['loop'],
    mutedProvided: hasOwn(attrs, 'muted'),
    muted: attrs['muted'],
    playsInlineProvided:
      hasOwn(attrs, 'playsInline') || hasOwn(attrs, 'playsinline'),
    playsInline: attrs['playsInline'] ?? attrs['playsinline'],
    preloadProvided: hasOwn(attrs, 'preload'),
    preload: attrs['preload'],
    crossOriginProvided:
      hasOwn(attrs, 'crossorigin') || hasOwn(attrs, 'crossOrigin'),
    crossOrigin: attrs['crossorigin'] ?? attrs['crossOrigin'],
    volumeProvided: hasOwn(attrs, 'volume'),
    volume: attrs['volume'],
    playbackRateProvided: hasOwn(attrs, 'playbackRate'),
    playbackRate: attrs['playbackRate'],
    defaultPlaybackRateProvided: hasOwn(attrs, 'defaultPlaybackRate'),
    defaultPlaybackRate: attrs['defaultPlaybackRate'],
  }
}

function applyMediaTextProps(
  target: HTMLMediaElement,
  next: SyncedMediaProps,
): void {
  if (next.srcProvided) {
    const src = toStringValue(next.src)
    if (target.getAttribute('src') !== src) {
      target.setAttribute('src', src)
    }
  }

  if (target instanceof HTMLVideoElement && next.posterProvided) {
    const poster = toStringValue(next.poster)
    if (target.poster !== poster) {
      target.poster = poster
    }
  }

  if (next.preloadProvided) {
    const preload = toPreload(next.preload)
    if (preload !== undefined) {
      target.preload = preload
    }
  }

  if (next.crossOriginProvided) {
    target.crossOrigin = toStringValue(next.crossOrigin)
  }
}

function applyMediaBooleanProps(
  target: HTMLMediaElement,
  next: SyncedMediaProps,
): void {
  if (next.autoplayProvided) {
    target.autoplay = toBoolean(next.autoplay)
  }

  if (next.controlsProvided) {
    target.controls = toBoolean(next.controls)
  }

  if (next.loopProvided) {
    target.loop = toBoolean(next.loop)
  }

  if (next.mutedProvided) {
    target.muted = toBoolean(next.muted)
  }

  if (next.playsInlineProvided && target instanceof HTMLVideoElement) {
    target.playsInline = toBoolean(next.playsInline)
  }
}

function applyMediaNumericProps(
  target: HTMLMediaElement,
  next: SyncedMediaProps,
): void {
  const volume = next.volumeProvided ? toNumber(next.volume) : undefined
  if (volume !== undefined) {
    target.volume = Math.min(1, Math.max(0, volume))
  }

  const playbackRate = next.playbackRateProvided
    ? toNumber(next.playbackRate)
    : undefined
  if (playbackRate !== undefined) {
    target.playbackRate = playbackRate
  }

  const defaultPlaybackRate = next.defaultPlaybackRateProvided
    ? toNumber(next.defaultPlaybackRate)
    : undefined
  if (defaultPlaybackRate !== undefined) {
    target.defaultPlaybackRate = defaultPlaybackRate
  }
}

function applySyncedProps(
  target: HTMLMediaElement,
  next: SyncedMediaProps,
): void {
  applyMediaTextProps(target, next)
  applyMediaBooleanProps(target, next)
  applyMediaNumericProps(target, next)
}

export function useSyncMediaProps<El extends HTMLMediaElement>(
  element: ShallowRef<El | null>,
  attrs: AttrsRecord,
): void {
  watch(
    () => getSyncedProps(attrs),
    next => {
      const target = element.value

      if (!target) {
        return
      }

      applySyncedProps(target, next)
    },
    { immediate: true },
  )
}
