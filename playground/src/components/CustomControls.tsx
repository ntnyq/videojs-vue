import {
  Maximize,
  Pause,
  PictureInPicture2,
  Play,
  Volume2,
  VolumeX,
} from '@lucide/vue'
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
import PlayerMenus from './PlayerMenus.vue'

export const CustomControls = defineComponent({
  setup() {
    const { t: translate } = useI18n()
    const paused = useVideoPlayerState(state => state.paused)
    const muted = useVideoPlayerState(state => state.muted)
    const buttonClass =
      'inline-flex [&[hidden]]:hidden size-11 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white'
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
          <MediaControlsContent class='absolute inset-x-2 bottom-2 flex items-center gap-0.5 rounded-full border border-white/15 bg-[#202326]/85 px-1 text-white shadow-lg backdrop-blur-xl sm:inset-x-4 sm:bottom-4 sm:px-2'>
            <PlayButton
              class={buttonClass}
              aria-label={translate(
                paused.value ? 'player.play' : 'player.pause',
              )}
            >
              {paused.value ? (
                <Play
                  size={20}
                  aria-hidden='true'
                />
              ) : (
                <Pause
                  size={20}
                  aria-hidden='true'
                />
              )}
            </PlayButton>
            <MuteButton
              class={`${buttonClass} @max-sm:hidden`}
              aria-label={translate(
                muted.value ? 'player.unmute' : 'player.mute',
              )}
            >
              {muted.value ? (
                <VolumeX
                  size={20}
                  aria-hidden='true'
                />
              ) : (
                <Volume2
                  size={20}
                  aria-hidden='true'
                />
              )}
            </MuteButton>
            <Time
              type='current'
              class='hidden text-xs tabular-nums @sm:block'
            />
            <TimeSlider class='relative mx-2 flex h-11 min-w-6 flex-1 cursor-pointer items-center'>
              <SliderTrack class='absolute left-0 h-1 w-full rounded bg-white/25' />
              <SliderBuffer class='absolute left-0 h-1 w-[var(--media-slider-buffer)] rounded bg-white/40' />
              <SliderFill class='absolute left-0 h-1 w-[var(--media-slider-fill)] rounded bg-white' />
              <SliderThumb class='absolute left-[var(--media-slider-fill)] size-3 -translate-x-1/2 rounded-full bg-white' />
            </TimeSlider>
            <Time
              type='duration'
              class='hidden pr-1 text-xs tabular-nums @sm:block'
            />
            <PlayerMenus />
            <PiPButton
              class={`${buttonClass} @max-sm:hidden`}
              aria-label={translate('player.pip')}
            >
              <PictureInPicture2
                size={18}
                aria-hidden='true'
              />
            </PiPButton>
            <FullscreenButton
              class={buttonClass}
              aria-label={translate('player.fullscreen')}
            >
              <Maximize
                size={18}
                aria-hidden='true'
              />
            </FullscreenButton>
          </MediaControlsContent>
        </MediaControls>
      </>
    )
  },
})
