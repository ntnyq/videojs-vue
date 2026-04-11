import { createPlayer, useMedia } from 'videojs-vue'
import { Audio, audioFeatures } from 'videojs-vue/audio'
import { BackgroundVideo, backgroundFeatures } from 'videojs-vue/background'
import { Video, videoFeatures } from 'videojs-vue/video'
import { computed, defineComponent } from 'vue'
import type { PropType } from 'vue'
import type { DemoSettings } from '../data'

function formatTime(value: number) {
  if (!Number.isFinite(value)) {
    return '0:00'
  }

  const minutes = Math.floor(value / 60)
  const seconds = Math.floor(value % 60)
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

const VideoPlayer = createPlayer({
  displayName: 'PlaygroundVideoPlayer',
  features: videoFeatures,
})

const AudioPlayer = createPlayer({
  displayName: 'PlaygroundAudioPlayer',
  features: audioFeatures,
})

const BackgroundPlayer = createPlayer({
  displayName: 'PlaygroundBackgroundPlayer',
  features: backgroundFeatures,
})

const StateCard = defineComponent({
  name: 'StateCard',
  props: {
    label: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    return () => (
      <div class='rounded-[18px] border border-slate-200/80 bg-white/88 p-4 shadow-[0_16px_35px_rgba(15,23,42,0.08)]'>
        <p class='mb-2 text-[10px] font-700 uppercase tracking-[0.24em] text-slate-400'>
          {props.label}
        </p>
        <p class='font-display text-[22px] text-slate-950'>{props.value}</p>
      </div>
    )
  },
})

const VideoTransportPanel = defineComponent({
  name: 'VideoTransportPanel',
  setup() {
    const paused = VideoPlayer.usePlayer(state => String(state.paused))
    const currentTime = VideoPlayer.usePlayer(state =>
      Number(state.currentTime ?? 0),
    )
    const duration = VideoPlayer.usePlayer(state => Number(state.duration ?? 0))
    const muted = VideoPlayer.usePlayer(state => String(state.muted))
    const volume = VideoPlayer.usePlayer(state => Number(state.volume ?? 1))
    const media = useMedia()
    const themeClass = 'from-amber-100/90 via-white to-rose-100/70'

    const pausedText = computed<string>(() => paused['value'])
    const timeText = computed(
      () =>
        `${formatTime(currentTime['value'])} / ${formatTime(duration['value'])}`,
    )
    const mutedText = computed<string>(() => muted['value'])
    const volumeText = computed(() => `${Math.round(volume['value'] * 100)}%`)
    const durationMax = computed(() =>
      duration['value'] > 0 ? duration['value'] : 1,
    )
    const scrubValue = computed(() =>
      Math.min(currentTime['value'], duration['value'] || 1),
    )

    return () => (
      <div
        class={['grid gap-4 rounded-[26px] bg-gradient-to-br p-5', themeClass]}
      >
        <div class='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <p class='mb-2 text-[10px] font-700 uppercase tracking-[0.28em] text-slate-400'>
              Runtime
            </p>
            <h3 class='font-display text-[24px] text-slate-950'>
              Live player state
            </h3>
          </div>
          <div class='flex flex-wrap gap-2'>
            <button
              type='button'
              class='rounded-full bg-slate-950 px-4 py-2 text-[12px] font-700 uppercase tracking-[0.18em] text-white'
              onClick={() => media.value?.play()}
            >
              Play
            </button>
            <button
              type='button'
              class='rounded-full border border-slate-300 bg-white px-4 py-2 text-[12px] font-700 uppercase tracking-[0.18em] text-slate-700'
              onClick={() => media.value?.pause()}
            >
              Pause
            </button>
            <button
              type='button'
              class='rounded-full border border-slate-300 bg-white px-4 py-2 text-[12px] font-700 uppercase tracking-[0.18em] text-slate-700'
              onClick={() => {
                if (!media.value) {
                  return
                }

                media.value.currentTime = 0
                media.value.play()
              }}
            >
              Restart
            </button>
          </div>
        </div>

        <div class='grid gap-3 md:grid-cols-4'>
          <StateCard
            label='Paused'
            value={pausedText.value}
          />
          <StateCard
            label='Time'
            value={timeText.value}
          />
          <StateCard
            label='Muted'
            value={mutedText.value}
          />
          <StateCard
            label='Volume'
            value={volumeText.value}
          />
        </div>

        <label class='grid gap-2 rounded-[18px] border border-slate-200/80 bg-white/86 px-4 py-3'>
          <span class='text-[11px] font-700 uppercase tracking-[0.24em] text-slate-400'>
            Scrub Position
          </span>
          <input
            class='accent-slate-950'
            type='range'
            min='0'
            max={durationMax.value}
            step='0.1'
            value={scrubValue.value}
            onInput={event => {
              if (!media.value) {
                return
              }

              media.value.currentTime = Number(
                (event.target as HTMLInputElement).value,
              )
            }}
          />
        </label>
      </div>
    )
  },
})

const AudioTransportPanel = defineComponent({
  name: 'AudioTransportPanel',
  setup() {
    const paused = AudioPlayer.usePlayer(state => String(state.paused))
    const currentTime = AudioPlayer.usePlayer(state =>
      Number(state.currentTime ?? 0),
    )
    const duration = AudioPlayer.usePlayer(state => Number(state.duration ?? 0))
    const muted = AudioPlayer.usePlayer(state => String(state.muted))
    const volume = AudioPlayer.usePlayer(state => Number(state.volume ?? 1))
    const media = useMedia()
    const themeClass = 'from-sky-100/90 via-white to-emerald-100/70'

    const pausedText = computed<string>(() => paused['value'])
    const timeText = computed(
      () =>
        `${formatTime(currentTime['value'])} / ${formatTime(duration['value'])}`,
    )
    const mutedText = computed<string>(() => muted['value'])
    const volumeText = computed(() => `${Math.round(volume['value'] * 100)}%`)
    const durationMax = computed(() =>
      duration['value'] > 0 ? duration['value'] : 1,
    )
    const scrubValue = computed(() =>
      Math.min(currentTime['value'], duration['value'] || 1),
    )

    return () => (
      <div
        class={['grid gap-4 rounded-[26px] bg-gradient-to-br p-5', themeClass]}
      >
        <div class='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <p class='mb-2 text-[10px] font-700 uppercase tracking-[0.28em] text-slate-400'>
              Runtime
            </p>
            <h3 class='font-display text-[24px] text-slate-950'>
              Live player state
            </h3>
          </div>
          <div class='flex flex-wrap gap-2'>
            <button
              type='button'
              class='rounded-full bg-slate-950 px-4 py-2 text-[12px] font-700 uppercase tracking-[0.18em] text-white'
              onClick={() => media.value?.play()}
            >
              Play
            </button>
            <button
              type='button'
              class='rounded-full border border-slate-300 bg-white px-4 py-2 text-[12px] font-700 uppercase tracking-[0.18em] text-slate-700'
              onClick={() => media.value?.pause()}
            >
              Pause
            </button>
            <button
              type='button'
              class='rounded-full border border-slate-300 bg-white px-4 py-2 text-[12px] font-700 uppercase tracking-[0.18em] text-slate-700'
              onClick={() => {
                if (!media.value) {
                  return
                }

                media.value.currentTime = 0
                media.value.play()
              }}
            >
              Restart
            </button>
          </div>
        </div>

        <div class='grid gap-3 md:grid-cols-4'>
          <StateCard
            label='Paused'
            value={pausedText.value}
          />
          <StateCard
            label='Time'
            value={timeText.value}
          />
          <StateCard
            label='Muted'
            value={mutedText.value}
          />
          <StateCard
            label='Volume'
            value={volumeText.value}
          />
        </div>

        <label class='grid gap-2 rounded-[18px] border border-slate-200/80 bg-white/86 px-4 py-3'>
          <span class='text-[11px] font-700 uppercase tracking-[0.24em] text-slate-400'>
            Scrub Position
          </span>
          <input
            class='accent-slate-950'
            type='range'
            min='0'
            max={durationMax.value}
            step='0.1'
            value={scrubValue.value}
            onInput={event => {
              if (!media.value) {
                return
              }

              media.value.currentTime = Number(
                (event.target as HTMLInputElement).value,
              )
            }}
          />
        </label>
      </div>
    )
  },
})

const BackgroundPanel = defineComponent({
  name: 'BackgroundPanel',
  setup() {
    const media = useMedia()
    const readyState = computed(() => String(media.value?.readyState ?? 0))
    const muted = computed(() => String(media.value?.muted ?? false))
    const presentation = computed(
      () => media.value?.tagName?.toLowerCase() ?? 'video',
    )

    return () => (
      <div class='grid gap-4 rounded-[26px] bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-5 text-white'>
        <div class='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <p class='mb-2 text-[10px] font-700 uppercase tracking-[0.28em] text-white/45'>
              Background Mode
            </p>
            <h3 class='font-display text-[24px]'>Ambient surface preview</h3>
          </div>
          <button
            type='button'
            class='rounded-full border border-white/15 bg-white/8 px-4 py-2 text-[12px] font-700 uppercase tracking-[0.18em]'
            onClick={() => {
              const node = media.value
              if (!node) {
                return
              }

              if (node.paused) {
                node.play()
                return
              }

              node.pause()
            }}
          >
            Toggle Playback
          </button>
        </div>

        <div class='grid gap-3 md:grid-cols-3'>
          <StateCard
            label='Ready State'
            value={readyState.value}
          />
          <StateCard
            label='Muted'
            value={muted.value}
          />
          <StateCard
            label='Presentation'
            value={presentation.value}
          />
        </div>
      </div>
    )
  },
})

export const DemoStage = defineComponent({
  name: 'DemoStage',
  props: {
    settings: {
      type: Object as PropType<DemoSettings>,
      required: true,
    },
  },
  setup(props) {
    const frameStyle = computed(() => ({
      width: `min(100%, ${props.settings.width}px)`,
      aspectRatio:
        props.settings.mode === 'audio'
          ? undefined
          : props.settings.aspectRatio,
    }))

    const previewLabel = computed(() => {
      if (props.settings.mode === 'audio') {
        return 'Audio transport'
      }

      if (props.settings.mode === 'background') {
        return 'Background loop'
      }

      return 'Video preview'
    })

    return () => (
      <section class='grid gap-5'>
        <div class='flex flex-wrap items-end justify-between gap-4'>
          <div>
            <p class='mb-2 text-[10px] font-700 uppercase tracking-[0.35em] text-slate-400'>
              Playground Output
            </p>
            <h2 class='font-display text-[34px] leading-none text-slate-950'>
              {previewLabel.value}
            </h2>
          </div>
          <div class='max-w-[320px] text-[13px] leading-6 text-slate-500'>
            This stage renders the same `createPlayer()` API you ship from the
            package, with mode-specific settings wired to reactive controls.
          </div>
        </div>

        <div class='grid gap-5 rounded-[36px] border border-white/60 bg-white/72 p-4 shadow-[0_40px_110px_rgba(15,23,42,0.14)] backdrop-blur-xl md:p-6'>
          {props.settings.mode === 'video' && (
            <VideoPlayer.Provider>
              <div class='grid gap-5'>
                <VideoPlayer.Container
                  class='overflow-hidden rounded-[28px] bg-slate-950 shadow-[0_30px_100px_rgba(15,23,42,0.35)]'
                  style={frameStyle.value}
                >
                  <Video
                    class='h-full w-full object-cover'
                    src={props.settings.videoSource}
                    autoplay={props.settings.autoplay}
                    controls={props.settings.controls}
                    loop={props.settings.loop}
                    muted={props.settings.muted}
                    playsinline={props.settings.playsInline}
                    preload='metadata'
                  />
                </VideoPlayer.Container>

                <VideoTransportPanel />
              </div>
            </VideoPlayer.Provider>
          )}

          {props.settings.mode === 'audio' && (
            <AudioPlayer.Provider>
              <div class='grid gap-5'>
                <AudioPlayer.Container class='rounded-[28px] border border-slate-200 bg-linear-to-br from-white via-slate-50 to-sky-50 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.1)]'>
                  <div class='grid gap-4'>
                    <div class='flex items-center justify-between gap-4'>
                      <div>
                        <p class='mb-2 text-[10px] font-700 uppercase tracking-[0.28em] text-slate-400'>
                          Audio Demo
                        </p>
                        <h3 class='font-display text-[26px] text-slate-950'>
                          Native audio element
                        </h3>
                      </div>
                      <div class='rounded-full bg-slate-950 px-3 py-1 text-[11px] font-700 uppercase tracking-[0.18em] text-white'>
                        {Math.round(props.settings.width)}px stage
                      </div>
                    </div>
                    <Audio
                      class='w-full'
                      src={props.settings.audioSource}
                      autoplay={props.settings.autoplay}
                      controls={props.settings.controls}
                      loop={props.settings.loop}
                      muted={props.settings.muted}
                      preload='metadata'
                    />
                  </div>
                </AudioPlayer.Container>

                <AudioTransportPanel />
              </div>
            </AudioPlayer.Provider>
          )}

          {props.settings.mode === 'background' && (
            <BackgroundPlayer.Provider>
              <div class='grid gap-5'>
                <BackgroundPlayer.Container
                  class='group relative overflow-hidden rounded-[30px] bg-slate-950 shadow-[0_30px_100px_rgba(15,23,42,0.38)]'
                  style={frameStyle.value}
                >
                  <BackgroundVideo
                    class='h-full w-full object-cover transition duration-700 group-hover:scale-103'
                    src={props.settings.backgroundSource}
                    autoplay={props.settings.autoplay}
                    loop={props.settings.loop}
                    muted={props.settings.muted}
                    playsinline={props.settings.playsInline}
                    preload='metadata'
                  />
                  <div class='pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950/78 via-slate-950/18 to-transparent' />
                  <div class='absolute bottom-0 left-0 right-0 grid gap-2 p-6 text-white'>
                    <p class='text-[10px] font-700 uppercase tracking-[0.34em] text-white/50'>
                      Background preset
                    </p>
                    <h3 class='font-display text-[32px] leading-none'>
                      Visual ambience without chrome
                    </h3>
                    <p class='max-w-[36rem] text-[14px] leading-6 text-white/68'>
                      Useful for hero sections, immersive backdrops, or
                      motion-led brand moments where you want motion but not
                      player controls.
                    </p>
                  </div>
                </BackgroundPlayer.Container>

                <BackgroundPanel />
              </div>
            </BackgroundPlayer.Provider>
          )}
        </div>
      </section>
    )
  },
})
