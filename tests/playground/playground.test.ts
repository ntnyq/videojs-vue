import { describe, expect, it } from 'vitest'
import { effectScope } from 'vue'
import { parse, compileScript, compileTemplate } from 'vue/compiler-sfc'
import { useEventLog } from '../../playground/src/composables/useEventLog'
import { usePlayground } from '../../playground/src/composables/usePlayground'
import { createConfig, EXAMPLES, LOG_LIMIT } from '../../playground/src/data'
import { createExampleCode } from '../../playground/src/lib/createExampleCode'

describe('playground event log', () => {
  it('bounds retained entries without reusing identifiers after clearing', () => {
    expect.hasAssertions()
    const log = useEventLog()
    for (let index = 0; index < LOG_LIMIT + 3; index++) {
      log.record('event', 'play', { index })
    }
    expect(log.entries.value).toHaveLength(LOG_LIMIT)
    expect(JSON.parse(log.entries.value[0]!.payload)).toStrictEqual({
      index: 3,
    })
    const lastId = log.entries.value.at(-1)!.id
    log.clear()
    log.record('lifecycle', 'ready')
    expect(log.entries.value[0]!.id).toBeGreaterThan(lastId)
  })

  it('pauses recording and makes noisy events opt-in', () => {
    expect.hasAssertions()
    const log = useEventLog()
    log.record('event', 'timeupdate')
    expect(log.entries.value).toHaveLength(0)
    log.includesHighFrequency.value = true
    log.record('event', 'timeupdate')
    log.isRecording.value = false
    log.record('event', 'play')
    expect(log.entries.value.map(entry => entry.name)).toStrictEqual([
      'timeupdate',
    ])
    log.isRecording.value = true
    log.record('event', 'pause')
    expect(log.entries.value).toHaveLength(2)
  })

  it('combines kind and payload filters while retaining unfiltered history', () => {
    expect.hasAssertions()
    const log = useEventLog()
    const payload = { volume: 0.35 }
    log.record('event', 'volumechange', payload)
    payload.volume = 1
    log.record('action', 'setVolume()', { volume: 0.35 })
    log.kind.value = 'event'
    log.query.value = ' VOLUME '
    expect(log.filtered.value).toHaveLength(1)
    expect(JSON.parse(log.filtered.value[0]!.payload)).toStrictEqual({
      volume: 0.35,
    })
    log.query.value = '0.35'
    expect(log.filtered.value).toHaveLength(1)
    expect(log.entries.value).toHaveLength(2)
    log.clear()
    expect(log.filtered.value).toStrictEqual([])
  })
})

describe('copyable playground examples', () => {
  it.each(EXAMPLES)('generates a compilable Vue SFC for $id', ({ id }) => {
    expect.hasAssertions()
    const code = createExampleCode(id, createConfig(id), 'composable')
    const { descriptor, errors } = parse(code)
    expect(errors).toStrictEqual([])
    expect(() => compileScript(descriptor, { id: 'example' })).not.toThrow()
    const template = compileTemplate({
      id: 'example',
      filename: 'Example.vue',
      source: descriptor.template!.content,
    })
    expect(template.errors).toStrictEqual([])
  })

  it('generates the independent audio API without video options', () => {
    expect.hasAssertions()
    const code = createExampleCode('audio', createConfig('audio'), 'composable')
    expect(code).toContain("from 'videojs-vue/audio'")
    expect(code).toContain('<AudioPlayer')
    expect(code).toContain('useAudioPlayerActions(player)')
    expect(code).toContain(
      'useAudioPlayerState(state => state.currentTime, player)',
    )
    expect(code).not.toContain('playsinline')
    expect(code).not.toContain('requestFullscreen')
  })

  it('generates live APIs and omits unsupported playback speed bindings', () => {
    expect.hasAssertions()
    const code = createExampleCode('live', createConfig('live'), 'composable')
    expect(code).toContain("from 'videojs-vue/live'")
    expect(code).toContain('<LiveVideoPlayer')
    expect(code).toContain('useLiveVideoPlayerActions(player)')
    expect(code).toContain(
      'useLiveVideoPlayerState(state => state.currentTime, player)',
    )
    expect(code).toContain(':media="HlsVideo"')
    expect(code).not.toContain('playbackRate')
    expect(code).not.toContain('playback-rate')
  })

  it('escapes user-provided script delimiters and reflects the selected action target', () => {
    expect.hasAssertions()
    const config = createConfig('hls')
    config.src = 'https://example.com/</script><script>alert(1)</script>.m3u8'
    config.volume = 0.25
    const code = createExampleCode('hls', config, 'ref')
    const { descriptor, errors } = parse(code)
    expect(errors).toStrictEqual([])
    expect(descriptor.scriptSetup?.content).toContain('player.value?.play()')
    expect(descriptor.scriptSetup?.content).toContain('"volume": 0.25')
    expect(descriptor.scriptSetup?.content).not.toContain('</script>')
    expect(descriptor.template?.content).toContain(':media="HlsVideo"')
  })
})

