export type DemoMode = 'video' | 'audio' | 'background'
export type AspectRatio = '16 / 9' | '4 / 3' | '1 / 1' | '21 / 9'

export interface DemoSettings {
  mode: DemoMode
  videoSource: string
  audioSource: string
  backgroundSource: string
  autoplay: boolean
  muted: boolean
  loop: boolean
  playsInline: boolean
  controls: boolean
  width: number
  aspectRatio: AspectRatio
}

export const videoSources = [
  {
    label: 'Mux: Big Buck Bunny',
    value:
      'https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4',
  },
  {
    label: 'Google: For Bigger Joyrides',
    value:
      'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  },
]

export const audioSources = [
  {
    label: 'SoundHelix Demo',
    value: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    label: 'Horse MP3 Demo',
    value: 'https://www.w3schools.com/html/horse.mp3',
  },
]

export const backgroundSources = [
  {
    label: 'Flower Loop',
    value:
      'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  },
  {
    label: 'Google: For Bigger Escape',
    value:
      'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  },
]

export const aspectRatios: AspectRatio[] = [
  '16 / 9',
  '4 / 3',
  '1 / 1',
  '21 / 9',
]

export const defaultSettings: DemoSettings = {
  mode: 'video',
  videoSource: videoSources[0]!.value,
  audioSource: audioSources[0]!.value,
  backgroundSource: backgroundSources[0]!.value,
  autoplay: false,
  muted: true,
  loop: false,
  playsInline: true,
  controls: true,
  width: 960,
  aspectRatio: '16 / 9',
}
