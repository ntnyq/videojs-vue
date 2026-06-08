import { defineConfig } from 'vitepress'

export default defineConfig({
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
  vite: {
    ssr: {
      noExternal: ['videojs-vue'],
    },
  },
  themeConfig: {
    logo: { src: '/logo.svg', alt: 'Video.js Vue' },
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/overview' },
      { text: 'Examples', link: '/examples/basic-video' },
      { text: 'Playground', link: '/playground' },
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting started', link: '/guide/getting-started' },
          { text: 'Compose a player', link: '/guide/composition' },
          { text: 'Lifecycle and SSR', link: '/guide/lifecycle' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'API', link: '/api/overview' },
          { text: 'Native video', link: '/examples/basic-video' },
          { text: 'HLS', link: '/examples/hls' },
          { text: 'Playground', link: '/playground' },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ntnyq/videojs-vue' },
    ],
    search: { provider: 'local' },
    footer: { message: 'MIT Licensed', copyright: 'Copyright 2026 ntnyq' },
  },
})
