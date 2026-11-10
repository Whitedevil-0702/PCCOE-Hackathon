import Dexie, { type Table } from 'dexie'
import type { Assessment } from './types'

export class ResQDatabase extends Dexie {
  assessments!: Table<Assessment, string>

  constructor() {
    super('resqedge')
    this.version(1).stores({ assessments: 'id, status, priority, createdAt' })
    this.version(2).stores({ assessments: 'id, seq, status, priority, createdAt' })
  }
}

export const db = new ResQDatabase()

export async function saveAssessment(assessment: Assessment): Promise<void> { await db.assessments.put(assessment) }
export async function getQueued(): Promise<Assessment[]> { return db.assessments.where('status').equals('queued').toArray() }
export async function updateAssessment(id: string, changes: Partial<Assessment>): Promise<void> {
  await db.assessments.update(id, changes)
}
export async function getAll(): Promise<Assessment[]> { return db.assessments.toArray() }
