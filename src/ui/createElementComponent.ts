import { defineComponent, h, withDirectives } from 'vue'
import type {
  ComponentObjectPropsOptions,
  Directive,
  DirectiveBinding,
} from 'vue'

export function createElementComponent<
  Props extends ComponentObjectPropsOptions,
>(name: string, tag: string, props: Props) {
  return defineComponent({
    name,
    inheritAttrs: false,
    props,
    setup(values, { attrs, slots }) {
      const defaults = new Map<string, unknown>()
      function syncProperties(
        element: HTMLElement,
        { value, oldValue }: DirectiveBinding<Record<string, unknown>>,
      ) {
        for (const [key, next] of Object.entries(value)) {
          if (!Object.is(next, oldValue?.[key])) {
            Reflect.set(
              element,
              key,
              next === undefined ? defaults.get(key) : next,
            )
          }
        }
      }
      const properties: Directive<HTMLElement, Record<string, unknown>> = {
        created(element) {
          // Capture constructor defaults before Vue applies attributes or props.
          for (const key of Object.keys(props)) {
            defaults.set(key, Reflect.get(element, key))
          }
        },
        beforeMount: syncProperties,
        updated: syncProperties,
      }
      return () =>
        withDirectives(h(tag, attrs, slots['default']?.()), [
          [properties, { ...values }],
        ])
    },
  })
}
