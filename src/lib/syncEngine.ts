import { getNetworkMode, subscribeNetworkMode } from './networkSim'
import type { SyncEvent } from './types'

const listeners = new Set<(event: SyncEvent) => void>()
let running = false
subscribeNetworkMode((mode) => { if (mode === 'online') void startSync() })

// TODO(codex): implement
export async function startSync(): Promise<void> {
  if (running || getNetworkMode() !== 'online') return
  running = true
  try { listeners.forEach((listener) => listener({ type: 'queue-drained' })) } finally { running = false }
}
// TODO(codex): implement
export function stopSync(): void { running = false }
// TODO(codex): implement
export function subscribeSync(cb: (e: SyncEvent) => void): () => void {
  listeners.add(cb)
  return () => listeners.delete(cb)
}
