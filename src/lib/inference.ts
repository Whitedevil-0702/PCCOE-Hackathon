import type { DamageClass, InferenceResult } from './types'
import { recordInference } from './metrics'

type Classifier = (image: Blob | string, labels: string[]) => Promise<Array<{ label: string; score: number }>>
let classifier: Classifier | undefined
let modelPromise: Promise<void> | undefined
let modelReady = false
const labels: DamageClass[] = ['intact', 'minor', 'moderate', 'severe', 'destroyed']

export async function initModel(onProgress?: (progress: number) => void): Promise<void> {
  if (modelReady) { onProgress?.(100); return }
  if (!modelPromise) {
    modelPromise = (async () => {
      const transformers = await import('@huggingface/transformers')
      transformers.env.allowLocalModels = true
      transformers.env.allowRemoteModels = true
      const pipe = await transformers.pipeline('zero-shot-image-classification', 'Xenova/clip-vit-base-patch32', {
        progress_callback: (event) => onProgress?.(Math.round('progress' in event ? event.progress ?? 0 : 0)),
      }) as unknown as Classifier
      classifier = pipe
      modelReady = true
      onProgress?.(100)
    })().catch((error) => { modelPromise = undefined; throw error })
  }
  await modelPromise
}

export async function isModelCached(): Promise<boolean> {
  if (modelReady) return true
  if (typeof caches === 'undefined') return false
  try {
    const keys = await caches.keys()
    return keys.some((key) => /transformers|huggingface/i.test(key))
  } catch { return false }
}

async function fallback(image: Blob | string, inferenceMs: number): Promise<InferenceResult> {
  // A coarse, transparent heuristic from image brightness and contrast. It is
  // only used when the classifier is unavailable and must not imply certainty.
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 32; canvas.height = 32
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) throw new Error('Canvas unavailable')
    const imageElement = new Image()
    const url = typeof image === 'string' ? image : URL.createObjectURL(image)
    return await new Promise<InferenceResult>((resolve) => {
      imageElement.onload = () => {
        try {
          context.drawImage(imageElement, 0, 0, 32, 32)
          const pixels = context.getImageData(0, 0, 32, 32).data
          let brightness = 0; let variance = 0
          for (let i = 0; i < pixels.length; i += 4) brightness += (pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114)
          brightness /= 1024
          for (let i = 0; i < pixels.length; i += 4) { const y = pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114; variance += (y - brightness) ** 2 }
          variance /= 1024
          const severity = Math.round(Math.max(0, Math.min(100, (100 - brightness) * 0.55 + Math.sqrt(variance) * 0.7)))
          const damageClass: DamageClass = severity < 15 ? 'intact' : severity < 35 ? 'minor' : severity < 58 ? 'moderate' : severity < 78 ? 'severe' : 'destroyed'
          if (typeof image !== 'string') URL.revokeObjectURL(url)
          resolve({ damageClass, severity, confidence: 25, inferenceMs, source: 'fallback' })
        } catch { resolve({ damageClass: 'moderate', severity: 50, confidence: 0, inferenceMs, source: 'fallback' }) }
      }
      imageElement.onerror = () => resolve({ damageClass: 'moderate', severity: 50, confidence: 0, inferenceMs, source: 'fallback' })
      imageElement.src = url
    })
  } catch { return { damageClass: 'moderate', severity: 50, confidence: 0, inferenceMs, source: 'fallback' } }
}

export async function runInference(image: Blob | string): Promise<InferenceResult> {
  const started = performance.now()
  let result: InferenceResult
  try {
    if (!classifier) await initModel()
    const output = await classifier!(image, labels.map((label) => `a disaster damage assessment photo showing ${label} damage`))
    const best = output[0]
    if (!best) throw new Error('No classifier result')
    const classIndex = labels.findIndex((label) => best.label.toLowerCase().includes(label))
    if (classIndex < 0) throw new Error('Classifier returned an unknown label')
    const damageClass = labels[classIndex]
    result = { damageClass, severity: [5, 25, 48, 73, 94][classIndex], confidence: Math.round(best.score * 100), inferenceMs: Math.round(performance.now() - started), source: 'model' }
  } catch { result = await fallback(image, Math.round(performance.now() - started)) }
  result.inferenceMs = Math.round(performance.now() - started)
  recordInference(result.inferenceMs)
  return result
}
