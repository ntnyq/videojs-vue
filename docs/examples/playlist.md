---
description: Build a playlist with one player, cancellable source resolution, and continuous playback.
---

# Playlists

The [Playground](https://videojs-vue-playground.ntnyq.dev) includes a **Playlists** example with item selection, Previous / Next, and optional whole-list repeat. It keeps one `VideoPlayerRoot` and replaces only its media element when selecting an item.

This is an application recipe: copy both files below into the same directory and render `<PlaylistExample />`. `usePlaylist` is local example code, not an export from `videojs-vue`. Queue data and URL resolution belong to the application; playback state stays in the upstream player store.

## Behavior

- Items have stable IDs, titles, URLs, and optional posters. Selection starts at the beginning of an item.
- Initial selection and selection while paused stay paused. Selecting while playing preserves playback intent; `ended` advances and attempts to play the next item after metadata loads.
- The last item stops by default. **Repeat playlist** wraps to the first item, including a one-item list. The native media `loop` flag stays disabled so it cannot prevent `ended`.
- A source or media failure stops on the selected item. Retry it or select another item; there is no automatic error-skipping loop.
- Browser playback rejection is shown as an error. The source is not re-fetched automatically; the user can press Play in the media controls.
- A new selection cancels the previous resolver with `AbortController`. A version check also ignores late results when a resolver ignores cancellation. Each media element's callbacks carry its selection version, so old events cannot advance the current queue.
- Unmount and KeepAlive deactivation cancel outstanding work and pause playback. Reactivation reloads the selected item paused. The example does not persist playback position.

## Copy the example

::: code-group
<<< ../../playground/src/playlist/PlaylistExample.vue
<<< ../../playground/src/playlist/usePlaylist.ts
:::

## Resolve signed URLs

Replace `resolveSource` with an application request. Pass the provided signal to `fetch` and validate the response before returning a URL:

```ts
resolveSource: async (item, signal) => {
  const response = await fetch(`/api/media/${encodeURIComponent(item.id)}`, {
    signal,
  })
  if (!response.ok) {
    throw new Error(`Source request failed: ${response.status}`)
  }
  const result: unknown = await response.json()
  if (
    typeof result !== 'object' ||
    result === null ||
    !('src' in result) ||
    typeof result.src !== 'string'
  ) {
    throw new Error('Invalid source response')
  }
  return result.src
}
```

For audio, compose `AudioPlayerRoot`, an audio skin, and keyed `Audio` elements using the same queue logic. For an all-HLS queue, replace `Video` with `HlsVideo` from `videojs-vue/media/hls`. A media playlist here means multiple queue items; an HLS master playlist with quality variants remains one item. List changes, shuffle, persistence, mixed adapters, and automatic error skipping are application policies outside this fixed-list example.
