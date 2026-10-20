# Playground

A Vue 3 API workbench for `videojs-vue`, built with shadcn-vue, Tailwind CSS 4 and Vue I18n. UI panels use Vue SFCs; the player composition examples remain TSX.

From the repository root, run `pnpm build`, then `pnpm play:dev`. Keep `pnpm dev` running in another terminal when changing the library. Open the Vite URL printed in the terminal (port 5174 by default).

## Explore

- Start with the video player and use the Video / Audio tabs above the preview to switch to native audio playback. Switching back restores the last selected video example with its default settings. The sidebar also includes the audio example.
- Explore native MP4, HLS, custom controls, captions, two-way bindings, reactive state, player actions and lifecycle examples.
- Adjust props in the inspector. Media, poster and track URLs apply on submission; other controls update immediately. Reset restores the selected example and creates a fresh player.
- Use Actions to call all ten public methods through either `useVideoPlayerActions(player)` or the component ref. Browser-dependent actions show disabled controls when unsupported; rejected calls appear in the error panel and log.
- Switch between the preview, generated Vue example and upstream state without unmounting playback. Copy the example with its current configuration.
- Filter logs by type or text, inspect JSON payloads, pause recording, clear history, or export the filtered entries. The buffer retains 500 entries. `timeupdate` and `progress` are opt-in.
- Resize the desktop panels. On smaller screens, navigation and settings open in sheets and the log scrolls independently.
- Choose Simplified Chinese, Traditional Chinese, English, Japanese or Korean and a light, dark or system theme. Preferences persist locally; the player labels follow the same locale through `MediaI18n` without restarting playback.

The MP4, HLS and audio samples require internet access. Remote media and WebVTT tracks must allow CORS. Fullscreen and picture-in-picture depend on browser support and user activation.

## Structure

`App.vue` composes the workspace. `usePlayground` owns example settings, video/audio selection and player actions; playback state stays in the upstream store. `PlayerModeTabs` renders the accessible player-type tabs. `useEventLog` owns the bounded log. `components/ui` contains the shadcn-vue primitives added with its CLI. `locales` contains five matching message dictionaries and the shared language menu configuration.

## Checks

`pnpm typecheck` at the root checks the library and then the playground SFCs/TSX. The playground pins TypeScript 6 for compatibility with vue-tsc; the library keeps TypeScript 7. Its tsconfig disables `exactOptionalPropertyTypes` for Reka/shadcn optional prop forwarding, while retaining strict checking. `pnpm release:check` also runs formatting, lint, tests and all builds.
