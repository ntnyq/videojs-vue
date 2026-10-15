import { HlsVideo } from 'videojs-vue/media/hls'
import { VideoPlayer } from 'videojs-vue/video/legacy'
import { defineComponent, h, shallowRef } from 'vue'
import { HLS_SOURCE, MP4_SOURCE } from '../data'

export const LegacyPreview = defineComponent({
  name: 'LegacyPreview',
  setup() {
    const query = new URLSearchParams(globalThis.location.search)
    const isHls = shallowRef(query.get('source') === 'hls')
    const isCompact = shallowRef(query.get('width') === 'compact')
    const status = shallowRef('Loading…')
    const hasError = shallowRef(false)
    const generation = shallowRef(0)

    function updateUrl() {
      const url = new URL(globalThis.location.href)
      url.searchParams.set('source', isHls.value ? 'hls' : 'mp4')
      url.searchParams.set('width', isCompact.value ? 'compact' : 'fluid')
      globalThis.history.replaceState(null, '', url)
    }

    function selectSource(hls: boolean) {
      if (isHls.value === hls) {
        return
      }
      status.value = 'Loading…'
      hasError.value = false
      isHls.value = hls
      updateUrl()
    }

    function selectWidth(compact: boolean) {
      isCompact.value = compact
      updateUrl()
    }

    function updateStatus(value: string) {
      if (!hasError.value) {
        status.value = value
      }
    }

    return () => {
      const sourceSelector = h('div', { class: 'legacy-demo__setting' }, [
        h('span', { id: 'source-label' }, 'Media source'),
        h(
          'div',
          {
            class: 'legacy-demo__segments',
            role: 'group',
            'aria-labelledby': 'source-label',
          },
          [
            h(
              'button',
              {
                type: 'button',
                'aria-pressed': !isHls.value,
                onClick: () => selectSource(false),
              },
              'MP4',
            ),
            h(
              'button',
              {
                type: 'button',
                'aria-pressed': isHls.value,
                onClick: () => selectSource(true),
              },
              'HLS',
            ),
          ],
        ),
      ])
      const widthSelector = h('div', { class: 'legacy-demo__setting' }, [
        h('span', { id: 'width-label' }, 'Player width'),
        h(
          'div',
          {
            class: 'legacy-demo__segments',
            role: 'group',
            'aria-labelledby': 'width-label',
          },
          [
            h(
              'button',
              {
                type: 'button',
                'aria-pressed': !isCompact.value,
                onClick: () => selectWidth(false),
              },
              'Fluid',
            ),
            h(
              'button',
              {
                type: 'button',
                'aria-pressed': isCompact.value,
                onClick: () => selectWidth(true),
              },
              'Compact',
            ),
          ],
        ),
      ])
      const player = h(
        'div',
        {
          class: [
            'legacy-demo__player',
            { 'legacy-demo__player--compact': isCompact.value },
          ],
        },
        [
          h(VideoPlayer, {
            key: `${isHls.value}-${generation.value}`,
            media: isHls.value ? HlsVideo : undefined,
            src: isHls.value ? HLS_SOURCE : MP4_SOURCE,
            title: 'Video.js demo',
            crossorigin: 'anonymous',
            tracks: [
              {
                src: '/captions.vtt',
                kind: 'captions',
                srclang: 'en',
                label: 'English',
              },
            ],
            onLoadstart: () => updateStatus('Loading…'),
            onLoadedmetadata: () => updateStatus('Ready to play'),
            onPlaying: () => updateStatus('Playing'),
            onPause: () => updateStatus('Paused'),
            onWaiting: () => updateStatus('Buffering…'),
            onEnded: () => updateStatus('Playback ended'),
            onError: () => {
              hasError.value = true
              status.value = 'Unable to load video'
            },
          }),
        ],
      )
      const statusBar = h('div', { class: 'legacy-demo__statusbar' }, [
        h(
          'span',
          {
            class: 'legacy-demo__status',
            role: 'status',
            'data-error': hasError.value || undefined,
          },
          [
            h('span', {
              class: 'legacy-demo__status-dot',
              'aria-hidden': 'true',
            }),
            status.value,
          ],
        ),
        h(
          'span',
          { class: 'legacy-demo__source-detail' },
          isHls.value ? 'HLS adaptive stream' : 'MP4 video',
        ),
      ])
      const error = hasError.value
        ? h('div', { class: 'legacy-demo__error' }, [
            h(
              'p',
              'Check your connection and retry, or choose another media source.',
            ),
            h(
              'button',
              {
                type: 'button',
                onClick: () => {
                  hasError.value = false
                  status.value = 'Loading…'
                  generation.value++
                },
              },
              'Retry video',
            ),
          ])
        : null
      return h(
        'section',
        { class: 'legacy-demo__workspace', 'aria-label': 'Player preview' },
        [
          h('div', { class: 'legacy-demo__toolbar' }, [
            sourceSelector,
            widthSelector,
          ]),
          h('div', { class: 'legacy-demo__stage' }, [player]),
          statusBar,
          error,
        ],
      )
    }
  },
})
