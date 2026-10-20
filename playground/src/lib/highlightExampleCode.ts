import { createHighlighterCore } from '@shikijs/core'
import { createJavaScriptRegexEngine } from '@shikijs/engine-javascript'
import vue from '@shikijs/langs/vue'
import githubDark from '@shikijs/themes/github-dark'
import githubLight from '@shikijs/themes/github-light'

const highlighter = createHighlighterCore({
  engine: createJavaScriptRegexEngine(),
  langs: [vue],
  themes: [githubLight, githubDark],
})

export async function highlightExampleCode(code: string): Promise<string> {
  const instance = await highlighter
  return instance.codeToHtml(code, {
    lang: 'vue',
    themes: {
      light: 'github-light',
      dark: 'github-dark',
    },
    defaultColor: false,
  })
}
