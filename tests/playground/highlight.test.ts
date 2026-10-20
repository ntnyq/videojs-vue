import { describe, expect, it } from 'vitest'
import { createConfig, EXAMPLES } from '../../playground/src/data'
import { createExampleCode } from '../../playground/src/lib/createExampleCode'
import { highlightExampleCode } from '../../playground/src/lib/highlightExampleCode'

describe('playground code highlighting', () => {
  it.each(EXAMPLES)(
    'preserves the $id example with light and dark tokens',
    async ({ id }) => {
      expect.hasAssertions()
      const code = createExampleCode(id, createConfig(id), 'composable')
      const container = document.createElement('div')
      container.innerHTML = await highlightExampleCode(code)

      expect(container.textContent).toBe(code)
      expect(container.querySelector('pre')?.getAttribute('tabindex')).toBe('0')
      const tokens = container.querySelectorAll('code span[style]')
      expect(tokens.length).toBeGreaterThan(0)
      expect(
        new Set([...tokens].map(token => token.getAttribute('style'))).size,
      ).toBeGreaterThan(1)
      for (const token of tokens) {
        expect(token.getAttribute('style')).toContain('--shiki-light:')
        expect(token.getAttribute('style')).toContain('--shiki-dark:')
      }
    },
  )

  it('renders HTML and script content as code without creating executable elements', async () => {
    expect.hasAssertions()
    const code =
      '<template><img src="x" onerror="alert(1)"><p>&amp;</p></template>\n<script>alert(1)</script>'
    const container = document.createElement('div')
    container.innerHTML = await highlightExampleCode(code)

    expect(container.textContent).toBe(code)
    expect(
      container.querySelector('img, script, template, [onerror]'),
    ).toBeNull()
  })
})
