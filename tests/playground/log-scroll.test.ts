import { afterEach, describe, expect, it } from 'vitest'
import { effectScope, nextTick, shallowRef } from 'vue'
import { useEventLog } from '../../playground/src/composables/useEventLog'
import { useLogScroll } from '../../playground/src/composables/useLogScroll'
import { LOG_LIMIT } from '../../playground/src/data'
import { cleanup, disposals } from '../helpers'

function setupLog() {
  const scope = effectScope()
  disposals.push(() => scope.stop())
  const viewport = document.createElement('div')
  Object.defineProperties(viewport, {
    scrollHeight: { value: 1000, writable: true },
    clientHeight: { value: 200 },
  })
  const visible = shallowRef(true)
  const log = useEventLog()
  const scrolling = scope.run(() =>
    useLogScroll(
      () => log.filtered.value,
      shallowRef(viewport),
      () => visible.value,
    ),
  )!
  return { viewport, visible, log, ...scrolling }
}

describe('event log reading position', () => {
  afterEach(cleanup)

  it('keeps old entries still while new events arrive, then resumes at the latest', async () => {
    expect.hasAssertions()
    const reading = setupLog()
    reading.log.record('event', 'play')
    await nextTick()
    expect(reading.viewport.scrollTop).toBe(1000)
    reading.viewport.scrollTop = 100
    reading.onScroll()
    reading.log.record('event', 'pause')
    reading.log.record('model', 'volume')
    await nextTick()
    expect(reading.viewport.scrollTop).toBe(100)
    expect(reading.unread.value).toBe(2)
    reading.goLatest()
    expect(reading.unread.value).toBe(0)
    expect(reading.viewport.scrollTop).toBe(1000)
    reading.log.record('event', 'play')
    await nextTick()
    expect(reading.isFollowing.value).toBe(true)
    expect(reading.unread.value).toBe(0)
  })

  it('retains reading position across collapse and recovers after clearing a full log', async () => {
    expect.hasAssertions()
    const reading = setupLog()
    reading.log.record('event', 'play')
    await nextTick()
    reading.viewport.scrollTop = 100
    reading.onScroll()
    reading.visible.value = false
    for (let index = 0; index < LOG_LIMIT + 1; index++) {
      reading.log.record('model', 'volume', { index })
    }
    await nextTick()
    reading.visible.value = true
    await nextTick()
    expect(reading.viewport.scrollTop).toBe(100)
    expect(reading.unread.value).toBe(LOG_LIMIT)
    reading.log.clear()
    await nextTick()
    expect(reading.unread.value).toBe(0)
    expect(reading.isFollowing.value).toBe(true)
    reading.log.record('event', 'pause')
    await nextTick()
    expect(reading.viewport.scrollTop).toBe(1000)
    expect(reading.unread.value).toBe(0)
  })

  it('honors the auto-scroll checkbox and counts only matching new entries', async () => {
    expect.hasAssertions()
    const reading = setupLog()
    reading.isAutoScroll.value = false
    reading.viewport.scrollTop = 0
    reading.onScroll()
    reading.log.query.value = 'volume'
    reading.log.record('event', 'pause')
    reading.log.record('model', 'volume')
    await nextTick()
    expect(reading.viewport.scrollTop).toBe(0)
    expect(reading.unread.value).toBe(1)
    reading.isAutoScroll.value = true
    await nextTick()
    expect(reading.unread.value).toBe(0)
    expect(reading.viewport.scrollTop).toBe(1000)
  })
})
