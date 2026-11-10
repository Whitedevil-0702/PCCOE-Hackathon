import type { InferenceResult } from './types'

// TODO(codex): implement
export async function initModel(_onProgress?: (p: number) => void): Promise<void> {}

// TODO(codex): implement
export async function isModelCached(): Promise<boolean> { return false }

// TODO(codex): implement
export async function runInference(_image: Blob | string): Promise<InferenceResult> {
  return { damageClass: 'intact', severity: 0, confidence: 0, inferenceMs: 0, source: 'fallback' }
}
