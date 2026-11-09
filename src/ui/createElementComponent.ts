import { defineComponent, h, withDirectives } from 'vue'
import type {
  ComponentObjectPropsOptions,
  Directive,
  DirectiveBinding,
} from 'vue'
import { preservePlayerTree } from '../player/preservePlayerTree'

function toAttributeName(property: string) {
  return property.replaceAll(/[A-Z]/gu, letter => `-${letter.toLowerCase()}`)
}

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
          // Hydrated elements may already have applied their server attributes.
          const source = Object.keys(props).some(key =>
            element.hasAttribute(toAttributeName(key)),
          )
            ? element.ownerDocument.createElement(tag)
            : element
          for (const key of Object.keys(props)) {
            defaults.set(key, Reflect.get(source, key))
          }
        },
        beforeMount: syncProperties,
        updated: syncProperties,
        getSSRProps({ value }) {
          const attributes: Record<string, string | number> = {}
          for (const [key, next] of Object.entries(value)) {
            if (
              next === true ||
              typeof next === 'string' ||
              typeof next === 'number'
            ) {
              attributes[toAttributeName(key)] = next === true ? '' : next
            }
          }
          return attributes
        },
      }
      return () =>
        withDirectives(h(tag, attrs, slots['default']?.()), [
          [properties, { ...values }],
          [preservePlayerTree],
        ])
    },
  })
}
