import { defineComponent } from 'vue'
import { mediaEmits } from '../media/events'
import { commonMediaProps } from '../media/props'
import { useMediaElement } from '../media/useMediaElement'

export const Audio = defineComponent({
  name: 'Audio',
  inheritAttrs: false,
  props: commonMediaProps,
  emits: mediaEmits,
  setup(props, context) {
    return useMediaElement({
      tag: 'audio',
      props,
      context,
      emit: context.emit,
    })
  },
})
