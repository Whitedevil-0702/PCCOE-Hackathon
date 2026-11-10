import { v4 as uuid } from 'uuid'
import { db } from './db'
import { computePriority } from './triage'
import type { Assessment, ContextInput, DamageClass } from './types'

const examples: Array<{ damageClass: DamageClass; severity: number; context: ContextInput; locationLabel: string }> = [
  { damageClass: 'destroyed', severity: 94, context: { populationDensity: 'high', infrastructureNearby: 'critical', roadAccess: 'blocked' }, locationLabel: 'North Market' },
  { damageClass: 'severe', severity: 78, context: { populationDensity: 'high', infrastructureNearby: 'some', roadAccess: 'partial' }, locationLabel: 'Riverside Ward' },
  { damageClass: 'moderate', severity: 54, context: { populationDensity: 'medium', infrastructureNearby: 'some', roadAccess: 'clear' }, locationLabel: 'Hillview' },
  { damageClass: 'minor', severity: 28, context: { populationDensity: 'low', infrastructureNearby: 'none', roadAccess: 'clear' }, locationLabel: 'East Quarter' },
  { damageClass: 'intact', severity: 8, context: { populationDensity: 'medium', infrastructureNearby: 'some', roadAccess: 'clear' }, locationLabel: 'Central Depot' },
]

/** Add sample assessments to the local database for a repeatable demo. */
export async function seedDemo(count = 5): Promise<void> {
  const existing = await db.assessments.count()
  const now = Date.now()
  const items: Assessment[] = Array.from({ length: Math.max(0, Math.floor(count)) }, (_, index) => {
    const sample = examples[index % examples.length]
    const { priority, reason } = computePriority(sample.severity, sample.context)
    return {
      id: uuid(), seq: existing + index + 1, locationLabel: sample.locationLabel,
      imageDataUrl: '', damageClass: sample.damageClass, severity: sample.severity,
      confidence: 0, inferenceMs: 0, context: sample.context, priority, priorityReason: reason,
      status: 'queued', attempts: 0, createdAt: now - index * 60_000,
    }
  })
  if (items.length) await db.assessments.bulkAdd(items)
}
