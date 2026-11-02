import { defineComponent, mergeProps } from 'vue'
import type { PropType } from 'vue'
import type { Playground } from '../composables/usePlayground'
import UiComponentsExample from '../ui-components/UiComponentsExample.vue'

export const UiComponentsDemo = defineComponent({
  inheritAttrs: false,
  props: { lab: { type: Object as PropType<Playground>, required: true } },
  setup(props, { attrs }) {
    return () => (
      <UiComponentsExample
        settings={props.lab.mediaProps}
        title={props.lab.config.title}
        {...mergeProps(attrs, {
          onLoadedmetadata: () => {
            props.lab.failure = ''
          },
        })}
        onSelectRecipe={() => {
          props.lab.setPlayer(null)
          props.lab.failure = ''
        }}
        onInteraction={event =>
          props.lab.log.record('event', event.name, {
            component: event.component,
            detail: event.detail,
          })
        }
      />
    )
  },
})
