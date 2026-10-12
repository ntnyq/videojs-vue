import { afterEach, describe, expect, it } from 'vitest'
import { createSSRApp, defineComponent, h, shallowRef } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { PlayerRoot, Video, usePlayerState } from '../../../src'
import {
  Hotkey,
  MediaContainer,
  PlayButton,
  SeekButton,
  TimeSlider,
} from '../../../src/ui'
import { mount, settle, cleanup, disposals } from '../../helpers'

describe('player controls', () => {
  afterEach(cleanup)

  it('supports injected selectors and upstream keyboard-ready controls', async () => {
    expect.hasAssertions()
    const Child = defineComponent({
      setup() {
        const paused = usePlayerState(state => state.paused)
        return () => h('output', String(paused.value))
      },
    })
    const { container } = mount(
      defineComponent(
        () => () =>
          h(PlayerRoot, null, {
            default: () =>
              h(MediaContainer, null, {
                default: () => [
                  h(Video),
                  h(PlayButton, null, { default: () => 'Toggle playback' }),
                  h(Child),
                ],
              }),
          }),
      ),
    )
    await settle()
    expect(container.querySelector('output')?.textContent).toBe('true')
    const button = container.querySelector('media-play-button')!
    expect(button.getAttribute('role')).toBe('button')
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await settle()
    expect(container.querySelector('output')?.textContent).toBe('false')
  })

  it('restores upstream control defaults when optional props are removed', async () => {
    expect.hasAssertions()
    const seekProps = shallowRef<InstanceType<typeof SeekButton>['$props']>({
      seconds: 20,
      disabled: true,
    })
    const sliderProps = shallowRef<InstanceType<typeof TimeSlider>['$props']>({
      step: 10,
      orientation: 'vertical',
    })
    const hotkeyProps = shallowRef<InstanceType<typeof Hotkey>['$props']>({
      value: 10,
    })
    const { container } = mount(
      defineComponent(
        () => () =>
          h(PlayerRoot, null, {
            default: () => [
              h(SeekButton, seekProps.value),
              h(TimeSlider, sliderProps.value),
              h(Hotkey, hotkeyProps.value),
            ],
          }),
      ),
    )
    await settle()
    const seek = container.querySelector('media-seek-button')!
    const slider = container.querySelector('media-time-slider')!
    const hotkey = container.querySelector('media-hotkey')!
    expect(seek.seconds).toBe(20)
    expect(seek.disabled).toBe(true)
    expect(slider.step).toBe(10)
    expect(slider.orientation).toBe('vertical')
    expect(hotkey.value).toBe(10)

    seekProps.value = {}
    sliderProps.value = {}
    hotkeyProps.value = {}
    await settle()
    expect(seek.seconds).toBe(30)
    expect(seek.disabled).toBe(false)
    expect(slider.step).toBe(1)
    expect(slider.orientation).toBe('horizontal')
    expect(hotkey.value).toBeUndefined()

    seekProps.value = { seconds: 20, disabled: true }
    sliderProps.value = { step: 10, orientation: 'vertical' }
    hotkeyProps.value = { value: 10 }
    await settle()
    expect(seek.seconds).toBe(20)
    expect(slider.step).toBe(10)
    expect(hotkey.value).toBe(10)
  })

  it('hydrates control properties and restores their upstream defaults', async () => {
    expect.hasAssertions()
    const settings = shallowRef<InstanceType<typeof SeekButton>['$props']>({
      seconds: 20,
    })
    const Player = defineComponent(
      () => () =>
        h(PlayerRoot, null, {
          default: () => [h(Video), h(SeekButton, settings.value)],
        }),
    )
    const container = document.createElement('div')
    container.innerHTML = await renderToString(createSSRApp(Player))
    document.body.append(container)
    const app = createSSRApp(Player)
    app.mount(container)
    disposals.push(() => {
      app.unmount()
      container.remove()
    })
    await settle()
    const seek = container.querySelector('media-seek-button')!
    expect(seek.seconds).toBe(20)

    settings.value = {}
    await settle()
    expect(seek.seconds).toBe(30)
  })
})
