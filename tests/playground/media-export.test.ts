// oxlint-disable-next-line import/no-namespace -- Spy on browser side effects.
import * as mediaUtils from 'videojs-vue/media/utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import { useMediaExport } from '../../playground/src/media-export/useMediaExport'

const scopes: ReturnType<typeof effectScope>[] = []
function setup() {
  const scope = effectScope()
  scopes.push(scope)
  const media = document.createElement('video')
  const mediaExport = scope.run(() =>
    useMediaExport({
      getMedia: () => media,
      getSource: () => '/lesson.mp4',
    }),
  )!
  const save = vi
    .spyOn(mediaUtils, 'downloadMedia')
    .mockImplementation(() => {})
  return { mediaExport, save, scope, media }
}

describe('media export recipe', () => {
  afterEach(() => {
    for (const scope of scopes.splice(0)) {
      scope.stop()
    }
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('downloads a fetched file and reports HTTP/body errors', async () => {
    expect.hasAssertions()
    const { mediaExport, save } = setup()
    const blob = new Blob(['video'])
    const fetchFile = vi
      .fn()
      .mockResolvedValue({ ok: true, blob: () => Promise.resolve(blob) })
    vi.stubGlobal('fetch', fetchFile)
    await mediaExport.download()
    expect(save).toHaveBeenCalledWith(blob, 'video.mp4')
    expect(fetchFile).toHaveBeenCalledWith('/lesson.mp4', {
      signal: expect.any(AbortSignal),
    })
    fetchFile.mockResolvedValue({ ok: false, status: 403 })
    await mediaExport.download()
    expect(mediaExport.failure.value).toContain('403')
    fetchFile.mockResolvedValue({
      ok: true,
      blob: () => Promise.reject(new Error('Connection lost')),
    })
    await mediaExport.download()
    expect(mediaExport.failure.value).toBe('Connection lost')
    expect(mediaExport.isBusy.value).toBe(false)
    expect(save).toHaveBeenCalledTimes(1)
  })

  it('cancels body reads and ignores late results after disposal', async () => {
    expect.hasAssertions()
    const { mediaExport, save, scope } = setup()
    let resolveBlob: (blob: Blob) => void = vi.fn()
    // oxlint-disable-next-line promise/avoid-new -- Exercise a body reader that ignores abort.
    const body = new Promise<Blob>(resolve => {
      resolveBlob = resolve
    })
    const fetchFile = vi.fn().mockResolvedValue({ ok: true, blob: () => body })
    vi.stubGlobal('fetch', fetchFile)
    const pending = mediaExport.download()
    await Promise.resolve()
    const signal = fetchFile.mock.calls[0]![1].signal as AbortSignal
    scope.stop()
    expect(signal.aborted).toBe(true)
    resolveBlob(new Blob(['late']))
    await pending
    expect(save).not.toHaveBeenCalled()
    expect(mediaExport.isBusy.value).toBe(false)
    expect(mediaExport.failure.value).toBe('')
  })

  it('discards late frame encodes after cancel and preserves a newer task', async () => {
    expect.hasAssertions()
    const { mediaExport, save, media } = setup()
    let resolveFrame: (blob: Blob) => void = vi.fn()
    // oxlint-disable-next-line promise/avoid-new -- Canvas serialization cannot be aborted.
    const frame = new Promise<Blob>(resolve => {
      resolveFrame = resolve
    })
    const capture = vi
      .spyOn(mediaUtils, 'captureVideoFrame')
      .mockReturnValueOnce(frame)
      .mockRejectedValueOnce(new Error('Canvas is tainted'))
    const old = mediaExport.capture()
    mediaExport.cancel()
    await mediaExport.capture()
    expect(capture).toHaveBeenCalledWith(media)
    expect(mediaExport.failure.value).toBe('Canvas is tainted')
    resolveFrame(new Blob(['old frame']))
    await old
    expect(save).not.toHaveBeenCalled()
    expect(mediaExport.failure.value).toBe('Canvas is tainted')
  })
})
