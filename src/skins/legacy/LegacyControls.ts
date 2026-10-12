import { computed, defineComponent, h } from 'vue'
import { usePlayerActions } from '../../composables/usePlayerActions'
import { usePlayerState } from '../../composables/usePlayerState'
import { CaptionsButton } from '../../ui/captions-button'
import { MediaControls } from '../../ui/controls'
import { MediaControlsContent } from '../../ui/controls-content'
import { FullscreenButton } from '../../ui/fullscreen-button'
import { Hotkey } from '../../ui/hotkey'
import { MuteButton } from '../../ui/mute-button'
import { PiPButton } from '../../ui/pip-button'
import { PlayButton } from '../../ui/play-button'
import { SliderBuffer } from '../../ui/slider-buffer'
import { SliderFill } from '../../ui/slider-fill'
import { SliderThumb } from '../../ui/slider-thumb'
import { SliderTrack } from '../../ui/slider-track'
import { StatusAnnouncer } from '../../ui/status-announcer'
import { Time } from '../../ui/time'
import { TimeSlider } from '../../ui/time-slider'
import { VolumeSlider } from '../../ui/volume-slider'

function sliderParts(buffer = false) {
  return [
    h(SliderTrack),
    buffer ? h(SliderBuffer) : null,
    h(SliderFill),
    h(SliderThumb),
  ]
}

/**
 * Reuse upstream accessible controls; native select avoids popover dependencies.
 */
export const LegacyControls = defineComponent({
  name: 'LegacyControls',
  setup() {
    const paused = usePlayerState(state => state.paused)
    const muted = usePlayerState(state => state.muted)
    const rate = usePlayerState(state => state.playbackRate)
    const rates = usePlayerState(state => state.playbackRates)
    const options = computed(() => {
      const values = [...new Set([...(rates.value ?? [1]), rate.value ?? 1])]
      // oxlint-disable-next-line unicorn/no-array-sort -- Chrome 90 has no toSorted; this array is newly allocated.
      return values.sort((a, b) => a - b)
    })
    const actions = usePlayerActions()
    function changeRate(event: Event) {
      if (event.target instanceof HTMLSelectElement) {
        actions.setPlaybackRate(Number(event.target.value))
      }
    }
    return () => [
      h(Hotkey, { keys: 'Space', action: 'togglePaused' }),
      h(Hotkey, { keys: 'k', action: 'togglePaused' }),
      h(Hotkey, { keys: 'ArrowRight', action: 'seekStep', value: 10 }),
      h(Hotkey, { keys: 'ArrowLeft', action: 'seekStep', value: -10 }),
      h(StatusAnnouncer, { class: 'vjs-legacy__sr-only' }),
      h(
        MediaControls,
        { visibility: 'always' },
        {
          default: () =>
            h(
              MediaControlsContent,
              { class: 'vjs-legacy__controls' },
              {
                default: () => [
                  h(
                    TimeSlider,
                    { class: 'vjs-legacy__slider' },
                    { default: () => sliderParts(true) },
                  ),
                  h('div', { class: 'vjs-legacy__row' }, [
                    h(
                      PlayButton,
                      { class: 'vjs-legacy__button' },
                      { default: () => (paused.value === false ? '❚❚' : '▶') },
                    ),
                    h(Time, { type: 'current' }),
                    h('span', { 'aria-hidden': 'true' }, '/'),
                    h(Time, { type: 'duration' }),
                    h('span', { class: 'vjs-legacy__spacer' }),
                    h(
                      MuteButton,
                      { class: 'vjs-legacy__button' },
                      { default: () => (muted.value ? '🔇' : '🔊') },
                    ),
                    h(
                      VolumeSlider,
                      { class: 'vjs-legacy__slider vjs-legacy__volume' },
                      { default: () => sliderParts() },
                    ),
                    h(
                      'select',
                      {
                        class: 'vjs-legacy__rate',
                        'aria-label': 'Playback speed',
                        disabled: rate.value === undefined,
                        value: rate.value ?? 1,
                        onChange: changeRate,
                      },
                      options.value.map(value =>
                        h('option', { value }, `${value}×`),
                      ),
                    ),
                    h(
                      CaptionsButton,
                      { class: 'vjs-legacy__button' },
                      { default: () => 'CC' },
                    ),
                    h(
                      PiPButton,
                      { class: 'vjs-legacy__button vjs-legacy__pip' },
                      { default: () => '▣' },
                    ),
                    h(
                      FullscreenButton,
                      { class: 'vjs-legacy__button' },
                      { default: () => '⛶' },
                    ),
                  ]),
                ],
              },
            ),
        },
      ),
    ]
  },
})
