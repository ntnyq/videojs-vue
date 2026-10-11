# Consumer bundle measurements

`baseline.json` was captured before the entry split from commit `0632d76`, using
Rolldown 1.2.13, production defines, minification, and gzip level 9. Sizes are
bytes. Vue is external; Video.js and other dependencies are bundled normally.
`videoDefault` and `audioDefault` refer to aggregate players in the baseline,
and to fixed default-skin entries in current measurements.

Run `pnpm build && pnpm size` for current results. The full report, including
static and dynamic chunk imports and normalized module IDs, is written to
`.cache/bundle-size/report.json`. Initial sizes include all statically reachable
chunks; asynchronous and total sizes sum each emitted chunk once. Lazy locale
chunks are included in the asynchronous totals, not assumed to be downloaded
on initial load.

`budgets.json` has fixed gzip ceilings with approximately 5% headroom, rounded
up to the next 100 bytes. Scenarios without async imports retain a zero async
budget. `pnpm size:check` enforces both these ceilings and module boundaries,
including positive checks that required custom-element registrations survive.
Do not raise a budget without investigating and explaining the change.

The `--baseline` option is for explicitly recording legacy-entry measurements;
it overwrites `baseline.json`. It cannot reconstruct the historical commit from
the current source tree. CI never uses that option or updates budgets.

`pnpm play:build && pnpm size:play` separately measures the default playground
page through Vite's manifest, including Vue and demo UI dependencies. It also
checks that audio, custom-control, and HLS examples remain lazy.
