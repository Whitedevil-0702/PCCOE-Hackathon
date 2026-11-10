import { db } from './db'
import type { Metrics } from './types'

const listeners = new Set<(metrics: Metrics) => void>()
const session = { inference: [] as number[], retries: 0, successes: 0, failedWrites: 0, bytesSent: 0 }
const zero: Metrics = { avgInferenceMs: 0, totalAssessed: 0, queuedCount: 0, avgQueueWaitMs: 0, syncSuccessRate: 0, retryCount: 0, bytesSent: 0, failedWrites: 0 }

export async function getMetrics(): Promise<Metrics> {
  const rows = await db.assessments.toArray()
  const waits = rows.filter((row) => row.syncedAt !== undefined).map((row) => Math.max(0, row.syncedAt! - row.createdAt))
  const completed = session.successes + session.failedWrites
  return {
    avgInferenceMs: session.inference.length ? Math.round(session.inference.reduce((sum, value) => sum + value, 0) / session.inference.length) : 0,
    totalAssessed: rows.length,
    queuedCount: rows.filter((row) => row.status === 'queued' || row.status === 'syncing').length,
    avgQueueWaitMs: waits.length ? Math.round(waits.reduce((sum, value) => sum + value, 0) / waits.length) : 0,
    syncSuccessRate: completed ? Math.round(session.successes / completed * 100) : 0,
    retryCount: session.retries,
    bytesSent: session.bytesSent,
    failedWrites: session.failedWrites,
  }
}

async function publish(): Promise<void> {
  const metrics = await getMetrics().catch(() => ({ ...zero }))
  listeners.forEach((listener) => listener(metrics))
}

export function subscribeMetrics(cb: (metrics: Metrics) => void): () => void {
  listeners.add(cb)
  void getMetrics().then(cb).catch(() => cb({ ...zero }))
  return () => listeners.delete(cb)
}

export function recordInference(durationMs: number): void {
  session.inference.push(Math.max(0, durationMs))
  void publish()
}
export function recordRetry(): void { session.retries += 1; void publish() }
export function recordSyncSuccess(): void { session.successes += 1; void publish() }
export function recordFailedWrite(): void { session.failedWrites += 1; void publish() }
export function recordBytesSent(bytes: number): void { session.bytesSent += Math.max(0, bytes); void publish() }
void db.assessments.hook('creating', () => { void publish() })
void db.assessments.hook('updating', () => { void publish() })
void db.assessments.hook('deleting', () => { void publish() })
