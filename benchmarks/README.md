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

## Video.js 10.3 budget update

The workspace dependency update upgraded Video.js HTML and the optional HLS
adapter from 10.0.1 to 10.3.0 without updating the 10.0.1 bundle ceilings. Six
scenarios already exceeded their budgets before the lifecycle and hydration
fixes below. The HLS scenarios also move hls.js from 1.6.7 to 1.7.3 and account
for most of the growth in bundled upstream code. The wrapper fixes additionally
retain independently cached controls/skins and serialize initial control
configuration for SSR.

The table records gzip bytes with the same Rolldown 1.2.13 measurement setup.
Only exceeded ceilings are raised, retaining approximately 5% headroom rounded
up to 100 bytes. Zero async ceilings, registration checks, optional HLS
isolation, and preset/skin boundaries remain enforced by `pnpm size:check`.

| Scenario / phase       | Previous ceiling | Before wrapper fixes | After fixes | New ceiling |
| ---------------------- | ---------------: | -------------------: | ----------: | ----------: |
| `videoCore` / initial  |           14,400 |               15,022 |      15,088 |      15,900 |
| `videoCore` / total    |           14,400 |               15,022 |      15,088 |      15,900 |
| `audioCore` / initial  |           10,000 |               10,794 |      10,858 |      11,500 |
| `audioCore` / total    |           10,000 |               10,794 |      10,858 |      11,500 |
| `playButton` / initial |           13,400 |               14,073 |      14,554 |      15,300 |
| `playButton` / total   |           13,400 |               14,073 |      14,554 |      15,300 |
| `hlsStatic` / initial  |          254,300 |              274,065 |     274,152 |     287,900 |
| `hlsStatic` / total    |          319,300 |              336,818 |     336,905 |     353,800 |
| `hlsDynamic` / async   |          236,900 |              255,684 |     255,685 |     268,500 |
| `hlsDynamic` / total   |          320,900 |              338,088 |     338,173 |     355,100 |
| `liveButton` / initial |           12,000 |               12,420 |      12,897 |      13,600 |
| `liveButton` / total   |           12,000 |               12,420 |      12,897 |      13,600 |
