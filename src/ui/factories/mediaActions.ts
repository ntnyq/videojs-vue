const DEFAULT_VOLUME_STEP = 0.1

export interface PerformMediaActionOptions {
  media: HTMLMediaElement | null
  container: HTMLElement | null
  value?: number | undefined
}

export function performMediaAction(
  action: string,
  options: PerformMediaActionOptions,
) {
  const { media, value } = options

  if (!media) {
    return
  }

  switch (action) {
    case 'togglePaused':
    case 'togglePlay': {
      if (media.paused) {
        media.play()
      } else {
        media.pause()
      }
      return
    }
    case 'toggleMuted': {
      media.muted = !media.muted
      return
    }
    case 'volumeUp': {
      media.volume = Math.min(1, media.volume + (value ?? DEFAULT_VOLUME_STEP))
      return
    }
    case 'volumeDown': {
      media.volume = Math.max(0, media.volume - (value ?? DEFAULT_VOLUME_STEP))
      return
    }
    case 'seekForward': {
      media.currentTime += value ?? 10
      return
    }
    case 'seekBackward': {
      media.currentTime -= value ?? 10
      return
    }
    case 'toggleFullscreen': {
      if (document.fullscreenElement) {
        //
      } else {
        //
      }
      return
    }
    case 'togglePictureInPicture': {
      const video = media as HTMLVideoElement
      if (document.pictureInPictureElement === video) {
        //
      } else {
        //
      }
      break
    }
    default: {
      break
    }
  }
}
