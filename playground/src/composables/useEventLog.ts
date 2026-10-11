import { computed, shallowRef } from 'vue'
import { LOG_LIMIT } from '../data'
import type { LogEntry, LogKind } from '../data'

export function useEventLog() {
  const entries = shallowRef<LogEntry[]>([])
  const isRecording = shallowRef(true)
  const includesHighFrequency = shallowRef(false)
  const query = shallowRef('')
  const kind = shallowRef('all')
  let sequence = 0
  const filtered = computed(() => {
    const search = query.value.trim().toLowerCase()
    return entries.value.filter(
      entry =>
        (kind.value === 'all' || entry.kind === kind.value) &&
        `${entry.name} ${entry.payload}`.toLowerCase().includes(search),
    )
  })
  function record(entryKind: LogKind, name: string, payload: unknown = {}) {
    if (!isRecording.value) {
      return
    }
    if (
      !includesHighFrequency.value &&
      ['timeupdate', 'progress'].includes(name)
    ) {
      return
    }
    entries.value = [
      ...entries.value,
      {
        id: ++sequence,
        timestamp: new Date().toISOString(),
        kind: entryKind,
        name,
        payload: JSON.stringify(payload) ?? '{}',
      },
    ].slice(-LOG_LIMIT)
  }
  function clear() {
    entries.value = []
  }
  function exportLog() {
    const content = filtered.value.map(entry => ({
      ...entry,
      payload: JSON.parse(entry.payload) as unknown,
    }))
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(content, null, 2)], {
        type: 'application/json',
      }),
    )
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'videojs-vue-events.json'
    anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return {
    entries,
    isRecording,
    includesHighFrequency,
    query,
    kind,
    filtered,
    record,
    clear,
    exportLog,
  }
}
