import { computed, defineComponent, h } from 'vue'
import { usePlayerActions } from '../../composables/usePlayerActions'
import { usePlayerState } from '../../composables/usePlayerState'
import { CaptionsButton } from '../../ui/CaptionsButton'
import { FullscreenButton } from '../../ui/FullscreenButton'
import { Hotkey } from '../../ui/Hotkey'
import { MediaControls } from '../../ui/MediaControls'
import { MediaControlsContent } from '../../ui/MediaControlsContent'
import { MuteButton } from '../../ui/MuteButton'
import { PiPButton } from '../../ui/PiPButton'
import { PlayButton } from '../../ui/PlayButton'
import { SliderBuffer } from '../../ui/SliderBuffer'
import { SliderFill } from '../../ui/SliderFill'
import { SliderThumb } from '../../ui/SliderThumb'
import { SliderTrack } from '../../ui/SliderTrack'
import { StatusAnnouncer } from '../../ui/StatusAnnouncer'
import { Time } from '../../ui/Time'
import { TimeSlider } from '../../ui/TimeSlider'
import { VolumeSlider } from '../../ui/VolumeSlider'

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
