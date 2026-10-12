import { defineConfig } from 'tsdown'

export default defineConfig({
  clean: true,
  copy: [
    {
      from: 'src/skins/legacy.css',
      to: 'dist/skins',
    },
  ],
  deps: {
    // Vue's inferred $watch signature inlines the OnCleanup declaration.
    onlyBundle: ['@vue/reactivity'],
  },
  dts: true,
  entry: ['src/**/*.ts'],
  platform: 'browser',
  root: 'src',
  target: 'chrome90',
  unbundle: true,
})
