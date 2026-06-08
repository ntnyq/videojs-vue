import { defineComponent } from 'vue'
import type { PropType } from 'vue'

const HALF_SPEED = 0.5
const ONE_AND_HALF_SPEED = 1.5
const PLAYBACK_RATES = [HALF_SPEED, 1, ONE_AND_HALF_SPEED, 2]

export const PlayerSettings = defineComponent({
  props: {
    skin: { type: String as PropType<'default' | 'neutral'>, required: true },
    volume: { type: Number, required: true },
    muted: Boolean,
    playbackRate: { type: Number, required: true },
    isCustom: Boolean,
  },
  emits: {
    skinChange: (_skin: 'default' | 'neutral') => true,
    volumeChange: (_volume: number) => true,
    mutedChange: (_muted: boolean) => true,
    rateChange: (_rate: number) => true,
  },
  setup(props, { emit }) {
    return () => (
      <section class='settings'>
        <h2>Try the API</h2>
        <label>
          Skin
          <select
            disabled={props.isCustom}
            value={props.skin}
            onChange={event => {
              const skin = (event.target as HTMLSelectElement).value
              if (skin === 'default' || skin === 'neutral') {
                emit('skinChange', skin)
              }
            }}
          >
            <option value='default'>Default</option>
            <option value='neutral'>Neutral</option>
          </select>
        </label>
        <label for='volume-setting'>
          Volume <output>{Math.round(props.volume * 100)}%</output>
        </label>
        <input
          id='volume-setting'
          type='range'
          min='0'
          max='1'
          step='0.05'
          value={props.volume}
          onInput={event =>
            emit(
              'volumeChange',
              Number((event.target as HTMLInputElement).value),
            )
          }
        />
        <label class='checkbox'>
          <input
            type='checkbox'
            checked={props.muted}
            onChange={event =>
              emit('mutedChange', (event.target as HTMLInputElement).checked)
            }
          />
          Muted
        </label>
        <label>
          Playback speed
          <select
            value={props.playbackRate}
            onChange={event =>
              emit(
                'rateChange',
                Number((event.target as HTMLSelectElement).value),
              )
            }
          >
            {PLAYBACK_RATES.map(rate => (
              <option value={rate}>{rate}x</option>
            ))}
          </select>
        </label>
      </section>
    )
  },
})
