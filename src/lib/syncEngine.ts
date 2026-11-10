import { getNetworkMode, simFetch, subscribeNetworkMode } from './networkSim'
import { getQueued, updateAssessment } from './db'
import { recordFailedWrite, recordRetry, recordSyncSuccess } from './metrics'
import type { SyncEvent } from './types'

const listeners = new Set<(event: SyncEvent) => void>()
let running = false
subscribeNetworkMode((mode) => { if (mode === 'online') void startSync() })

export async function startSync(): Promise<void> {
  if (running || getNetworkMode() !== 'online') return
  running = true
  try {
    const rank = { Critical: 0, High: 1, Medium: 2, Low: 3 }
    while (running && getNetworkMode() !== 'offline') {
      const queue = (await getQueued()).sort((a, b) => rank[a.priority] - rank[b.priority] || a.createdAt - b.createdAt)
      const assessment = queue[0]
      if (!assessment) break
      await updateAssessment(assessment.id, { status: 'syncing' })
      listeners.forEach((listener) => listener({ type: 'item-start', id: assessment.id }))
      try {
        const response = await simFetch('/api/sync', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': assessment.id }, body: JSON.stringify(assessment) })
        if (!response.ok) throw new Error(`Sync request failed (${response.status})`)
        await updateAssessment(assessment.id, { status: 'synced', syncedAt: Date.now() })
        recordSyncSuccess()
        listeners.forEach((listener) => listener({ type: 'item-success', id: assessment.id }))
      } catch {
        const attempt = assessment.attempts + 1
        const terminal = attempt >= 5
        await updateAssessment(assessment.id, { attempts: attempt, status: terminal ? 'failed' : 'queued' })
        if (terminal) {
          recordFailedWrite()
          listeners.forEach((listener) => listener({ type: 'item-failed', id: assessment.id }))
        } else {
          const delayMs = Math.min(30_000, 1000 * 2 ** (attempt - 1))
          recordRetry()
          listeners.forEach((listener) => listener({ type: 'item-retry', id: assessment.id, attempt, delayMs }))
          await new Promise((resolve) => setTimeout(resolve, delayMs))
          if (getNetworkMode() !== 'online') break
        }
      }
    }
  } finally {
    running = false
    listeners.forEach((listener) => listener({ type: 'queue-drained' }))
  }
}
export function stopSync(): void { running = false }
export function subscribeSync(cb: (e: SyncEvent) => void): () => void {
  listeners.add(cb)
  return () => listeners.delete(cb)
}
