---
description: Configure player languages, load locale packs, override translations, and translate custom controls.
---

# Internationalization

Import the optional `videojs-vue/i18n` entry to translate player controls and custom text. It uses the Video.js shared translation registry and locale loading. No Vue compiler configuration or `vue-i18n` dependency is required.

## Share a language across players

Place `MediaI18n` around the common ancestor of your players. Updating `lang` changes their labels without remounting the players or resetting playback.

```vue
<script setup lang="ts">
import { shallowRef } from 'vue'
import { VideoPlayer } from 'videojs-vue'
import { MediaI18n } from 'videojs-vue/i18n'

const locale = shallowRef('zh-CN')
</script>

<template>
  <select
    v-model="locale"
    aria-label="Player language"
  >
    <option value="zh-CN">简体中文</option>
    <option value="en">English</option>
  </select>

  <MediaI18n :lang="locale">
    <VideoPlayer src="/first.mp4" />
    <VideoPlayer src="/second.mp4" />
  </MediaI18n>
</template>
```

`MediaI18n` renders a `media-i18n` element. It can also wrap your application's `RouterView`, so players on different pages share one configuration. `VideoPlayer` does not create its own provider. Composed players using `VideoPlayerRoot` and controls from `videojs-vue/ui` inherit the same language.

If your application already uses `vue-i18n`, pass its reactive locale directly:

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { MediaI18n } from 'videojs-vue/i18n'

const { locale } = useI18n()
</script>

<template>
  <MediaI18n :lang="locale">
    <RouterView />
  </MediaI18n>
</template>
```

Application messages remain in `vue-i18n`; player translations use the upstream registry.

## Override a region

Nest another provider only where a different language is needed:

```vue
<MediaI18n lang="zh-CN">
  <VideoPlayer src="/first.mp4" />
  <MediaI18n lang="en">
    <VideoPlayer src="/english-lesson.mp4" />
  </MediaI18n>
</MediaI18n>
```

Omit `lang` to follow the nearest ancestor's HTML `lang` attribute, falling back to English. Removing an explicit `lang` restores this behavior. Providers and controls follow the DOM hierarchy; keep teleported controls inside the intended provider in the destination DOM.

An explicit language also derives text direction. Pass `dir="ltr"`, `dir="rtl"`, or `dir="auto"` to override it. When using the document language, set both `lang` and `dir` on `<html>`.

## Register translations once

Built-in locale packs load on demand. To preload a pack or override some of its phrases, import its upstream registration entry before registering overrides. If importing upstream packs directly, declare `@videojs/html@10.0.1` in your application's dependencies:

```sh
pnpm add @videojs/html@10.0.1
```

```ts
// Application entry, before mounting Vue.
import '@videojs/html/i18n/locales/zh-CN/register'
import { registerI18n } from 'videojs-vue/i18n'
import type { Translations } from 'videojs-vue/i18n'

const translations = {
  buttons: {
    play: '开始播放',
    pause: '暂停播放',
  },
  seek: {
    forward: '快进 {seconds} 秒',
  },
} satisfies Partial<Translations>

registerI18n('zh-CN', translations)
```

Registration is shared by every provider using that locale, including already mounted providers. Keep registrations in application setup, rather than repeating them for each player. Preserve interpolation placeholders such as `{seconds}`.

Registering any translations for a locale prevents that locale's pack from loading automatically. Import the full pack first when making partial overrides; otherwise missing phrases may fall back to English after a locale switch or remount. Regional tags can also fall back to their parent locale.

The entry also exports the upstream `getI18nTranslations`, `hasRegisteredLocale`, and `onI18nRegistryChange` functions. The last returns an unsubscribe function; call it when your subscription is no longer needed.

## Translate custom text

Use `MediaText` inside the same provider for visible text in your own controls:

```vue
<PlayButton>
  <MediaText :token="paused ? 'buttons.play' : 'buttons.pause'">
    {{ paused ? 'Play' : 'Pause' }}
  </MediaText>
</PlayButton>
```

Here `paused` is the selection returned by `useVideoPlayerState(state => state.paused)` inside `VideoPlayerRoot`.

`MediaText` accepts a `token` and a plain-text default slot containing the English fallback. Keep markup, icons, and other components outside this slot. Both the token and fallback can change reactively. A missing token or translation displays the fallback. Changing the fallback recreates only the underlying text element because Video.js captures its fallback when it first connects.

Visible text and accessible labels are separate: controls still derive their accessible names from player state. A control's explicit `label` overrides its built-in accessible label, so translate that value through your application if you supply one.

## Server rendering

The optional entry is safe to import without browser globals. Vue emits the provider's `lang` and `dir`, the text `token`, and fallback text on the server. Translation runs when the upstream custom elements connect in the browser; the wrapper does not produce translated server HTML.

Use the same locale on server and client. Pre-register supported packs before mounting the client if you want to avoid waiting for lazy locale loading. `MediaText` supports hydration after its element has already upgraded and translated. The shared registry is not request-scoped: register stable application translations, not request-specific overrides.

See the [Video.js internationalization guide](https://videojs.org/docs/framework/html/guides/internationalization) for upstream fallback and locale-pack details.

See the [internationalization API](../api/i18n.md) for the complete export list, or try locale switching in the [Playground](https://videojs-vue-playground.ntnyq.dev).
