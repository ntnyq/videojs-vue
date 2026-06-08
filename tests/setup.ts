import { vi } from 'vitest'

if (typeof HTMLMediaElement !== 'undefined') {
  Object.defineProperty(HTMLMediaElement.prototype, 'audioTracks', {
    configurable: true,
    get: vi.fn(),
  })
  Object.defineProperty(HTMLMediaElement.prototype, 'videoTracks', {
    configurable: true,
    get: vi.fn(),
  })
  // Jsdom has no media pipeline; only those browser capabilities are substituted.
  Object.defineProperty(globalThis, 'matchMedia', {
    value: () => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  })
  vi.stubGlobal(
    'ResizeObserver',
    class {
      public observe = vi.fn()
      public unobserve = vi.fn()
      public disconnect = vi.fn()
    },
  )
  Object.defineProperty(HTMLMediaElement.prototype, 'play', {
    configurable: true,
    value() {
      Object.defineProperty(this, 'paused', {
        configurable: true,
        value: false,
      })
      this.dispatchEvent(new Event('play'))
      this.dispatchEvent(new Event('playing'))
      return Promise.resolve()
    },
  })
  Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
    configurable: true,
    value() {
      Object.defineProperty(this, 'paused', { configurable: true, value: true })
      this.dispatchEvent(new Event('pause'))
    },
  })
  Object.defineProperty(HTMLMediaElement.prototype, 'load', {
    configurable: true,
    value: vi.fn(),
  })
}
