import type { VideoMediaProps } from 'videojs-vue'

export interface UiRecipeProps {
  /** Media settings supplied by the playground inspector. */
  settings?: Partial<VideoMediaProps>
  /** Metadata displayed by the title example. */
  title?: string
}
