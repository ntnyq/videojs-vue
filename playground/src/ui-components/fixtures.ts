import type { ThumbnailElement } from '@videojs/html'

/** Local diagnostic sprite frames; these deliberately do not depict the remote video. */
export const thumbnails: NonNullable<ThumbnailElement['thumbnails']> = [
  {
    url: '/ui-thumbnails.svg',
    startTime: 0,
    endTime: 8,
    width: 160,
    height: 90,
    coords: { x: 0, y: 0 },
  },
  {
    url: '/ui-thumbnails.svg',
    startTime: 8,
    endTime: 18,
    width: 160,
    height: 90,
    coords: { x: 160, y: 0 },
  },
  {
    url: '/ui-thumbnails.svg',
    startTime: 18,
    endTime: 28,
    width: 160,
    height: 90,
    coords: { x: 320, y: 0 },
  },
  {
    url: '/ui-thumbnails.svg',
    startTime: 28,
    endTime: 40,
    width: 160,
    height: 90,
    coords: { x: 480, y: 0 },
  },
]
