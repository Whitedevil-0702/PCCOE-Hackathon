import { v4 as uuid } from 'uuid'
import { computePriority } from './triage'
import { getAll, saveAssessment } from './db'
import { makeThumbnail } from './media'
import { runInference } from './inference'
import { startSync } from './syncEngine'
import type { Assessment, ContextInput, InferenceResult } from './types'

interface DemoScenario { file: string; location: string; context: ContextInput; caption: string }
interface LoadedScenario extends DemoScenario { blob: Blob; result: InferenceResult }

const neutralContext: ContextInput = { populationDensity: 'low', infrastructureNearby: 'none', roadAccess: 'clear' }
const primaryScenarios: DemoScenario[] = [
  {
    file: '/samples/sample3.jpg', location: 'Major Collapse District',
    context: { populationDensity: 'high', infrastructureNearby: 'critical', roadAccess: 'blocked' },
    caption: 'Multiple buildings with major collapse, critical infrastructure, and blocked access',
  },
  {
    file: '/samples/sample6.jpg', location: 'Responder Access Zone',
    context: neutralContext,
    caption: 'Collapsed multi-storey building with responders nearby',
  },
  {
    file: '/samples/sample8.jpg', location: 'Flooded Residential Street',
    context: neutralContext,
    caption: 'Flooded neighborhood with buildings still standing',
  },
]
const lowPriorityCandidates = ['/samples/sample15.jpg', '/samples/sample16.jpg']

async function loadScenario(scenario: DemoScenario, onCaption: (text: string) => void): Promise<LoadedScenario | undefined> {
  try {
    const response = await fetch(scenario.file)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const blob = await response.blob()
    if (!blob.size) throw new Error('empty image')
    const result = await runInference(blob)
    return { ...scenario, blob, result }
  } catch {
    onCaption(`Skipping ${scenario.file}: the demo photo could not be loaded.`)
    return undefined
  }
}

async function saveScenario(scenario: LoadedScenario, seq: number): Promise<Assessment> {
  const { priority, reason } = computePriority(scenario.result.severity, scenario.context)
  const assessment: Assessment = {
    id: uuid(), seq, locationLabel: scenario.location,
    imageDataUrl: await makeThumbnail(scenario.blob), damageClass: scenario.result.damageClass,
    severity: scenario.result.severity, confidence: scenario.result.confidence, inferenceMs: scenario.result.inferenceMs,
    context: scenario.context, priority, priorityReason: reason,
    status: 'queued', attempts: 0, createdAt: Date.now(),
  }
  await saveAssessment(assessment)
  return assessment
}

export async function runDemo(opts: { onCaption: (text: string) => void }): Promise<void> {
  const rows = await getAll()
  let seq = rows.reduce((max, row) => Math.max(max, row.seq || 0), 0)
  const saved: Assessment[] = []

  for (const [index, scenario] of primaryScenarios.entries()) {
    opts.onCaption(`Assessment ${index + 1} of 4: ${scenario.caption}`)
    const loaded = await loadScenario(scenario, opts.onCaption)
    if (!loaded) continue
    try { saved.push(await saveScenario(loaded, ++seq)) }
    catch { opts.onCaption(`Skipping ${scenario.file}: the assessment could not be saved.`) }
  }

  const lowOptions: LoadedScenario[] = []
  for (const file of lowPriorityCandidates) {
    const scenario: DemoScenario = { file, location: 'Intact Building Block', context: neutralContext, caption: 'Checking intact or minor-damage photo' }
    const loaded = await loadScenario(scenario, opts.onCaption)
    if (!loaded) continue
    const isLowDamage = loaded.result.source === 'model'
      && (loaded.result.damageClass === 'intact' || loaded.result.damageClass === 'minor')
      && loaded.result.severity < 45
    if (isLowDamage) lowOptions.push(loaded)
    else opts.onCaption(`Skipping ${file}: the model score does not qualify for the Low-priority example.`)
  }
  lowOptions.sort((a, b) => Number(b.result.damageClass === 'intact') - Number(a.result.damageClass === 'intact')
    || b.result.confidence - a.result.confidence || a.result.severity - b.result.severity)
  const lowSample = lowOptions[0]
  if (lowSample) {
    opts.onCaption(`Assessment 4 of 4: Low-priority example from ${lowSample.file}; priority comes from its severity score.`)
    try { saved.push(await saveScenario(lowSample, ++seq)) }
    catch { opts.onCaption(`Skipping ${lowSample.file}: the assessment could not be saved.`) }
  } else {
    opts.onCaption('Skipping the Low-priority example: no loadable intact or minor sample scored below 45.')
  }

  opts.onCaption(`${saved.length} sample assessment(s) saved locally; syncing will start when connectivity allows.`)
  await startSync()
}
