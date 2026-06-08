import { defineComponent } from 'vue'
import { mediaEmits } from './events'
import { mediaProps } from './props'
import { useMediaElement } from './useMediaElement'

export const Video = defineComponent({
  name: 'Video',
  inheritAttrs: false,
  props: mediaProps,
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
