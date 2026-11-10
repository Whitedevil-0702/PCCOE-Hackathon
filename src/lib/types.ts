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
  seq: number
  locationLabel: string
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

export type AssessStep = 'idle' | 'preprocess' | 'inference' | 'triage' | 'saved'
export type ModelState = 'idle' | 'loading' | 'ready' | 'fallback' | 'error'

export interface Recommendation { id: string; title: string; detail: string; priority: Priority }
export interface SyncPoint { t: number; synced: number; pending: number }
export interface AssessmentDraft {
  imageDataUrl: string
  result: InferenceResult
  context: ContextInput
  lat?: number
  lng?: number
  locationLabel: string
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
  bytesSent: number
  failedWrites: number
}
