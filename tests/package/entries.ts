export const registrationEntries: Record<string, string[]> = {
  core: ['video-player'],
  'video/legacy': [
    'video-player',
    'media-container',
    'media-play-button',
    'media-time-slider',
  ],
  'skins/legacy': ['media-container', 'media-play-button'],
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
  'ui/quality-radio-group': [
    'media-quality-radio-group',
    'media-menu-radio-item',
  ],
  'ui/audio-track-radio-group': [
    'media-audio-track-radio-group',
    'media-menu-radio-item',
  ],
  ...Object.fromEntries(
    [
      'container',
      'menu',
      'menu-content',
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
