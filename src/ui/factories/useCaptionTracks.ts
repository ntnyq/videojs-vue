import { computed, shallowRef, watch } from 'vue'
import type { ShallowRef } from 'vue'

export interface CaptionTrackState {
  index: number
  kind: TextTrackKind
  label: string
  language: string
  mode: TextTrackMode
}

function getCaptionTrackList(media: HTMLMediaElement | null): TextTrack[] {
  const synthetic = (media as { __vjsTextTracks?: TextTrack[] } | null)
    // oxlint-disable-next-line no-underscore-dangle
    ?.__vjsTextTracks

  if (Array.isArray(synthetic)) {
    return synthetic.filter(
      track => track.kind === 'captions' || track.kind === 'subtitles',
    )
  }

  const textTracks = media?.textTracks
  if (!textTracks) {
    return []
  }

  return [...textTracks].filter(
    track => track.kind === 'captions' || track.kind === 'subtitles',
  )
}

export function useCaptionTracks(
  media: Readonly<ShallowRef<HTMLMediaElement | null>>,
) {
  const tracks = shallowRef<CaptionTrackState[]>([])

  const enabled = computed(() =>
    tracks.value.some(track => track.mode === 'showing'),
  )

  const selectedIndex = computed(() =>
    tracks.value.findIndex(track => track.mode === 'showing'),
  )

  const refresh = () => {
    const list = getCaptionTrackList(media.value)
    tracks.value = list.map((track, index) => ({
      index,
      kind: track.kind,
      label: track.label,
      language: track.language,
      mode: track.mode,
    }))
  }

  const hideAll = () => {
    const list = getCaptionTrackList(media.value)
    for (const track of list) {
      track.mode = 'hidden'
    }
    refresh()
  }

  const show = (index: number) => {
    const list = getCaptionTrackList(media.value)
    if (list.length === 0) {
      return
    }

    const nextIndex = Math.max(0, Math.min(index, list.length - 1))
    for (const [trackIndex, track] of list.entries()) {
      track.mode = trackIndex === nextIndex ? 'showing' : 'hidden'
    }

    refresh()
  }

  const toggle = () => {
    if (enabled.value) {
      hideAll()
      return
    }

    const index = selectedIndex.value
    show(Math.max(index, 0))
  }

  watch(
    media,
    (node, _, onCleanup) => {
      refresh()

      if (!node) {
        return
      }

      const onChange = () => {
        refresh()
      }

      node.addEventListener('loadedmetadata', onChange)
      node.addEventListener('emptied', onChange)

      const list = node.textTracks as EventTarget | undefined
      if (list?.addEventListener) {
        list.addEventListener('change', onChange)
        list.addEventListener('addtrack', onChange)
        list.addEventListener('removetrack', onChange)
      }

      onCleanup(() => {
        node.removeEventListener('loadedmetadata', onChange)
        node.removeEventListener('emptied', onChange)

        if (list?.removeEventListener) {
          list.removeEventListener('change', onChange)
          list.removeEventListener('addtrack', onChange)
          list.removeEventListener('removetrack', onChange)
        }
      })
    },
    { immediate: true },
  )

  return {
    tracks,
    enabled,
    selectedIndex,
    refresh,
    hideAll,
    show,
    toggle,
  }
}
