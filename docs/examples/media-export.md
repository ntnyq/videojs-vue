---
description: Capture a native video frame and download media files or Blobs.
---

# Screenshots and downloads

Import the standalone helpers from `videojs-vue/media/utils`. This entry has no Vue runtime dependency, registers no custom elements, and does not load hls.js. Importing it is SSR-safe; call the helpers in the browser from a user interaction.

```ts
import { captureVideoFrame, downloadMedia } from 'videojs-vue/media/utils'

// player is a template ref holding a VideoPlayerHandle.
const frame = await captureVideoFrame(player.value?.media)
downloadMedia(frame, 'frame.png')
```

## Capture a frame

`captureVideoFrame(media, options?)` returns `Promise<Blob>` at the video's intrinsic resolution. It captures immediately without seeking or pausing. The result contains the video pixels, without player controls, overlays, or captions.

| Option    | Default         | Meaning                                                  |
| --------- | --------------- | -------------------------------------------------------- |
| `type`    | `'image/png'`   | `'image/png'`, `'image/jpeg'`, or `'image/webp'`         |
| `quality` | Browser default | Finite number from 0 to 1 for JPEG/WebP; ignored for PNG |

The browser may fall back to PNG if it cannot encode the requested type. Check `blob.type` when choosing a file extension. The helper creates no object URLs, so the Blob can also be uploaded or previewed by your application.

The media must be a native `HTMLVideoElement`, with `readyState >= 2` and nonzero `videoWidth` / `videoHeight`. Wait for `loadeddata` or play/seek before capturing. Audio elements, missing refs, and adapter elements reject with a descriptive error. `HlsVideo` currently has no public native-video accessor; its protected internals and shadow DOM are not used by this helper.

Set `crossorigin="anonymous"` before loading cross-origin video and configure the server's CORS headers. Canvas export can still throw `SecurityError`; browser errors are preserved so applications can show the actual cause. Canvas context failures and a null encoding result also reject. See [canvas encoding](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob) and [cross-origin canvas restrictions](https://developer.mozilla.org/en-US/docs/Web/HTML/How_to/CORS_enabled_image).

## Download a file

`downloadMedia(source, filename)` requests a browser download and returns `void`. `source` is a file URL string (relative, HTTP(S), or Blob URL) or a Blob. The filename must include the desired extension. The helper does not infer a downloadable source from the player.

```ts
// No fetch or buffering; suitable for same-origin files or attachment endpoints.
downloadMedia('/media/lesson.mp4', 'lesson.mp4')

// Caller-owned Blob URLs remain caller-owned and are never revoked here.
downloadMedia(myObjectUrl, 'recording.webm')
```

Browsers decide whether to honor the filename and download request. A cross-origin URL may open in a new tab unless the server provides an attachment response. The helper cannot report whether a file was saved. See the [HTML download attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a#download).

For authenticated files or predictable cross-origin download behavior, fetch the bytes and pass a Blob:

```ts
const controller = new AbortController()
const response = await fetch('/api/media/lesson/file', {
  credentials: 'include',
  // headers: { Authorization: `Bearer ${token}` },
  signal: controller.signal,
})
if (!response.ok) {
  throw new Error(`Download failed: ${response.status}`)
}
downloadMedia(await response.blob(), 'lesson.mp4')
// Call controller.abort() to cancel pending fetch/body reads.
```

Fetching a Blob buffers the entire file in memory. For large files, prefer a server download endpoint with `Content-Disposition: attachment`. CORS and authentication remain server/application responsibilities. For Blob inputs, the helper removes its temporary anchor immediately and revokes its own object URL after 60 seconds to allow the browser to consume it.

HLS playlists and MSE `blob:` playback URLs are not standalone video files. These helpers do not merge segments, retrieve encryption keys, or create offline HLS archives. Provide a real downloadable file endpoint for streaming content.

## Runnable example

The Playground's **Screenshots & downloads** example saves PNG frames and fetches MP4 files. Copy both files below into the same directory and render `<MediaExportExample />`. The local composable cancels fetches and ignores late encoding/body results on source changes, unmount, or KeepAlive deactivation. It reports HTTP, canvas, and network errors without changing playback state.

::: code-group
<<< ../../playground/src/media-export/MediaExportExample.vue
<<< ../../playground/src/media-export/useMediaExport.ts
:::
