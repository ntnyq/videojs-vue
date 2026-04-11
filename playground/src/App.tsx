import { defineComponent, reactive } from 'vue'
import { DemoStage } from './components/DemoStage'
import { SettingsPanel } from './components/SettingsPanel'
import { defaultSettings } from './data'

export default defineComponent({
  name: 'PlaygroundApp',
  setup() {
    const settings = reactive({ ...defaultSettings })

    return () => (
      <main class='min-h-screen overflow-hidden bg-[#f3efe7] text-slate-900'>
        <div class='pointer-events-none fixed inset-0 opacity-90'>
          <div class='absolute -left-30 top-0 h-88 w-88 rounded-full bg-[#f6b77d]/30 blur-3xl' />
          <div class='absolute right-[-8rem] top-24 h-96 w-96 rounded-full bg-[#9fd4cb]/26 blur-3xl' />
          <div class='absolute bottom-[-8rem] left-[18%] h-80 w-80 rounded-full bg-[#cad7ff]/28 blur-3xl' />
          <div
            class='absolute inset-0 opacity-40'
            style={{
              backgroundImage:
                'linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        <div class='relative mx-auto grid max-w-[1500px] gap-8 px-4 py-6 md:px-8 xl:grid-cols-[360px_minmax(0,1fr)] xl:px-12 xl:py-10'>
          <div class='grid gap-6'>
            <section class='rounded-[34px] bg-slate-950 p-6 text-white shadow-[0_42px_120px_rgba(15,23,42,0.34)]'>
              <p class='mb-3 text-[10px] font-700 uppercase tracking-[0.4em] text-white/45'>
                videojs-vue
              </p>
              <h1 class='font-display text-[clamp(2.4rem,4vw,4.8rem)] leading-[0.9]'>
                Interactive usage demos for the Vue player API.
              </h1>
              <p class='mt-5 max-w-[32rem] text-[14px] leading-7 text-white/66'>
                Switch between video, audio, and background modes. Every control
                here updates the actual components exported by this repository,
                so the playground doubles as an API contract check.
              </p>
            </section>

            <SettingsPanel
              settings={settings}
              onChange={next => Object.assign(settings, next)}
            />
          </div>

          <DemoStage settings={settings} />
        </div>
      </main>
    )
  },
})
