export const MP4_SOURCE =
  'https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4'
export const HLS_SOURCE =
  'https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM.m3u8'
export const POSTER =
  'https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.jpg'
export const TRACKS = [
  {
    src: '/captions.vtt',
    kind: 'captions',
    srclang: 'en',
    label: 'English',
    default: true,
  },
] as const
export type DemoMode = 'mp4' | 'hls' | 'custom'
