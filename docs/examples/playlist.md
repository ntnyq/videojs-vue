---
description: Build a playlist with one player, cancellable source resolution, and continuous playback.
---

# Playlists

The [Playground](https://videojs-vue-playground.ntnyq.dev) includes a **Playlists** example with a thumbnail queue, Previous / Next, shuffle, whole-list repeat, and optional automatic continuation. The queue sits beside the video in wide containers and below it in narrow containers; it can also be collapsed. It keeps one `VideoPlayerRoot` and replaces only its media element when selecting an item.

This is an application recipe: copy all four files below into the same directory and render `<PlaylistExample />`. The UI uses `@lucide/vue` for icons and scoped CSS, with no Tailwind requirement. `usePlaylist` is local example code, not an export from `videojs-vue`. Queue data and URL resolution belong to the application; playback state stays in the upstream player store.

## Behavior

- Items have stable IDs, titles, URLs, optional posters, and optional duration metadata. Duration badges appear when supplied or after that item’s media metadata loads; unknown durations are omitted. Selection starts at the beginning of an item.
- Initial selection and selection while paused stay paused. Selecting while playing preserves playback intent; `ended` shows a five-second next-up countdown, then attempts to play the next item after metadata loads. **Cancel** dismisses that countdown and **Play now** skips the wait. Disable **Auto advance** to stay on the ended item; manual navigation remains available.
- **Shuffle** keeps the selected item first and shuffles the remaining items once. Previous / Next follow that visible order; each entry is visited once before repeat wraps. Disabling shuffle restores the original order without changing the selected item.
- The last item stops by default. **Repeat playlist** wraps to the first item, including a one-item list. The native media `loop` flag stays disabled so it cannot prevent `ended`.
- Selection, queue cancellation, playback resumption, errors, mode changes, and disposal cancel any pending next-up timer. Cancelling a countdown does not disable Auto advance for future items.
- A source or media failure stops on the selected item. Retry it or select another item; there is no automatic error-skipping loop.
- Browser playback rejection is shown as an error. The source is not re-fetched automatically; the user can press Play in the media controls.
- A new selection cancels the previous resolver with `AbortController`. A version check also ignores late results when a resolver ignores cancellation. Each media element's callbacks carry its selection version, so old events cannot advance the current queue.
- Unmount and KeepAlive deactivation cancel outstanding work and pause playback. Reactivation reloads the selected item paused. The example does not persist playback position.

## Copy the example

The example uses `advanceDelay: 5`. The local composable defaults to immediate advancement when this option is omitted, and supports a positive delay in seconds. Queue mode state belongs to this composable; playback time, duration, subtitles and speed remain owned by Video.js. The Default skin retains its built-in subtitle and speed menus. The custom-controls and captions playground examples demonstrate the [independent caption and speed components](../api/ui.md#captions-and-playback-speed).

::: code-group
<<< ../../playground/src/playlist/PlaylistExample.vue
<<< ../../playground/src/playlist/usePlaylist.ts
<<< ../../playground/src/playlist/PlaylistPanel.vue
<<< ../../playground/src/playlist/labels.ts
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

For audio, compose `AudioPlayerRoot`, an audio skin, and keyed `Audio` elements using the same queue logic. For an all-HLS queue, replace `Video` with `HlsVideo` from `videojs-vue/media/hls`. A media playlist here means multiple queue items; an HLS master playlist with quality variants remains one item. Dynamic list changes, persistence, mixed adapters, and automatic error skipping are application policies outside this fixed-list example.
