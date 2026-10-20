import type { PlayerMedia } from './types'

export interface VideoFrameOptions {
  /**
   * Requested encoding. Unsupported encodings fall back to PNG in the browser.
   */
  type?: 'image/png' | 'image/jpeg' | 'image/webp'
  /**
   * JPEG or WebP quality between 0 and 1. PNG ignores this option.
   */
  quality?: number
}

/**
 * Capture the current native video frame at its intrinsic resolution.
 * Does not seek, pause, include controls/captions, or create an object URL.
 * Rejects for non-native media, unavailable frames, encoding failures, and
 * cross-origin canvas restrictions. Browser errors are preserved.
 * @param {PlayerMedia | null | undefined} media - The active player's native video.
 * @param {VideoFrameOptions} options - Browser image encoding options.
 * @returns {Promise<Blob>} Encoded frame; inspect its type for the actual encoding.
 */
export async function captureVideoFrame(
  media: PlayerMedia | null | undefined,
  options: VideoFrameOptions = {},
): Promise<Blob> {
  const VideoElement = media?.ownerDocument.defaultView?.HTMLVideoElement
  if (!VideoElement || !(media instanceof VideoElement)) {
    throw new TypeError(
      '[videojs-vue] Frame capture requires a native video element.',
    )
  }
  if (media.readyState < 2 || media.videoWidth <= 0 || media.videoHeight <= 0) {
    throw new Error('[videojs-vue] No video frame is available yet.')
  }
  const { quality, type = 'image/png' } = options
  if (
    quality !== undefined &&
    (!Number.isFinite(quality) || quality < 0 || quality > 1)
  ) {
    throw new RangeError('[videojs-vue] Image quality must be between 0 and 1.')
  }
  const canvas = media.ownerDocument.createElement('canvas')
  canvas.width = media.videoWidth
  canvas.height = media.videoHeight
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('[videojs-vue] Canvas 2D rendering is unavailable.')
  }
  context.drawImage(media, 0, 0, canvas.width, canvas.height)
  // oxlint-disable-next-line promise/avoid-new -- Canvas encoding uses a callback API.
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('[videojs-vue] Video frame encoding failed.'))
        }
      },
      type,
      quality,
    )
  })
}

// Give the browser time to consume the URL after the click, including on Safari.
const DOWNLOAD_URL_LIFETIME = 60_000

/**
 * Request a browser download of a file URL or Blob from a user interaction.
 * URL strings are linked directly without fetching. Cross-origin URLs may open
 * in a new tab unless the server serves them as attachments. Fetch a Blob first
 * when CORS permits it and the filename/download behavior must be controlled.
 * Only URLs created here are revoked, after a short browser handoff period.
 * This requests a download; it cannot observe whether the browser saves the file.
 * @param {string | Blob} source - A file URL or already fetched/encoded bytes.
 * @param {string} filename - Suggested filename, including its extension.
 */
export function downloadMedia(source: string | Blob, filename: string): void {
  if (typeof document === 'undefined') {
    throw new TypeError('[videojs-vue] Downloads require a browser document.')
  }
  if (!filename.trim()) {
    throw new TypeError('[videojs-vue] A download filename is required.')
  }
  const anchor = document.createElement('a')
  let objectUrl: string | undefined
  if (typeof source === 'string') {
    if (!source.trim()) {
      throw new TypeError('[videojs-vue] A download URL is required.')
    }
    const url = new URL(source, document.baseURI)
    if (!['http:', 'https:', 'blob:'].includes(url.protocol)) {
      throw new TypeError('[videojs-vue] Unsupported download URL protocol.')
    }
    anchor.href = url.href
  } else {
    objectUrl = URL.createObjectURL(source)
    anchor.href = objectUrl
  }
  anchor.download = filename
  anchor.target = '_blank'
  anchor.rel = 'noopener noreferrer'
  try {
    document.body.append(anchor)
    anchor.click()
  } finally {
    anchor.remove()
    if (objectUrl) {
      const url = objectUrl
      setTimeout(() => URL.revokeObjectURL(url), DOWNLOAD_URL_LIFETIME)
    }
  }
}
