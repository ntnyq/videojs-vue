import { defineConfig } from 'vitepress'

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
  sitemap: { hostname: 'https://videojs-vue-docs.vercel.app' },
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
        text: 'Examples',
        link: '/examples/basic-video',
        activeMatch: '/examples/',
      },
      { text: 'Playground', link: 'https://videojs-vue-playground.vercel.app' },
    ],
    sidebar: [
      {
        text: 'Getting started',
        items: [
          { text: 'Introduction', link: '/guide/overview' },
          { text: 'Installation and usage', link: '/guide/getting-started' },
        ],
      },
      {
        text: 'Guides',
        items: [
          { text: 'State and actions', link: '/guide/state-and-actions' },
          { text: 'Compose a player', link: '/guide/composition' },
          { text: 'Bundle size and imports', link: '/guide/bundle-size' },
          { text: 'Skins and styling', link: '/guide/styling' },
          { text: 'Internationalization', link: '/guide/internationalization' },
          { text: 'Lifecycle and SSR', link: '/guide/lifecycle' },
          { text: 'Troubleshooting', link: '/guide/troubleshooting' },
        ],
      },
      {
        text: 'API reference',
        collapsed: false,
        items: [
          { text: 'Overview', link: '/api/overview' },
          { text: 'Audio players', link: '/api/audio' },
          { text: 'VideoPlayer', link: '/api/video-player' },
          { text: 'PlayerRoot and skins', link: '/api/player-root' },
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
          { text: 'Native video and captions', link: '/examples/basic-video' },
          { text: 'Native audio', link: '/examples/audio' },
          { text: 'HLS', link: '/examples/hls' },
          {
            text: 'Playground',
            link: 'https://videojs-vue-playground.vercel.app',
          },
        ],
      },
      {
        text: 'Project',
        items: [{ text: 'Contributing', link: '/contributing' }],
      },
    ],
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
