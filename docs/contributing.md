---
description: Develop the library, playground, and documentation locally and validate changes.
---

# Contributing

The [repository](https://github.com/ntnyq/videojs-vue) contains the publishable library and two private pnpm workspace packages.

## Repository layout

| Directory     | Responsibility                                                       |
| ------------- | -------------------------------------------------------------------- |
| `src/`        | Public components, composables, media adapters, controls, and skins. |
| `tests/`      | Public contract, lifecycle, control, HLS, i18n, and SSR tests.       |
| `playground/` | Interactive Vue examples that consume the built library.             |
| `docs/`       | VitePress guides, API reference, and examples.                       |

The hosted sites are the [documentation](https://videojs-vue-docs.vercel.app) and [Playground](https://videojs-vue-playground.vercel.app).

## Local development

Use Node LTS as specified by `.node-version` and the pnpm version pinned in `package.json`. From the repository root:

```sh
pnpm install
pnpm build
```

Both sites consume the library's built output through `workspace:*`. Type checking also resolves package imports through `package.json` exports and the declarations in `dist/`, so run `pnpm build` before `pnpm typecheck` on a fresh checkout. When editing library source, keep the build watcher running in a separate terminal:

```sh
pnpm dev
```

Start the site you are working on:

```sh
pnpm docs:dev
```

```sh
pnpm play:dev
```

Use the URL printed by each dev server. Stop and restart the relevant process after changing configuration if the change is not picked up automatically.

## Package entry points

tsdown builds `src/**/*.ts` with `unbundle: true`, preserving the source module structure in `dist/`. Public UI entry filenames use kebab-case to match their package subpaths. Registration modules remain separate and are marked in `sideEffects` so consumer bundlers retain required custom element registration.

`package.json` explicitly lists the supported import paths. Each JavaScript export explicitly declares its `types` and `default` targets, with `types` listed first. Adding a source file includes it in the build; add an export only when it should become public API. Internal modules remain outside the export map.

## Documentation conventions

Keep pages focused on a reader's task:

- `guide/` explains setup, usage, concepts, and troubleshooting.
- `api/` specifies exports, types, defaults, events, slots, and lifecycle contracts.
- `examples/` provides reproducible code and links to the hosted Playground.

Use English prose, descriptive headings, and a frontmatter description. Write Vue examples with `<script setup lang="ts">`, explicit imports, and available public exports. Explain placeholder assets and required optional dependencies.

Keep existing page URLs when reorganizing content, update navigation in `.vitepress/config.mts`, and check cross-links. Direct Playground links should use `https://videojs-vue-playground.vercel.app`.

## Validate changes

Run the complete check before review:

```sh
pnpm release:check
```

It checks formatting, lint, types, source tests, published-entry behavior and bundle budgets, and builds the library, playground, and documentation. See [bundle measurements](./guide/bundle-size.md#reproduce-measurements) for the individual commands. `pnpm docs:build` checks document rendering and internal page links; run `pnpm build` first when the library output is missing or outdated.

Use browser checks for changes to media playback or controls. Include screenshots for visual changes and describe relevant validation in the pull request. Commit messages follow the existing `feat:`, `refactor:`, `docs:`, and `chore:` prefixes.
