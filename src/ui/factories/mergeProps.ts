import { normalizeClass, normalizeStyle } from 'vue'

type Props = Record<string, unknown>
type EventHandler = ((event: Event) => void) | undefined
type EventInput = EventHandler | EventHandler[]

function isEventHandlerKey(key: string): boolean {
  return /^on[A-Z]/u.test(key)
}

function isEventHandler(key: string, value: unknown): value is EventInput {
  return (
    isEventHandlerKey(key) &&
    (typeof value === 'function' ||
      value === undefined ||
      (Array.isArray(value) && value.every(item => typeof item === 'function')))
  )
}

function toEventHandler(value: EventInput): EventHandler {
  if (typeof value === 'function' || value === undefined) {
    return value
  }

  return (event: Event) => {
    for (const handler of value) {
      handler?.(event)
    }
  }
}

function mergeEventHandlers(
  ours: EventInput,
  theirs: EventInput,
): EventHandler {
  const oursFn = toEventHandler(ours)
  const theirsFn = toEventHandler(theirs)

  if (!theirsFn) {
    return oursFn
  }

  if (!oursFn) {
    return theirsFn
  }

  return (event: Event) => {
    theirsFn(event)
    oursFn(event)
  }
}

function mergeClassNames(ours: unknown, theirs: unknown): string | undefined {
  const normalized = normalizeClass([theirs, ours])
  return normalized || undefined
}

function mergeStyles(ours: unknown, theirs: unknown): unknown {
  if (!theirs) {
    return ours
  }

  if (!ours) {
    return theirs
  }

  const oursNormalized = normalizeStyle(ours)
  const theirsNormalized = normalizeStyle(theirs)

  if (
    typeof oursNormalized === 'object' &&
    oursNormalized &&
    typeof theirsNormalized === 'object' &&
    theirsNormalized
  ) {
    return {
      ...oursNormalized,
      ...theirsNormalized,
    }
  }

  return theirsNormalized
}

function mergeOne(merged: Props, props: Props | undefined): Props {
  if (!props) {
    return merged
  }

  for (const key in props) {
    if (!Object.hasOwn(props, key)) {
      continue
    }

    const value = props[key]

    if (key === 'class' || key === 'className') {
      const mergedClass = mergeClassNames(
        merged['class'],
        value as string | undefined,
      )

      if (mergedClass) {
        merged['class'] = mergedClass
      } else {
        delete merged['class']
      }

      continue
    }

    if (key === 'style') {
      const mergedStyle = mergeStyles(merged['style'], value)

      if (mergedStyle) {
        merged['style'] = mergedStyle
      } else {
        delete merged['style']
      }

      continue
    }

    if (isEventHandler(key, value)) {
      merged[key] = mergeEventHandlers(
        merged[key] as EventInput,
        value as EventInput,
      )
      continue
    }

    merged[key] = value
  }

  return merged
}

export function mergeProps(...propSets: (Props | undefined)[]): Props {
  let merged: Props = {}

  for (const props of propSets) {
    merged = mergeOne(merged, props)
  }

  return merged
}
