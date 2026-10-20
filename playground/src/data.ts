import type { MediaEventName, MediaProps } from 'videojs-vue'

export const MP4_SOURCE =
  'https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4'
export const AUDIO_SOURCE =
  'https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/audio.m4a'
export const HLS_SOURCE =
  'https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM.m3u8'
export const LIVE_SOURCE =
  'https://demo.unified-streaming.com/k8s/live/stable/live.isml/.m3u8'
export const POSTER =
  'https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.jpg'
export const EXAMPLES = [
  {
    id: 'audio',
    group: 'playback',
    icon: 'radio',
  },
  {
    id: 'basic',
    group: 'playback',
    icon: 'play',
  },
  {
    id: 'hls',
    group: 'playback',
    icon: 'radio',
  },
  {
    id: 'live',
    group: 'playback',
    icon: 'radio',
  },
  {
    id: 'custom',
    group: 'playback',
    icon: 'sliders',
  },
  {
    id: 'captions',
    group: 'playback',
    icon: 'captions',
  },
  {
    id: 'binding',
    group: 'api',
    icon: 'link',
  },
  {
    id: 'state',
    group: 'api',
    icon: 'activity',
  },
  {
    id: 'actions',
    group: 'api',
    icon: 'settings',
  },
  {
    id: 'lifecycle',
    group: 'api',
    icon: 'power',
  },
] as const
export type ExampleId = (typeof EXAMPLES)[number]['id']

export type PlayerType = 'video' | 'audio'

export interface PlaygroundConfig {
  src: string
  poster: string
  title: string
  skin: 'default' | 'neutral'
  volume: number
  muted: boolean
  playbackRate: number
  autoplay: boolean
  loop: boolean
  playsinline: boolean
  preload: MediaProps['preload']
  crossorigin: 'anonymous' | 'use-credentials' | undefined
  hasCaptions: boolean
  trackSrc: string
  trackLanguage: string
  trackLabel: string
}
export function createConfig(example: ExampleId = 'basic'): PlaygroundConfig {
  const sources: Partial<Record<ExampleId, string>> = {
    audio: AUDIO_SOURCE,
    hls: HLS_SOURCE,
    live: LIVE_SOURCE,
  }
  return {
    src: sources[example] ?? MP4_SOURCE,
    poster: example === 'live' ? '' : POSTER,
    title: example === 'audio' ? 'Audio demo' : 'Video.js demo',
    skin: 'default',
    volume: 0.7,
    muted: false,
    playbackRate: 1,
    autoplay: false,
    loop: false,
    playsinline: true,
    preload: 'metadata',
    crossorigin: 'anonymous',
    hasCaptions: example === 'captions',
    trackSrc: '/captions.vtt',
    trackLanguage: 'en',
    trackLabel: 'English',
  }
}
export const MEDIA_EVENTS = [
  'abort',
  'canplay',
  'canplaythrough',
  'durationchange',
  'emptied',
  'ended',
  'error',
  'loadeddata',
  'loadedmetadata',
  'loadstart',
  'pause',
  'play',
  'playing',
  'progress',
  'ratechange',
  'seeked',
  'seeking',
  'stalled',
  'suspend',
  'timeupdate',
  'volumechange',
  'waiting',
  'enterpictureinpicture',
  'leavepictureinpicture',
] as const satisfies readonly MediaEventName[]
export const LOG_LIMIT = 500
export type LogKind = 'event' | 'action' | 'model' | 'lifecycle' | 'error'
export interface LogEntry {
  id: number
  timestamp: string
  kind: LogKind
  name: string
  payload: string
}
export function isMediaUrl(source: string) {
  try {
    return ['http:', 'https:'].includes(
      new URL(source, globalThis.location.href).protocol,
    )
  } catch {
    return false
  }
}
