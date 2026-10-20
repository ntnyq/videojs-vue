import type { PlayerMedia } from 'videojs-vue'
import { captureVideoFrame, downloadMedia } from 'videojs-vue/media/utils'
import { onScopeDispose, shallowRef } from 'vue'

export function useMediaExport(options: {
  getMedia: () => PlayerMedia | null
  getSource: () => string
}) {
  const isBusy = shallowRef(false)
  const failure = shallowRef('')
  let version = 0
  let controller: AbortController | null = null

  function cancel() {
    version++
    controller?.abort()
    controller = null
    isBusy.value = false
    failure.value = ''
  }

  async function run(
    createBlob: (signal: AbortSignal) => Promise<Blob>,
    filename: string,
  ) {
    cancel()
    const token = version
    const request = new AbortController()
    controller = request
    isBusy.value = true
    try {
      const blob = await createBlob(request.signal)
      if (version === token) {
        downloadMedia(blob, filename)
      }
    } catch (error) {
      if (version === token) {
        failure.value = error instanceof Error ? error.message : String(error)
      }
    } finally {
      if (version === token) {
        controller = null
        isBusy.value = false
      }
    }
  }

  function capture() {
    return run(() => captureVideoFrame(options.getMedia()), 'frame.png')
  }

  function download() {
    return run(async signal => {
      const source = options.getSource()
      if (!source.trim()) {
        throw new Error('A file URL is required.')
      }
      // Add credentials or Authorization headers here for your file endpoint.
      const response = await fetch(source, { signal })
      if (!response.ok) {
        throw new Error(`Download request failed: ${response.status}`)
      }
      return response.blob()
    }, 'video.mp4')
  }

  onScopeDispose(cancel)
  return { isBusy, failure, capture, download, cancel }
}
