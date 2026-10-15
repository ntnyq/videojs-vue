import { defineComponent, h } from 'vue'
import { LegacyPreview } from './LegacyPreview'

const GUIDE_URL =
  'https://github.com/ntnyq/videojs-vue/blob/main/docs/guide/legacy.md'

export const LegacyDemo = defineComponent({
  name: 'LegacyDemo',
  setup() {
    return () => {
      const header = h('header', { class: 'legacy-demo__header' }, [
        h('a', { class: 'legacy-demo__brand', href: './', translate: 'no' }, [
          h('span', { class: 'legacy-demo__mark', 'aria-hidden': 'true' }),
          'videojs-vue',
          h('span', { class: 'legacy-demo__edition' }, 'Legacy'),
        ]),
        h(
          'nav',
          { class: 'legacy-demo__nav', 'aria-label': 'Main navigation' },
          [
            h('a', { href: './' }, 'Playground'),
            h('a', { href: GUIDE_URL }, 'Docs'),
            h('a', { href: 'https://github.com/ntnyq/videojs-vue' }, 'GitHub'),
          ],
        ),
      ])
      const intro = h('div', { class: 'legacy-demo__intro' }, [
        h('div', [
          h('h1', 'Legacy playground'),
          h(
            'p',
            'The same player essentials, built for a wider browser baseline.',
          ),
        ]),
        h('span', { class: 'legacy-demo__target' }, 'Chrome 90+ target'),
      ])
      const shortcuts = h('ul', { class: 'legacy-demo__shortcuts' }, [
        h('li', [
          h('kbd', 'Space'),
          h('span', 'or'),
          h('kbd', 'K'),
          ' Play / pause',
        ]),
        h('li', [h('kbd', '←'), h('kbd', '→'), ' Seek 10 seconds']),
      ])
      const keyboard = h('section', { 'aria-labelledby': 'keyboard-heading' }, [
        h('h2', { id: 'keyboard-heading' }, 'Keep your hands on the keyboard'),
        h('p', 'Focus the player to use these shortcuts.'),
        shortcuts,
      ])
      const compatibility = h(
        'section',
        { 'aria-labelledby': 'compatibility-heading' },
        [
          h('h2', { id: 'compatibility-heading' }, 'Compatibility comes first'),
          h(
            'p',
            'Video.js 10 controls with a lightweight, independent skin. Try MP4 or HLS, then switch to a compact player to check the layout.',
          ),
          h('a', { href: GUIDE_URL }, 'Browser requirements'),
        ],
      )
      const footer = h('footer', { class: 'legacy-demo__footer' }, [
        h('span', 'Built with Vue & Video.js 10'),
        h('span', 'Demo media requires an internet connection.'),
      ])
      return [
        h(
          'a',
          { class: 'legacy-demo__skip', href: '#preview' },
          'Skip to player',
        ),
        header,
        h('main', { class: 'legacy-demo__main', id: 'preview', tabindex: -1 }, [
          intro,
          h(LegacyPreview),
          h('div', { class: 'legacy-demo__notes' }, [keyboard, compatibility]),
        ]),
        footer,
      ]
    }
  },
})
