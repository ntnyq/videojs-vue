import { usePlayerState } from 'videojs-vue'
import {
  FullscreenButton,
  Hotkey,
  MediaControls,
  MediaControlsContent,
  MuteButton,
  PiPButton,
  PlayButton,
  SliderBuffer,
  SliderFill,
  SliderThumb,
  SliderTrack,
  StatusAnnouncer,
  Time,
  TimeSlider,
  CaptionsButton,
} from 'videojs-vue/ui'
import { defineComponent } from 'vue'

export const CustomControls = defineComponent({
  setup() {
    const paused = usePlayerState(state => state.paused)
    const muted = usePlayerState(state => state.muted)
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
        <StatusAnnouncer class='sr-only' />
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
        <MediaControls visibility='always'>
          <MediaControlsContent class='custom-controls'>
            <TimeSlider class='timeline'>
              <SliderTrack />
              <SliderBuffer />
              <SliderFill />
              <SliderThumb />
            </TimeSlider>
            <div class='control-row'>
              <PlayButton>{paused.value ? 'Play' : 'Pause'}</PlayButton>
              <Time type='current' />
              <span>/</span>
              <Time type='duration' />
              <span class='control-spacer' />
              <MuteButton>{muted.value ? 'Unmute' : 'Mute'}</MuteButton>
              <CaptionsButton>CC</CaptionsButton>
              <PiPButton>PiP</PiPButton>
              <FullscreenButton>Fullscreen</FullscreenButton>
            </div>
          </MediaControlsContent>
        </MediaControls>
      </>
    )
  },
})
