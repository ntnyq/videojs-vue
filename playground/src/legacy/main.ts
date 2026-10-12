import 'videojs-vue/polyfills'

// oxlint-disable-next-line node/no-top-level-await -- Polyfills must run before the player module graph.
await import('./bootstrap')
