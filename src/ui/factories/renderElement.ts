import type { StateAttrMap } from '@videojs/core/dom'
import { getStateDataAttrs } from '@videojs/core/dom'
import type { CSSProperties, Ref, VNode, VNodeChild } from 'vue'
import { cloneVNode, h, isVNode } from 'vue'
import { mergeProps } from './mergeProps'

type RefTarget = Element | null
type RenderProps = Record<string, unknown>

type RenderFunction<State> = (props: RenderProps, state: State) => VNode | null

type RenderProp<State> = VNode | RenderFunction<State>

export interface UseRenderComponentProps<State extends object> {
  class?: string | ((state: State) => string | undefined) | undefined
  style?:
    | CSSProperties
    | ((state: State) => CSSProperties | undefined)
    | undefined
  render?: RenderProp<State> | undefined
}

type RefLike<Target extends RefTarget> =
  | Ref<Target>
  | ((value: Target) => void)
  | undefined

export interface UseRenderParameters<
  State extends object,
  Target extends RefTarget,
> {
  state: State
  ref?: RefLike<Target> | RefLike<Target>[] | undefined
  props?: RenderProps | RenderProps[] | undefined
  stateAttrMap?: StateAttrMap<State> | undefined
}

function resolveClassName<State extends object>(
  className: string | ((state: State) => string | undefined) | undefined,
  state: State,
): string | undefined {
  return typeof className === 'function' ? className(state) : className
}

function resolveStyle<State extends object>(
  style:
    | CSSProperties
    | ((state: State) => CSSProperties | undefined)
    | undefined,
  state: State,
): CSSProperties | undefined {
  return typeof style === 'function' ? style(state) : style
}

function setRef<Target extends RefTarget>(
  ref: RefLike<Target>,
  value: Target,
): void {
  if (!ref) {
    return
  }

  if (typeof ref === 'function') {
    ref(value)
    return
  }

  ;(ref as Ref<Target>).value = value
}

function composeRefs<Target extends RefTarget>(
  refs: RefLike<Target>[],
): (value: Target) => void {
  return (value: Target) => {
    for (const ref of refs) {
      setRef(ref, value)
    }
  }
}

function toPropsArray(
  props: RenderProps | RenderProps[] | undefined,
): RenderProps[] {
  if (!props) {
    return []
  }

  return Array.isArray(props) ? props : [props]
}

export function renderElement<State extends object, Target extends RefTarget>(
  element: string,
  componentProps: UseRenderComponentProps<State>,
  params: UseRenderParameters<State, Target>,
): VNode | null {
  const { class: classProp, style: styleProp, render } = componentProps
  const { state, ref, props, stateAttrMap } = params

  const className = resolveClassName(classProp, state)
  const style = resolveStyle(styleProp, state)
  const stateDataAttrs = stateAttrMap
    ? getStateDataAttrs(state, stateAttrMap)
    : {}

  const propsArray = toPropsArray(props)
  const mergedProps = mergeProps(stateDataAttrs, ...propsArray)

  if (className !== undefined) {
    mergedProps['class'] = mergeProps(
      { class: mergedProps['class'] },
      { class: className },
    )['class']
  }

  if (style !== undefined) {
    mergedProps['style'] = mergeProps(
      { style: mergedProps['style'] },
      { style },
    )['style']
  }

  const children = mergedProps['children'] as VNodeChild
  delete mergedProps['children']

  let refs: RefLike<Target>[] = []
  if (Array.isArray(ref)) {
    refs = ref
  } else if (ref) {
    refs = [ref]
  }

  const mergedRef = composeRefs<Target>([
    ...refs,
    mergedProps['ref'] as RefLike<Target>,
  ])
  mergedProps['ref'] = mergedRef

  if (typeof render === 'function') {
    return render(mergedProps, state)
  }

  if (render && isVNode(render)) {
    return cloneVNode(render, mergedProps, true)
  }

  return h(element, mergedProps, children ?? undefined)
}

export type RenderElementComponentProps<State extends object> =
  UseRenderComponentProps<State>
export type RenderElementParameters<
  State extends object,
  Target extends RefTarget,
> = UseRenderParameters<State, Target>
