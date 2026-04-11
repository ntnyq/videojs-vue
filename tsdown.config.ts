import { defineConfig } from 'tsdown'

export default defineConfig({
  clean: true,
  dts: {
    tsgo: true,
  },
  entry: ['src/index.ts', 'src/audio.ts', 'src/background.ts', 'src/video.ts'],
  platform: 'browser',
})
