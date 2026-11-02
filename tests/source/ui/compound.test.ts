import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, shallowRef } from 'vue'
import {
  MediaDialog,
  MediaDialogClose,
  MediaDialogDescription,
  MediaDialogPopup,
  MediaDialogTitle,
  CaptionsButton,
  MediaMenu,
  MediaMenuCheckboxItem,
  MediaMenuContent,
  MediaMenuGroup,
  MediaMenuGroupLabel,
  MediaMenuRadioGroup,
  MediaMenuRadioItem,
  MediaPopover,
  MediaSlider,
  StatusIndicator,
  Thumbnail,
  Tooltip,
  VolumeSlider,
} from '../../../src/ui'
import { VideoPlayerRoot } from '../../../src/video/core'
import { cleanup, mount, settle } from '../../helpers'

describe('compound UI bindings', () => {
  afterEach(cleanup)

  it('uses upstream menu groups, checkbox and radio selection with original events', async () => {
    expect.hasAssertions()
    const onChecked = vi.fn()
    const onValue = vi.fn()
    const disabled = shallowRef(false)
    const { container } = mount(
      defineComponent(
        () => () =>
          h(MediaMenu, null, {
            default: () =>
              h(MediaMenuContent, null, {
                default: () =>
                  h(MediaMenuGroup, null, {
                    default: () => [
                      h(MediaMenuGroupLabel, null, {
                        default: () => 'Settings',
                      }),
                      h(
                        MediaMenuCheckboxItem,
                        {
                          disabled: disabled.value,
                          'onChecked-change': onChecked,
                        },
                        { default: () => 'Loop' },
                      ),
                      h(
                        MediaMenuRadioGroup,
                        { value: 'first', 'onValue-change': onValue },
                        {
                          default: () => [
                            h(
                              MediaMenuRadioItem,
                              { value: 'first' },
                              { default: () => 'First' },
                            ),
                            h(
                              MediaMenuRadioItem,
                              { value: 'second' },
                              { default: () => 'Second' },
                            ),
                          ],
                        },
                      ),
                    ],
                  }),
              }),
          }),
      ),
    )
    await settle()
    const group = container.querySelector('media-menu-group')!
    const label = container.querySelector('media-menu-group-label')!
    expect(group.getAttribute('aria-labelledby')).toBe(label.id)
    const checkbox = container.querySelector('media-menu-checkbox-item')!
    checkbox.click()
    await settle()
    expect(checkbox.getAttribute('aria-checked')).toBe('true')
    expect(onChecked).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { checked: true } }),
    )
    disabled.value = true
    await settle()
    checkbox.click()
    expect(onChecked).toHaveBeenCalledTimes(1)
    const second = container.querySelectorAll('media-menu-radio-item')[1]!
    second.click()
    await settle()
    expect(second.getAttribute('aria-checked')).toBe('true')
    expect(onValue).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { value: 'second' } }),
    )
  })

  it('connects dialog labels and closes through the official close control', async () => {
    expect.hasAssertions()
    const onOpen = vi.fn()
    const { container } = mount(
      defineComponent(
        () => () =>
          h(
            MediaDialog,
            { defaultOpen: true, 'onOpen-change': onOpen },
            {
              default: () =>
                h(MediaDialogPopup, null, {
                  default: () => [
                    h(MediaDialogTitle, null, { default: () => 'Details' }),
                    h(MediaDialogDescription, null, {
                      default: () => 'Player settings',
                    }),
                    h(MediaDialogClose, null, { default: () => 'Close' }),
                  ],
                }),
            },
          ),
      ),
    )
    await settle()
    const dialog = container.querySelector('media-dialog')!
    const popup = container.querySelector('media-dialog-popup')!
    expect(dialog.open).toBe(true)
    expect(popup.getAttribute('aria-labelledby')).toBe(
      container.querySelector('media-dialog-title')!.id,
    )
    expect(popup.getAttribute('aria-describedby')).toBe(
      container.querySelector('media-dialog-description')!.id,
    )
    container.querySelector('media-dialog-close')!.click()
    await settle()
    expect(dialog.open).toBe(false)
    expect(onOpen).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: expect.objectContaining({ open: false }),
      }),
    )
  })

  it('passes object properties intact and restores defaults after removing props', async () => {
    expect.hasAssertions()
    const thumbnailProps = shallowRef<InstanceType<typeof Thumbnail>['$props']>(
      {
        time: 12,
        thumbnails: [],
        crossOrigin: 'anonymous',
        loading: 'lazy',
      },
    )
    const sliderProps = shallowRef<InstanceType<typeof MediaSlider>['$props']>({
      value: 25,
      min: 10,
      max: 50,
      thumbAlignment: 'edge',
    })
    const tooltipProps = shallowRef<InstanceType<typeof Tooltip>['$props']>({
      delay: 25,
      disabled: true,
      boundary: document.body,
    })
    const popoverProps = shallowRef<
      InstanceType<typeof MediaPopover>['$props']
    >({
      openOnHover: true,
      closeOnEscape: false,
    })
    const { container } = mount(
      defineComponent(
        () => () =>
          h(VideoPlayerRoot, null, {
            default: () => [
              h(Thumbnail, thumbnailProps.value),
              h(MediaSlider, sliderProps.value),
              h(Tooltip, tooltipProps.value),
              h(MediaPopover, popoverProps.value),
            ],
          }),
      ),
    )
    await settle()
    const thumbnail = container.querySelector('media-thumbnail')!
    const slider = container.querySelector('media-slider')!
    const tooltip = container.querySelector('media-tooltip')!
    const popover = container.querySelector<
      HTMLElement & { openOnHover: boolean; closeOnEscape: boolean }
    >('media-popover')!
    expect(thumbnail.thumbnails).toBe(thumbnailProps.value.thumbnails)
    expect(thumbnail.time).toBe(12)
    expect(slider.value).toBe(25)
    expect(slider.thumbAlignment).toBe('edge')
    expect(tooltip.boundary).toBe(document.body)
    expect(tooltip.disabled).toBe(true)
    expect(popover.openOnHover).toBe(true)
    thumbnailProps.value = {}
    sliderProps.value = {}
    tooltipProps.value = {}
    popoverProps.value = {}
    await settle()
    expect(thumbnail.time).toBe(0)
    expect(thumbnail.thumbnails).toBeUndefined()
    expect(thumbnail.crossOrigin).toBeUndefined()
    expect(slider.value).toBe(0)
    expect(slider.thumbAlignment).toBe('center')
    expect(tooltip.boundary).toBe('container')
    expect(tooltip.disabled).toBe(false)
    expect(popover.openOnHover).toBe(false)
    expect(popover.closeOnEscape).toBe(true)
  })

  it('preserves callback identity and exposes omitted upstream control options', async () => {
    expect.hasAssertions()
    const deriveCustomStatus = vi.fn(() => null)
    const indicatorProps = shallowRef<
      InstanceType<typeof StatusIndicator>['$props']
    >({ deriveCustomStatus })
    const captionsProps = shallowRef<
      InstanceType<typeof CaptionsButton>['$props']
    >({ commandfor: 'captions', menuFor: 'languages' })
    const volumeProps = shallowRef<InstanceType<typeof VolumeSlider>['$props']>(
      { wheelStep: 0.1, thumbAlignment: 'edge' },
    )
    const { container } = mount(
      defineComponent(
        () => () =>
          h(VideoPlayerRoot, null, {
            default: () => [
              h(StatusIndicator, indicatorProps.value),
              h(CaptionsButton, captionsProps.value),
              h(VolumeSlider, volumeProps.value),
            ],
          }),
      ),
    )
    await settle()
    const indicator = container.querySelector('media-status-indicator')!
    const captions = container.querySelector('media-captions-button')!
    const volume = container.querySelector('media-volume-slider')!
    expect(indicator.deriveCustomStatus).toBe(deriveCustomStatus)
    expect(captions.commandfor).toBe('captions')
    expect(captions.menuFor).toBe('languages')
    expect(volume.wheelStep).toBe(0.1)
    expect(volume.thumbAlignment).toBe('edge')
    indicatorProps.value = {}
    captionsProps.value = {}
    volumeProps.value = {}
    await settle()
    expect(indicator.deriveCustomStatus).toBeUndefined()
    expect(captions.commandfor).toBeUndefined()
    expect(captions.menuFor).toBeUndefined()
    expect(volume.wheelStep).toBe(
      document.createElement('media-volume-slider').wheelStep,
    )
    expect(volume.thumbAlignment).toBe('center')
  })
})
