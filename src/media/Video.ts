import { defineComponent } from 'vue'
import { mediaEmits } from './events'
import { videoMediaProps } from './props'
import { useMediaElement } from './useMediaElement'

export const Video = defineComponent({
  name: 'Video',
  inheritAttrs: false,
  props: videoMediaProps,
  emits: mediaEmits,
  setup(props, context) {
    return useMediaElement({
      tag: 'video',
      props,
      context,
      emit: context.emit,
    })
  },
})
