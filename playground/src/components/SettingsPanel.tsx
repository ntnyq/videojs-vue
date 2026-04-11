import { computed, defineComponent } from 'vue'
import type { PropType } from 'vue'
import {
  aspectRatios,
  audioSources,
  backgroundSources,
  videoSources,
} from '../data'
import type { DemoMode, DemoSettings } from '../data'

interface ToggleItem {
  key: keyof Pick<
    DemoSettings,
    'autoplay' | 'muted' | 'loop' | 'playsInline' | 'controls'
  >
  label: string
  description: string
  disabled?: boolean
}

export const SettingsPanel = defineComponent({
  name: 'SettingsPanel',
  props: {
    settings: {
      type: Object as PropType<DemoSettings>,
      required: true,
    },
  },
  emits: {
    change: (_next: DemoSettings) => true,
  },
  setup(props, { emit }) {
    const sourceOptions = computed(() => {
      if (props.settings.mode === 'audio') {
        return audioSources
      }

      if (props.settings.mode === 'background') {
        return backgroundSources
      }

      return videoSources
    })

    const currentSource = computed(() => {
      if (props.settings.mode === 'audio') {
        return props.settings.audioSource
      }

      if (props.settings.mode === 'background') {
        return props.settings.backgroundSource
      }

      return props.settings.videoSource
    })

    const toggles = computed<ToggleItem[]>(() => [
      {
        key: 'autoplay',
        label: 'Autoplay',
        description: 'Auto-start when the media becomes ready.',
      },
      {
        key: 'muted',
        label: 'Muted',
        description: 'Start silent to avoid browser autoplay restrictions.',
      },
      {
        key: 'loop',
        label: 'Loop',
        description: 'Replay continuously after reaching the end.',
      },
      {
        key: 'playsInline',
        label: 'Inline',
        description: 'Prefer inline playback on mobile browsers.',
        disabled: props.settings.mode === 'audio',
      },
      {
        key: 'controls',
        label: 'Native Controls',
        description: 'Show browser-native controls on the media element.',
        disabled: props.settings.mode === 'background',
      },
    ])

    function patch(settings: Partial<DemoSettings>) {
      emit('change', {
        ...props.settings,
        ...settings,
      })
    }

    function updateSource(mode: DemoMode, value: string) {
      if (mode === 'audio') {
        patch({ audioSource: value })
        return
      }

      if (mode === 'background') {
        patch({ backgroundSource: value })
        return
      }

      patch({ videoSource: value })
    }

    return () => (
      <aside class='rounded-[28px] border border-white/60 bg-white/72 p-5 shadow-[0_32px_90px_rgba(15,23,42,0.13)] backdrop-blur-xl'>
        <div class='mb-5 flex items-start justify-between gap-4'>
          <div>
            <p class='mb-2 text-[10px] font-600 uppercase tracking-[0.35em] text-slate-400'>
              Playground Settings
            </p>
            <h2 class='font-display text-[24px] leading-none text-slate-900'>
              Tune the player surface
            </h2>
          </div>
          <div class='rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-600 uppercase tracking-[0.2em] text-slate-500'>
            {props.settings.mode}
          </div>
        </div>

        <div class='space-y-5'>
          <section class='grid gap-3'>
            <label class='grid gap-2'>
              <span class='text-[11px] font-700 uppercase tracking-[0.24em] text-slate-400'>
                Demo Mode
              </span>
              <div class='grid grid-cols-3 gap-2 rounded-[22px] bg-slate-100 p-1.5'>
                {(['video', 'audio', 'background'] as DemoMode[]).map(mode => (
                  <button
                    key={mode}
                    type='button'
                    class={[
                      'rounded-[16px] px-3 py-2 text-[12px] font-700 uppercase tracking-[0.18em] transition',
                      props.settings.mode === mode
                        ? 'bg-slate-950 text-white shadow-[0_16px_35px_rgba(15,23,42,0.24)]'
                        : 'text-slate-500 hover:bg-white hover:text-slate-900',
                    ]}
                    onClick={() => patch({ mode })}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </label>

            <label class='grid gap-2'>
              <span class='text-[11px] font-700 uppercase tracking-[0.24em] text-slate-400'>
                Media Source
              </span>
              <select
                class='rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-[14px] text-slate-700 outline-none transition focus:border-slate-900'
                value={currentSource.value}
                onChange={event =>
                  updateSource(
                    props.settings.mode,
                    (event.target as HTMLSelectElement).value,
                  )
                }
              >
                {sourceOptions.value.map(source => (
                  <option
                    key={source.value}
                    value={source.value}
                  >
                    {source.label}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section class='grid gap-3'>
            <div class='flex items-center justify-between'>
              <span class='text-[11px] font-700 uppercase tracking-[0.24em] text-slate-400'>
                Stage Width
              </span>
              <span class='rounded-full bg-slate-100 px-3 py-1 text-[12px] font-700 text-slate-700'>
                {props.settings.width}px
              </span>
            </div>
            <input
              class='accent-slate-950'
              type='range'
              min='480'
              max='1280'
              step='20'
              value={props.settings.width}
              onInput={event =>
                patch({
                  width: Number((event.target as HTMLInputElement).value),
                })
              }
            />

            <label class='grid gap-2'>
              <span class='text-[11px] font-700 uppercase tracking-[0.24em] text-slate-400'>
                Aspect Ratio
              </span>
              <select
                class='rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-[14px] text-slate-700 outline-none transition focus:border-slate-900'
                value={props.settings.aspectRatio}
                onChange={event =>
                  patch({
                    aspectRatio: (event.target as HTMLSelectElement)
                      .value as DemoSettings['aspectRatio'],
                  })
                }
              >
                {aspectRatios.map(ratio => (
                  <option
                    key={ratio}
                    value={ratio}
                  >
                    {ratio}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section class='grid gap-3'>
            <span class='text-[11px] font-700 uppercase tracking-[0.24em] text-slate-400'>
              Media Flags
            </span>
            <div class='grid gap-2'>
              {toggles.value.map(toggle => (
                <label
                  key={toggle.key}
                  class={[
                    'grid grid-cols-[auto_1fr] items-start gap-3 rounded-[20px] border p-3 transition',
                    toggle.disabled
                      ? 'border-slate-100 bg-slate-50/80 opacity-60'
                      : 'border-slate-200 bg-white hover:border-slate-300',
                  ]}
                >
                  <input
                    class='mt-1 h-4 w-4 accent-slate-950'
                    type='checkbox'
                    checked={Boolean(props.settings[toggle.key])}
                    disabled={toggle.disabled}
                    onChange={event =>
                      patch({
                        [toggle.key]: (event.target as HTMLInputElement)
                          .checked,
                      })
                    }
                  />
                  <span class='grid gap-1'>
                    <span class='text-[13px] font-700 text-slate-900'>
                      {toggle.label}
                    </span>
                    <span class='text-[12px] leading-5 text-slate-500'>
                      {toggle.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </section>
        </div>
      </aside>
    )
  },
})
