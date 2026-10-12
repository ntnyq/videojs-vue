# Repository Guidelines

## Project Structure & Module Organization

`videojs-vue` is a Vue 3.5+ component and composable library for Video.js 10. The root package publishes `dist/`; `playground/` and `docs/` are private pnpm workspace packages.

- `src/`: public exports in `index.ts`, player lifecycle/context in `player/`, media adapters in `media/`, reactive helpers in `composables/`, controls in `ui/`, and skins in `skins/`.
- `tests/`: player contract and SSR tests, plus shared browser mocks in `setup.ts`.
- `playground/src/`: Vue TSX demos; `playground/public/` holds static assets, including captions.
- `docs/`: VitePress guides, API documentation, examples, and theme configuration.

## Build, Test, and Development Commands

Use pnpm as pinned in `package.json` and Node LTS (`.node-version`). Run commands from the repository root; apply the agent command wrapper below.

- `pnpm install`: install workspace dependencies.
- `pnpm build`: generate library modules and declarations with tsdown in unbundle mode.
- `pnpm dev`: watch and rebuild library source.
- `pnpm play:dev` / `pnpm docs:dev`: start the playground / documentation site. Build first, then keep `pnpm dev` running; both consume the built package.
- `pnpm test`: run Vitest once; `pnpm test --watch` enables watch mode.
- `pnpm typecheck`: check library, test, and playground types with `tsc` / `vue-tsc`. Build first; package imports resolve declarations from `dist/` through `exports`.
- `pnpm format` / `pnpm format:check`: format / check with Oxfmt; `pnpm lint` runs Oxlint.
- `pnpm release:check`: run formatting, lint, types, tests, and library, playground, and documentation builds.

## Coding Style & Naming Conventions

Use strict TypeScript and ESM, two-space indentation, LF endings, single quotes, no semicolons, and trailing commas. Let Oxfmt manage formatting and imports. Use kebab-case filenames for public UI entries in `src/ui/` to match their export subpaths (`play-button.ts`, `controls.ts`), while keeping component exports in PascalCase. Other component filenames use PascalCase (`VideoPlayer.ts`, `PlayerDemo.tsx`), helpers use camelCase, and composables start with `use`. Keep playback state in the upstream store and HLS dependencies behind the optional `media/hls` entry.

## Testing Guidelines

Add `tests/*.test.ts` cases with descriptive `describe`/`it` names. Vitest defaults to jsdom; SSR tests select Node. Cover public behavior, prop/event forwarding, cleanup, and SSR safety. Mock browser capabilities unavailable in jsdom. No coverage threshold is configured.

## Commit & Pull Request Guidelines

Follow existing prefixes: `feat:`, `refactor:`, `docs:`, and `chore:`. Keep commits focused. PRs should explain behavior changes, link relevant issues, report validation, and include screenshots for visual changes. Update docs/examples for API changes and run `pnpm release:check` before review.

## Agent Commands

Follow `@/Users/ntnyq/.codex/RTK.md`. Prefix shell commands with `rtk`, except typechecking. Use the user-managed pnpm and preserve the existing PATH and active Node version:

```sh
rtk proxy env PATH="/Users/ntnyq/Library/pnpm/bin:$PATH" pnpm build
PATH="/Users/ntnyq/Library/pnpm/bin:$PATH" pnpm typecheck
```

Never modify Codex’s bundled pnpm or runtime cache.
