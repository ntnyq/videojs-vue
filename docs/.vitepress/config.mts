/* oxlint-disable import/no-nodejs-modules, node/no-sync -- VitePress loads the generated sidebar from disk in Node.js. */
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vitepress'
import type { DefaultTheme } from 'vitepress'

const referenceSidebar: DefaultTheme.SidebarItem[] = JSON.parse(
  readFileSync(
    new URL('../reference/api/typedoc-sidebar.json', import.meta.url),
    'utf8',
  ),
)

for (const entry of referenceSidebar) {
  if (entry.text) {
    entry.text = entry.text.replace(/^videojs-vue\//u, '')
  }
}

export default defineConfig({
  lang: 'en-US',
  title: 'Video.js Vue',
  description: 'Vue components and composables for Video.js 10',
  head: [
    [
      'link',
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon.png' },
    ],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
  ],
  cleanUrls: true,
  lastUpdated: true,
  sitemap: { hostname: 'https://videojs-vue.ntnyq.dev' },
  vite: {
    ssr: {
      noExternal: ['videojs-vue'],
    },
  },
  themeConfig: {
    logo: { src: '/logo.svg', alt: 'Video.js Vue' },
    nav: [
      { text: 'Guide', link: '/guide/overview', activeMatch: '/guide/' },
      { text: 'API', link: '/api/overview', activeMatch: '/api/' },
      {
        text: 'API Reference',
        link: '/reference/',
        activeMatch: '/reference/',
      },
      {
        text: 'Examples',
        link: '/examples/basic-video',
        activeMatch: '/examples/',
      },
      { text: 'Playground', link: 'https://videojs-vue-playground.ntnyq.dev' },
    ],
    sidebar: {
      '/reference/': [
        { text: 'API Reference', link: '/reference/' },
        { text: 'Package index', link: '/reference/api/' },
        ...referenceSidebar,
      ],
      '/': [
        {
          text: 'Getting started',
          items: [
            { text: 'Introduction', link: '/guide/overview' },
            { text: 'Installation and usage', link: '/guide/getting-started' },
            { text: 'Migrate player API names', link: '/guide/migration' },
          ],
        },
        {
          text: 'Guides',
          items: [
            { text: 'State and actions', link: '/guide/state-and-actions' },
            { text: 'Compose a player', link: '/guide/composition' },
            { text: 'Bundle size and imports', link: '/guide/bundle-size' },
            { text: 'Skins and styling', link: '/guide/styling' },
            { text: 'Chrome 90+ legacy mode', link: '/guide/legacy' },
            {
              text: 'Internationalization',
              link: '/guide/internationalization',
            },
            { text: 'Lifecycle and SSR', link: '/guide/lifecycle' },
            { text: 'Troubleshooting', link: '/guide/troubleshooting' },
          ],
        },
        {
          text: 'API guide',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/api/overview' },
            { text: 'Live video', link: '/api/live' },
            { text: 'Audio players', link: '/api/audio' },
            { text: 'VideoPlayer', link: '/api/video-player' },
            { text: 'VideoPlayerRoot and skins', link: '/api/player-root' },
            { text: 'Media adapters', link: '/api/media' },
            { text: 'Composables and handles', link: '/api/composables' },
            { text: 'Events', link: '/api/events' },
            { text: 'UI controls', link: '/api/ui' },
            { text: 'Internationalization', link: '/api/i18n' },
          ],
        },
        {
          text: 'Examples',
          items: [
            {
              text: 'Native video and captions',
              link: '/examples/basic-video',
            },
            { text: 'Native audio', link: '/examples/audio' },
            { text: 'HLS Live', link: '/examples/live' },
            { text: 'HLS', link: '/examples/hls' },
            {
              text: 'Quality and audio selection',
              link: '/examples/media-selection',
            },
            {
              text: 'Playground',
              link: 'https://videojs-vue-playground.ntnyq.dev',
            },
          ],
        },
        {
          text: 'Project',
          items: [{ text: 'Contributing', link: '/contributing' }],
        },
      ],
    },
    outline: [2, 3],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ntnyq/videojs-vue' },
    ],
    search: { provider: 'local' },
    footer: {
      message:
        'Released under the <a href="https://github.com/ntnyq/videojs-vue/blob/main/LICENSE">MIT License</a>. Built on <a href="https://videojs.org">Video.js</a>.',
      copyright: 'Copyright 2026 ntnyq',
    },
  },
})
