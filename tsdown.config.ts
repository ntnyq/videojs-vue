import { defineConfig } from 'tsdown'

export default defineConfig({
  clean: true,
  dts: true,
  entry: [
    'src/index.ts',
    'src/i18n/index.ts',
    'src/media/hls.ts',
    'src/ui/index.ts',
  ],
  platform: 'browser',
})
