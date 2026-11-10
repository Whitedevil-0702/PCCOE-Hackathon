/** Damage label returned by local image assessment. */
export type DamageClass = 'intact' | 'minor' | 'moderate' | 'severe' | 'destroyed'

/** Response triage priority, ordered from highest to lowest urgency. */
export type Priority = 'Critical' | 'High' | 'Medium' | 'Low'

/** Current connectivity condition simulated by the application. */
export type NetworkMode = 'online' | 'offline' | 'weak'

/** Lifecycle state for an assessment waiting to reach the server. */
export type SyncStatus = 'queued' | 'syncing' | 'synced' | 'failed'

/** User supplied context used to inform response triage. */
export interface ContextInput {
  populationDensity: 'low' | 'medium' | 'high'
  infrastructureNearby: 'none' | 'some' | 'critical'
  roadAccess: 'clear' | 'partial' | 'blocked'
}

/** Output contract for on-device inference or its fallback. */
export interface InferenceResult {
  damageClass: DamageClass
  /** Estimated damage severity on a 0–100 scale. */
  severity: number
  /** Model/fallback confidence expressed as a percentage. */
  confidence: number
  /** Wall-clock inference duration in milliseconds. */
  inferenceMs: number
  source: 'model' | 'fallback'
}

/** Persisted field assessment. `imageDataUrl` should contain a small thumbnail. */
export interface Assessment {
  id: string
  imageDataUrl: string
  damageClass: DamageClass
  severity: number
  confidence: number
  inferenceMs: number
  context: ContextInput
  priority: Priority
  priorityReason: string
  lat?: number
  lng?: number
  status: SyncStatus
  attempts: number
  /** Unix epoch timestamp in milliseconds. */
  createdAt: number
  syncedAt?: number
}

/** Discriminated progress events emitted by the sync engine. */
export type SyncEvent =
  | { type: 'item-start'; id: string }
  | { type: 'item-success'; id: string }
  | { type: 'item-retry'; id: string; attempt: number; delayMs: number }
  | { type: 'item-failed'; id: string }
  | { type: 'queue-drained' }

/** Session-measured operational metrics. These are not accuracy claims. */
export interface Metrics {
  avgInferenceMs: number
  totalAssessed: number
  queuedCount: number
  avgQueueWaitMs: number
  syncSuccessRate: number
  retryCount: number
}
