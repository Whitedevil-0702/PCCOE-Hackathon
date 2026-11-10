import { v4 as uuid } from 'uuid'
import { computePriority } from './triage'
import { getAll, saveAssessment } from './db'
import { makeThumbnail } from './media'
import { runInference } from './inference'
import { startSync } from './syncEngine'
import type { Assessment, ContextInput } from './types'

const scenarios: Array<{ file: string; location: string; context: ContextInput; caption: string }> = [
  {
    file: '/samples/sample3.jpg', location: 'Major Collapse District',
    context: { populationDensity: 'low', infrastructureNearby: 'none', roadAccess: 'clear' },
    caption: 'Multiple buildings with major collapse and debris',
  },
  {
    file: '/samples/sample6.jpg', location: 'Responder Access Zone',
    context: { populationDensity: 'low', infrastructureNearby: 'none', roadAccess: 'clear' },
    caption: 'Collapsed multi-storey building with responders nearby',
  },
  {
    file: '/samples/sample8.jpg', location: 'Flooded Residential Street',
    context: { populationDensity: 'low', infrastructureNearby: 'none', roadAccess: 'clear' },
    caption: 'Flooded neighborhood with buildings still standing',
  },
  {
    file: '/samples/sample15.jpg', location: 'Intact Building Block',
    context: { populationDensity: 'low', infrastructureNearby: 'none', roadAccess: 'clear' },
    caption: 'Low damage sample selected from the newly added intact or minor photos',
  },
]

export async function runDemo(opts: { onCaption: (text: string) => void }): Promise<void> {
  const rows = await getAll()
  let seq = rows.reduce((max, row) => Math.max(max, row.seq || 0), 0)
  for (const [index, scenario] of scenarios.entries()) {
    opts.onCaption(`Assessment ${index + 1} of ${scenarios.length}: ${scenario.caption}`)
    const response = await fetch(scenario.file)
    if (!response.ok) throw new Error(`Unable to load demo sample ${scenario.file}`)
    const blob = await response.blob()
    const result = await runInference(blob)
    const { priority, reason } = computePriority(result.severity, scenario.context)
    const assessment: Assessment = {
      id: uuid(), seq: ++seq, locationLabel: scenario.location,
      imageDataUrl: await makeThumbnail(blob), damageClass: result.damageClass,
      severity: result.severity, confidence: result.confidence, inferenceMs: result.inferenceMs,
      context: scenario.context, priority, priorityReason: reason,
      status: 'queued', attempts: 0, createdAt: Date.now(),
    }
    await saveAssessment(assessment)
  }
  opts.onCaption('Four sample assessments are saved locally; syncing will start when connectivity allows.')
  await startSync()
}
