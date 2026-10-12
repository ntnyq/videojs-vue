// oxlint-disable-next-line import/no-nodejs-modules -- Test helpers run in Node.js.
import { setTimeout as wait } from 'node:timers/promises'
import { vi } from 'vitest'
import { createApp, nextTick } from 'vue'
import type { Component } from 'vue'

export const disposals: (() => void)[] = []

export function mount(component: Component) {
  const container = document.createElement('div')
  document.body.append(container)
  const app = createApp(component)
  app.mount(container)
  const unmount = () => {
    app.unmount()
    container.remove()
  }
  disposals.push(unmount)
  return { container, unmount }
}

export async function settle() {
  await nextTick()
  await wait(0)
  await nextTick()
}

/**
 * Video.js 10.0.1 reconnects native media before its container registers again.
 * Ignore only that transient diagnostic during a deliberate KeepAlive resume.
 * @param {() => void} activate - Restores the cached player to the document.
 */
export async function reconnectPlayer(activate: () => void) {
  const { warn } = console
  const warning = vi.spyOn(console, 'warn').mockImplementation((...args) => {
    if (
      args.length === 1 &&
      args[0] ===
        '[vjs] controlsFeature requires a container element for activity tracking.'
    ) {
      return
    }
    warn(...args)
  })
  try {
    activate()
    await settle()
  } finally {
    warning.mockRestore()
  }
}

export function cleanup() {
  for (const dispose of disposals.splice(0)) {
    dispose()
  }
  vi.restoreAllMocks()
}
