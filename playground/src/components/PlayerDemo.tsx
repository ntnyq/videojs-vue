import { PlayerRoot, Video, VideoPlayer, usePlayerActions } from 'videojs-vue'
import type { PlayerHandle } from 'videojs-vue'
import { HlsVideo } from 'videojs-vue/media/hls'
import { MediaContainer } from 'videojs-vue/ui'
import { defineComponent, shallowRef } from 'vue'
import { HLS_SOURCE, MP4_SOURCE, POSTER, TRACKS } from '../data'
import type { DemoMode } from '../data'
import { CustomControls } from './CustomControls'
import { PlayerSettings } from './PlayerSettings'
import { PlayerStatePanel } from './PlayerStatePanel'

const DEFAULT_VOLUME = 0.7
const EVENT_HISTORY_LIMIT = 6
const MODE_LABELS = {
  mp4: 'Native video',
  hls: 'HLS stream',
  custom: 'Custom controls',
}

export const PlayerDemo = defineComponent({
  setup() {
    const mode = shallowRef<DemoMode>('mp4')
    const player = shallowRef<PlayerHandle | null>(null)
    const skin = shallowRef<'default' | 'neutral'>('default')
    const volume = shallowRef(DEFAULT_VOLUME)
    const muted = shallowRef(false)
    const playbackRate = shallowRef(1)
    const isMounted = shallowRef(true)
    const source = shallowRef(MP4_SOURCE)
    const events = shallowRef<string[]>([])
    const failure = shallowRef('')
    const actions = usePlayerActions(player)
    function record(name: string) {
      events.value = [name, ...events.value].slice(0, EVENT_HISTORY_LIMIT)
    }
    function selectMode(next: DemoMode) {
      mode.value = next
      source.value = next === 'hls' ? HLS_SOURCE : MP4_SOURCE
      failure.value = ''
    }
    async function run(action: () => Promise<unknown>) {
      try {
        failure.value = ''
        await action()
      } catch (error) {
        failure.value = error instanceof Error ? error.message : String(error)
      }
    }
    const listeners = {
      onReady: () => record('ready'),
      onPlay: () => record('play'),
      onPause: () => record('pause'),
      onLoadedmetadata: () => record('loadedmetadata'),
      onEnded: () => record('ended'),
      onError: () => {
        failure.value =
          player.value?.media?.error?.message ??
          'Media failed to load. Check the source URL and try again.'
        record('error')
      },
      'onUpdate:volume': (value: number) => {
        volume.value = value
      },
      'onUpdate:muted': (value: boolean) => {
        muted.value = value
      },
      'onUpdate:playbackRate': (value: number) => {
        playbackRate.value = value
      },
    }
    function renderPlayer() {
      if (!isMounted.value) {
        return (
          <div class='empty-stage'>
            <p>Player unmounted.</p>
            <button
              onClick={() => {
                isMounted.value = true
              }}
            >
              Mount player
            </button>
          </div>
        )
      }
      if (mode.value === 'custom') {
        return (
          <PlayerRoot
            ref={player}
            title='Custom player'
            poster={POSTER}
            {...listeners}
          >
            <MediaContainer class='custom-surface'>
              <Video
                src={source.value}
                poster={POSTER}
                tracks={TRACKS}
                crossorigin='anonymous'
                volume={volume.value}
                muted={muted.value}
                playbackRate={playbackRate.value}
              />
              <div class='course-overlay'>
                Your Vue overlay stays in fullscreen.
              </div>
              <CustomControls />
            </MediaContainer>
          </PlayerRoot>
        )
      }
      return (
        <VideoPlayer
          ref={player}
          media={mode.value === 'hls' ? HlsVideo : Video}
          src={source.value}
          poster={POSTER}
          title='Video.js demo'
          skin={skin.value}
          tracks={TRACKS}
          crossorigin='anonymous'
          volume={volume.value}
          muted={muted.value}
          playbackRate={playbackRate.value}
          {...listeners}
        />
      )
    }
    return () => (
      <section class='demo'>
        <div
          class='mode-switch'
          role='group'
          aria-label='Player example'
        >
          {(['mp4', 'hls', 'custom'] as const).map(value => (
            <button
              aria-pressed={mode.value === value}
              onClick={() => selectMode(value)}
            >
              {MODE_LABELS[value]}
            </button>
          ))}
        </div>
        <div class='demo-grid'>
          <div class='stage-column'>
            <div class='stage'>{renderPlayer()}</div>
            <div class='demo-actions'>
              <button
                disabled={!player.value?.store}
                onClick={() => run(actions.play)}
              >
                Play
              </button>
              <button
                disabled={!player.value?.store}
                onClick={() => actions.pause()}
              >
                Pause
              </button>
              <button
                disabled={!player.value?.store}
                onClick={() => run(() => actions.seek(10))}
              >
                Seek to 10s
              </button>
              <button
                onClick={() => {
                  isMounted.value = !isMounted.value
                }}
              >
                {isMounted.value ? 'Unmount' : 'Mount'}
              </button>
            </div>
            {failure.value && (
              <p
                class='error'
                role='alert'
              >
                {failure.value}
              </p>
            )}
            <label class='source-field'>
              Source URL
              <input
                type='url'
                value={source.value}
                onChange={event => {
                  source.value = (event.target as HTMLInputElement).value
                }}
              />
            </label>
            <section class='event-panel'>
              <h2>Media events</h2>
              <p aria-live='polite'>
                {events.value.length > 0
                  ? events.value.join(' / ')
                  : 'Mount the player to start.'}
              </p>
            </section>
          </div>
          <aside>
            <PlayerSettings
              skin={skin.value}
              volume={volume.value}
              muted={muted.value}
              playbackRate={playbackRate.value}
              isCustom={mode.value === 'custom'}
              onSkinChange={value => {
                skin.value = value
              }}
              onVolumeChange={value => {
                volume.value = value
              }}
              onMutedChange={value => {
                muted.value = value
              }}
              onRateChange={value => {
                playbackRate.value = value
              }}
            />
            <PlayerStatePanel player={player.value} />
          </aside>
        </div>
      </section>
    )
  },
})
