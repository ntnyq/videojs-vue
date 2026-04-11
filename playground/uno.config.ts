import {
  defineConfig,
  presetWind4,
  presetIcons,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  presets: [
    presetIcons(),
    presetWind4(),
    presetWebFonts({
      fonts: {
        display: 'Bricolage Grotesque',
        sans: 'IBM Plex Sans',
      },
      provider: 'bunny',
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
})
