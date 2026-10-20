import { CaptionsButton } from 'videojs-vue/ui/captions-button'
import { MediaControls } from 'videojs-vue/ui/controls'
import { MediaControlsContent } from 'videojs-vue/ui/controls-content'
import { FullscreenButton } from 'videojs-vue/ui/fullscreen-button'
import { Hotkey } from 'videojs-vue/ui/hotkey'
import { MuteButton } from 'videojs-vue/ui/mute-button'
import { PiPButton } from 'videojs-vue/ui/pip-button'
import { PlayButton } from 'videojs-vue/ui/play-button'
import { SliderBuffer } from 'videojs-vue/ui/slider-buffer'
import { SliderFill } from 'videojs-vue/ui/slider-fill'
import { SliderThumb } from 'videojs-vue/ui/slider-thumb'
import { SliderTrack } from 'videojs-vue/ui/slider-track'
import { StatusAnnouncer } from 'videojs-vue/ui/status-announcer'
import { Time } from 'videojs-vue/ui/time'
import { TimeSlider } from 'videojs-vue/ui/time-slider'
import { useVideoPlayerState } from 'videojs-vue/video/composables'
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

export const CustomControls = defineComponent({
  setup() {
    const { t: translate } = useI18n()
    const paused = useVideoPlayerState(state => state.paused)
    const muted = useVideoPlayerState(state => state.muted)
    const buttonClass =
      'cursor-pointer rounded px-2 py-2 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white'
    return () => (
      <>
        <Hotkey
          keys='Space'
          action='togglePaused'
        />
        <Hotkey
          keys='k'
          action='togglePaused'
        />
        <Hotkey
          keys='ArrowRight'
          action='seekStep'
          value={10}
        />
        <Hotkey
          keys='ArrowLeft'
          action='seekStep'
          value={-10}
        />
        <StatusAnnouncer class='sr-only' />
        <MediaControls visibility='always'>
          <MediaControlsContent class='absolute inset-x-0 bottom-0 block bg-black/80 px-3 py-2 text-white'>
            <TimeSlider class='relative flex h-6 cursor-pointer items-center'>
              <SliderTrack class='absolute left-0 h-1 w-full rounded bg-white/30' />
              <SliderBuffer class='absolute left-0 h-1 w-[var(--media-slider-buffer)] rounded bg-white/50' />
              <SliderFill class='absolute left-0 h-1 w-[var(--media-slider-fill)] rounded bg-white' />
              <SliderThumb class='absolute left-[var(--media-slider-fill)] size-3 -translate-x-1/2 rounded-full bg-white' />
            </TimeSlider>
            <div class='flex flex-wrap items-center gap-1 text-xs'>
              <PlayButton class={buttonClass}>
                {translate(paused.value ? 'player.play' : 'player.pause')}
              </PlayButton>
              <Time type='current' />
              <span>/</span>
              <Time type='duration' />
              <span class='flex-1' />
              <MuteButton class={buttonClass}>
                {translate(muted.value ? 'player.unmute' : 'player.mute')}
              </MuteButton>
              <CaptionsButton
                class={buttonClass}
                aria-label={translate('player.captions')}
              >
                CC
              </CaptionsButton>
              <PiPButton class={buttonClass}>
                {translate('player.pip')}
              </PiPButton>
              <FullscreenButton class={buttonClass}>
                {translate('player.fullscreen')}
              </FullscreenButton>
            </div>
          </MediaControlsContent>
        </MediaControls>
      </>
    )
  },
})
