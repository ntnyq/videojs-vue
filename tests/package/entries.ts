export const registrationEntries: Record<string, string[]> = {
  core: ['video-player'],
  'audio/core': ['audio-player'],
  'video/compat': ['video-player', 'video-compat-skin'],
  'video/default': ['video-player', 'video-skin'],
  'video/neutral': ['video-player', 'video-neutral-skin'],
  'audio/default': ['audio-player', 'audio-skin'],
  'audio/neutral': ['audio-player', 'audio-neutral-skin'],
  'skins/compat': ['video-compat-skin'],
  'skins/default': ['video-skin'],
  'skins/neutral': ['video-neutral-skin'],
  'audio/skins/default': ['audio-skin'],
  'audio/skins/neutral': ['audio-neutral-skin'],
  'media/hls': ['hlsjs-video'],
  i18n: ['media-i18n', 'media-text'],
  ...Object.fromEntries(
    [
      'container',
      'controls',
      'controls-content',
      'controls-group',
      'play-button',
      'mute-button',
      'fullscreen-button',
      'pip-button',
      'captions-button',
      'seek-button',
      'time',
      'time-slider',
      'volume-slider',
      'slider-track',
      'slider-fill',
      'slider-buffer',
      'slider-thumb',
      'hotkey',
      'poster',
      'status-announcer',
    ].map(name => [`ui/${name}`, [`media-${name}`]]),
  ),
}

declare module 'vitest' {
  export interface ProvidedContext {
    packageEntry: string
    registeredTags: string[]
  }
}