describe('playground lifecycle', () => {
  it('starts with video and switches audio back to the last video example', () => {
    expect.hasAssertions()
    const scope = effectScope()
    const lab = scope.run(() => usePlayground())!
    expect(lab.playerType).toBe('video')
    expect(lab.example).toBe('basic')
    lab.selectExample('captions')
    expect(lab.config.hasCaptions).toBe(true)
    lab.selectPlayerType('audio')
    expect(lab.playerType).toBe('audio')
    expect(lab.example).toBe('audio')
    expect(lab.config.src).toBe(createConfig('audio').src)
    expect(lab.config.hasCaptions).toBe(false)
    expect(lab.canFullscreen).toBe(false)
    expect(lab.canPip).toBe(false)
    lab.toggleMount()
    lab.failure = 'Previous playback error'
    const { generation } = lab
    lab.selectPlayerType('video')
    expect(lab.example).toBe('captions')
    expect(lab.playerType).toBe('video')
    expect(lab.isMounted).toBe(true)
    expect(lab.failure).toBe('')
    expect(lab.config.hasCaptions).toBe(true)
    expect(lab.generation).toBe(generation + 1)
    lab.selectPlayerType('video')
    expect(lab.generation).toBe(generation + 1)
    lab.selectExample('audio')
    expect(lab.playerType).toBe('audio')
    lab.selectExample('hls')
    expect(lab.playerType).toBe('video')
    scope.stop()
  })

  it('resets changed props when moving between media examples', () => {
    expect.hasAssertions()
    const scope = effectScope()
    const lab = scope.run(() => usePlayground())!
    lab.updateConfig('volume', 0.2)
    lab.updateConfig('loop', true)
    lab.selectExample('hls')
    expect(lab.config.src).toMatch(/\.m3u8$/u)
    expect(lab.config.volume).toBe(0.7)
    expect(lab.config.loop).toBe(false)
    lab.toggleMount()
    expect(lab.isMounted).toBe(false)
    lab.reset()
    expect(lab.isMounted).toBe(true)
    expect(lab.isReady).toBe(false)
    scope.stop()
  })

  it('captures unavailable-player command failures without rejecting to the UI', async () => {
    expect.hasAssertions()
    const scope = effectScope()
    const lab = scope.run(() => usePlayground())!
    await expect(lab.run('play')).resolves.toBeUndefined()
    expect(lab.failure).toContain('not ready')
    expect(lab.log.entries.map(entry => entry.kind)).toStrictEqual([
      'action',
      'error',
    ])
    lab.actionTarget = 'ref'
    await expect(lab.run('seek', 10)).resolves.toBeUndefined()
    expect(lab.failure).toContain('not ready')
    scope.stop()
  })
})
