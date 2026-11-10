import type { Metrics } from './types'

const listeners = new Set<(metrics: Metrics) => void>()
const emptyMetrics: Metrics = { avgInferenceMs: 0, totalAssessed: 0, queuedCount: 0, avgQueueWaitMs: 0, syncSuccessRate: 0, retryCount: 0 }

// TODO(codex): implement
export async function getMetrics(): Promise<Metrics> { return { ...emptyMetrics } }
// TODO(codex): implement
export function subscribeMetrics(cb: (metrics: Metrics) => void): () => void {
  listeners.add(cb)
  return () => listeners.delete(cb)
}
