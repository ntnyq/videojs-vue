import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { captureVideoFrame, downloadMedia } from '../../../src/media/utils'

function createVideo() {
  const video = document.createElement('video')
  Object.defineProperties(video, {
    readyState: { configurable: true, value: 2 },
    videoWidth: { configurable: true, value: 1280 },
    videoHeight: { configurable: true, value: 720 },
  })
  return video
}

function mockCanvas(
  blob: Blob | null = new Blob(['frame'], { type: 'image/png' }),
) {
  const drawImage = vi.fn()
  // Only the browser canvas operations used by the helper exist in jsdom.
  const context = { drawImage } as unknown as CanvasRenderingContext2D
  const getContext = vi
    .spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockReturnValue(context)
  const toBlob = vi
    .spyOn(HTMLCanvasElement.prototype, 'toBlob')
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Mock the browser encoding callback.
    .mockImplementation(callback => callback(blob))
  return { drawImage, getContext, toBlob, blob }
}

describe('video frame capture', () => {
  afterEach(() => vi.restoreAllMocks())

  it('captures intrinsic pixels and returns bytes without changing playback or owning a URL', async () => {
    expect.hasAssertions()
    const video = createVideo()
    const { drawImage, toBlob, blob } = mockCanvas()
    const pause = vi.spyOn(video, 'pause')
    const play = vi.spyOn(video, 'play')
    video.currentTime = 12
    const frame = await captureVideoFrame(video)
    expect(frame).toBe(blob)
    expect(drawImage).toHaveBeenCalledWith(video, 0, 0, 1280, 720)
    const canvas = toBlob.mock.instances[0]!
    expect(canvas).toMatchObject({ width: 1280, height: 720 })
    expect(toBlob).toHaveBeenCalledWith(
      expect.any(Function),
      'image/png',
      undefined,
    )
    expect(pause).not.toHaveBeenCalled()
    expect(play).not.toHaveBeenCalled()
    expect(video.currentTime).toBe(12)
  })

  it('forwards encoding options while preserving a browser fallback MIME type', async () => {
    expect.hasAssertions()
    const { toBlob } = mockCanvas()
    const frame = await captureVideoFrame(createVideo(), {
      type: 'image/webp',
      quality: 0.8,
    })
    expect(toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/webp', 0.8)
    expect(frame.type).toBe('image/png')
  })

  it('rejects absent media, audio, and adapters without reading private adapter internals', async () => {
    expect.hasAssertions()
    const adapter = document.createElement('hlsjs-video')
    const target = vi.fn(() => createVideo())
    Object.defineProperty(adapter, 'target', { get: target })
    const mediaElements = [
      null,
      undefined,
      document.createElement('audio'),
      Object.assign(adapter, {
        src: '',
        volume: 1,
        muted: false,
        playbackRate: 1,
        paused: true,
        currentTime: 0,
        error: null,
        play: vi.fn(),
        pause: vi.fn(),
      }),
    ]
    await Promise.all(
      mediaElements.map(async media => {
        await expect(captureVideoFrame(media)).rejects.toThrow('native video')
      }),
    )
    expect(target).not.toHaveBeenCalled()
  })

  it.each([
    ['readyState', 1],
    ['videoWidth', 0],
    ['videoHeight', 0],
  ])('rejects a missing frame when %s is %s', async (property, value) => {
    expect.hasAssertions()
    const video = createVideo()
    Object.defineProperty(video, property, { value })
    await expect(captureVideoFrame(video)).rejects.toThrow('No video frame')
  })

  it.each([-1, 1.1, Number.NaN, Infinity])(
    'rejects invalid quality %s',
    async quality => {
      expect.hasAssertions()
      await expect(
        captureVideoFrame(createVideo(), { quality }),
      ).rejects.toThrow(RangeError)
    },
  )

  it('reports unavailable canvas contexts and null encodings', async () => {
    expect.hasAssertions()
    const { getContext } = mockCanvas(null)
    await expect(captureVideoFrame(createVideo())).rejects.toThrow(
      'encoding failed',
    )
    getContext.mockReturnValue(null)
    await expect(captureVideoFrame(createVideo())).rejects.toThrow(
      '2D rendering',
    )
  })

  it('preserves browser drawing and cross-origin encoding errors', async () => {
    expect.hasAssertions()
    const { drawImage, toBlob } = mockCanvas()
    const securityError = new DOMException('Canvas is tainted', 'SecurityError')
    toBlob.mockImplementation(() => {
      throw securityError
    })
    await expect(captureVideoFrame(createVideo())).rejects.toBe(securityError)
    const drawingError = new DOMException('No frame', 'InvalidStateError')
    drawImage.mockImplementation(() => {
      throw drawingError
    })
    await expect(captureVideoFrame(createVideo())).rejects.toBe(drawingError)
  })
})

describe('media downloads', () => {
  const createObjectURL = vi.fn(() => 'blob:https://example.com/owned')
  const revokeObjectURL = vi.fn()
  const clicks: {
    href: string
    filename: string
    connected: boolean
    target: string
  }[] = []

  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal(
      'URL',
      Object.assign(class extends URL {}, { createObjectURL, revokeObjectURL }),
    )
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(
      function click(this: HTMLAnchorElement) {
        clicks.push({
          href: this.href,
          filename: this.download,
          connected: this.isConnected,
          target: this.target,
        })
      },
    )
  })
  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    createObjectURL.mockClear()
    revokeObjectURL.mockClear()
    clicks.length = 0
  })

  it('links file URLs directly without buffering and does not revoke caller URLs', () => {
    expect.hasAssertions()
    downloadMedia('/lesson.mp4', 'lesson.mp4')
    downloadMedia('blob:https://example.com/caller', 'caller.webm')
    expect(clicks[0]).toStrictEqual({
      href: new URL('/lesson.mp4', document.baseURI).href,
      filename: 'lesson.mp4',
      connected: true,
      target: '_blank',
    })
    expect(createObjectURL).not.toHaveBeenCalled()
    vi.runOnlyPendingTimers()
    expect(revokeObjectURL).not.toHaveBeenCalled()
    expect(document.querySelector('a[download]')).toBeNull()
  })

  it('keeps Blob URLs alive during browser handoff then releases them', () => {
    expect.hasAssertions()
    const blob = new Blob(['video'], { type: 'video/mp4' })
    downloadMedia(blob, 'video.mp4')
    expect(createObjectURL).toHaveBeenCalledWith(blob)
    expect(clicks[0]?.href).toBe('blob:https://example.com/owned')
    expect(revokeObjectURL).not.toHaveBeenCalled()
    expect(document.querySelector('a[download]')).toBeNull()
    vi.advanceTimersByTime(60_000)
    expect(revokeObjectURL).toHaveBeenCalledExactlyOnceWith(
      'blob:https://example.com/owned',
    )
  })

  it('cleans up the anchor and owned URL if the browser click throws', () => {
    expect.hasAssertions()
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {
      throw new Error('Blocked')
    })
    expect(() => downloadMedia(new Blob(['video']), 'video.mp4')).toThrow(
      'Blocked',
    )
    expect(document.querySelector('a[download]')).toBeNull()
    vi.runOnlyPendingTimers()
    expect(revokeObjectURL).toHaveBeenCalledExactlyOnceWith(
      'blob:https://example.com/owned',
    )
  })

  it('rejects empty inputs and unsupported URL protocols before triggering a download', () => {
    expect.hasAssertions()
    for (const source of [
      '',
      '  ',
      // oxlint-disable-next-line no-script-url -- Reject executable URL input.
      'javascript:alert(1)',
      'file:///video.mp4',
    ]) {
      expect(() => downloadMedia(source, 'video.mp4')).toThrow(TypeError)
    }
    expect(() => downloadMedia('/video.mp4', ' ')).toThrow('filename')
    expect(clicks).toStrictEqual([])
    expect(createObjectURL).not.toHaveBeenCalled()
  })
})
