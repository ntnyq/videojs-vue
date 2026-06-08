# Playground

`playground` and `docs` are private pnpm workspace packages. Both use `videojs-vue: workspace:*`. This site runs VitePress 2.0.0-alpha.20; v2 is still a prerelease.

```sh
pnpm install
pnpm build
pnpm play:dev
# In another terminal:
pnpm docs:dev
```

The playground defaults to port 5174; docs to 5173. Run `pnpm dev` separately to rebuild the package as source changes.

## Scenarios

- Native video with default or neutral skin, captions and settings.
- HLS through the optional `HlsVideo` adapter.
- Composed controls with keyboard shortcuts, a seek slider and an in-container overlay.
- Change a source URL, volume, mute or speed and inspect actual store state.
- Call play / pause / seek, then unmount and mount to exercise cleanup.
- Read meaningful media events and command failures beside the player.

`pnpm release:check` validates the library and builds both workspace sites. The browser's media support and the availability of external demo URLs still determine which playback capabilities work on your machine.
