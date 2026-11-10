import Dexie, { type Table } from 'dexie'
import type { Assessment } from './types'

export class ResQDatabase extends Dexie {
  assessments!: Table<Assessment, string>

  constructor() {
    super('resqedge')
    this.version(1).stores({ assessments: 'id, status, priority, createdAt' })
  }
}

export const db = new ResQDatabase()

// TODO(codex): implement
export async function saveAssessment(assessment: Assessment): Promise<void> { await db.assessments.put(assessment) }
// TODO(codex): implement
export async function getQueued(): Promise<Assessment[]> { return db.assessments.where('status').equals('queued').toArray() }
// TODO(codex): implement
export async function updateAssessment(id: string, changes: Partial<Assessment>): Promise<void> {
  await db.assessments.update(id, changes)
}
// TODO(codex): implement
export async function getAll(): Promise<Assessment[]> { return db.assessments.toArray() }
