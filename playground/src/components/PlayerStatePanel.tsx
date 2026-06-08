import { usePlayerState } from 'videojs-vue'
import type { PlayerHandle } from 'videojs-vue'
import { computed, defineComponent } from 'vue'
import type { PropType } from 'vue'

export const PlayerStatePanel = defineComponent({
  props: { player: Object as PropType<PlayerHandle | null> },
  setup(props) {
    const target = () => props.player
    const paused = usePlayerState(state => state.paused, target)
    const time = usePlayerState(state => state.currentTime, target)
    const duration = usePlayerState(state => state.duration, target)
    const volume = usePlayerState(state => state.volume, target)
    const muted = usePlayerState(state => state.muted, target)
    const rate = usePlayerState(state => state.playbackRate, target)
    const status = computed(() => {
      if (paused.value === undefined) {
        return 'Not mounted'
      }
      return paused.value ? 'Paused' : 'Playing'
    })
    return () => (
      <section
        class='state-panel'
        aria-label='Player state'
      >
        <h2>Live state</h2>
        <dl>
          {[
            ['Playback', status.value],
            [
              'Position',
              `${(time.value ?? 0).toFixed(1)} / ${(duration.value ?? 0).toFixed(1)} s`,
            ],
            ['Volume', `${Math.round((volume.value ?? 0) * 100)}%`],
            ['Muted', String(muted.value ?? false)],
            ['Speed', `${rate.value ?? 1}x`],
          ].map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    )
  },
})
