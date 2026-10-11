import { describe, expect, inject, it } from 'vitest'

describe('published package', () => {
  it('registers its elements in an isolated environment from the published entry', async () => {
    expect.hasAssertions()
    const tags = inject('registeredTags')
    for (const tag of tags) {
      expect(customElements.get(tag)).toBeUndefined()
    }
    await import(inject('packageEntry'))
    for (const tag of tags) {
      const constructor = customElements.get(tag)
      expect(constructor).toBeDefined()
      expect(document.createElement(tag)).toBeInstanceOf(constructor)
    }
  })
})
