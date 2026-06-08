import { describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import { mergeProps } from '../src/ui/factories/mergeProps'
import { renderElement } from '../src/ui/factories/renderElement'

describe('mergeProps utility', () => {
  it('chains event handlers in right-to-left order', () => {
    expect.hasAssertions()
    const calls: string[] = []

    const merged = mergeProps(
      {
        onClick: () => {
          calls.push('internal')
        },
      },
      {
        onClick: () => {
          calls.push('external')
        },
      },
    )

    ;(merged['onClick'] as ((event: Event) => void) | undefined)?.(
      new MouseEvent('click'),
    )

    expect(calls).toStrictEqual(['external', 'internal'])
  })

  it('merges class and style values', () => {
    expect.hasAssertions()
    const merged = mergeProps(
      {
        class: 'base',
        style: {
          color: 'red',
        },
      },
      {
        class: 'custom',
        style: {
          fontSize: '12px',
        },
      },
    )

    expect(merged['class']).toBe('custom base')
    expect(merged['style']).toStrictEqual({
      color: 'red',
      fontSize: '12px',
    })
  })
})

describe('renderElement utility', () => {
  it('renders default tag with merged children and attrs', () => {
    expect.hasAssertions()

    const vnode = renderElement(
      'button',
      {},
      {
        state: {
          paused: true,
        },
        props: [
          {
            type: 'button',
            children: 'Play',
          },
          {
            id: 'play-trigger',
          },
        ],
      },
    )

    expect(vnode?.type).toBe('button')
    expect(vnode?.props?.['id']).toBe('play-trigger')
    expect(vnode?.props?.['type']).toBe('button')
    expect(vnode?.children).toBe('Play')
  })

  it('supports render function and state-driven class', () => {
    expect.hasAssertions()
    const render = vi.fn((props: Record<string, unknown>) => h('span', props))

    const vnode = renderElement(
      'button',
      {
        class: state => `is-active:${String(state.active)}`,
        render,
      },
      {
        state: {
          active: true,
        },
        props: {
          title: 'custom',
        },
      },
    )

    expect(render).toHaveBeenCalledTimes(1)
    expect(vnode?.type).toBe('span')
    expect(vnode?.props?.['class']).toBe('is-active:true')
    expect(vnode?.props?.['title']).toBe('custom')
  })
})
