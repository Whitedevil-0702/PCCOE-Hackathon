import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Assessment, InferenceResult } from '../src/lib/types'

const mocks = vi.hoisted(() => ({
  rows: [] as Assessment[],
  resultQueue: [] as InferenceResult[],
  saved: [] as Assessment[],
  startSync: vi.fn(),
}))
vi.mock('../src/lib/db', () => ({
  getAll: async () => mocks.rows,
  saveAssessment: async (assessment: Assessment) => { mocks.saved.push(assessment) },
}))
vi.mock('../src/lib/inference', () => ({ runInference: async () => mocks.resultQueue.shift()! }))
vi.mock('../src/lib/media', () => ({ makeThumbnail: async () => 'data:image/jpeg;base64,demo' }))
vi.mock('../src/lib/syncEngine', () => ({ startSync: mocks.startSync }))

import { runDemo } from '../src/lib/demoMode'

const result = (damageClass: InferenceResult['damageClass'], severity: number): InferenceResult => ({
  damageClass, severity, confidence: 80, inferenceMs: 10, source: 'model',
})

describe('runDemo', () => {
  beforeEach(() => {
    mocks.rows = []; mocks.resultQueue = []; mocks.saved = []; mocks.startSync.mockReset()
    vi.unstubAllGlobals()
  })

  it('saves the four severity-led priorities and selects the best intact candidate', async () => {
    mocks.resultQueue = [result('severe', 75.5), result('severe', 67.1), result('moderate', 47.9), result('minor', 25), result('intact', 5)]
    vi.stubGlobal('fetch', vi.fn(async () => new Response(new Blob(['sample']), { status: 200 })))
    const captions: string[] = []
    await runDemo({ onCaption: (caption) => captions.push(caption) })
    expect(mocks.saved.map((row) => row.priority)).toEqual(['Critical', 'High', 'Medium', 'Low'])
    expect(mocks.saved[3].damageClass).toBe('intact')
    expect(mocks.saved[3].severity).toBe(5)
    expect(mocks.saved[3].priorityReason).toContain('limited reported damage')
    expect(captions.some((caption) => caption.includes('sample16.jpg'))).toBe(true)
    expect(mocks.startSync).toHaveBeenCalledOnce()
  })

  it('skips photos that fail to load and completes without throwing', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 404 })))
    const captions: string[] = []
    await expect(runDemo({ onCaption: (caption) => captions.push(caption) })).resolves.toBeUndefined()
    expect(mocks.saved).toHaveLength(0)
    expect(captions.filter((caption) => caption.includes('Skipping /samples/'))).toHaveLength(5)
    expect(mocks.startSync).toHaveBeenCalledOnce()
  })
})
