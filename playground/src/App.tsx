import { defineComponent } from 'vue'
import { PlayerDemo } from './components/PlayerDemo'

export default defineComponent({
  name: 'App',
  setup() {
    return () => (
      <main class='app-shell'>
        <header class='site-header'>
          <a
            class='wordmark'
            href='/'
          >
            videojs-vue
          </a>
          <nav aria-label='Resources'>
            <a href='https://github.com/ntnyq/videojs-vue'>GitHub</a>
            <a href='http://localhost:5173/guide/getting-started'>
              Documentation
            </a>
          </nav>
        </header>
        <section class='intro'>
          <h1>
            Make it play.
            <br />
            Make it yours.
          </h1>
          <p>
            Video.js 10, with a Vue interface. Try a complete player, switch to
            HLS, or compose your own controls.
          </p>
        </section>
        <PlayerDemo />
        <footer>
          Vue 3 + Video.js 10{' '}
          <span>Native playback. Shared state. Your interface.</span>
        </footer>
      </main>
    )
  },
})
