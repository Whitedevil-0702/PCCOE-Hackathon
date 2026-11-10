import { readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { performance } from 'node:perf_hooks'
import { pipeline } from '@huggingface/transformers'

const sampleDir = resolve('public/samples')
const imagePattern = /\.(png|jpe?g|webp)$/i
function findImages(directory, relative = '') {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = join(relative, entry.name)
    const fullPath = join(directory, entry.name)
    if (entry.isDirectory()) return findImages(fullPath, relativePath)
    return entry.isFile() && imagePattern.test(entry.name) ? [{ file: relativePath.replaceAll('\\', '/'), path: fullPath }] : []
  })
}

const descriptions = {
  'sample1.jpg': 'Multi-storey building collapsed into rubble',
  'sample2.jpg': 'Partly collapsed house with cracked walls and rubble',
  'sample3.jpg': 'Several buildings with major collapse and debris',
  'sample4.jpg': 'Severely damaged building with partial floor collapse',
  'sample5.jpg': 'Two views of partly collapsed buildings and rubble',
  'sample6.jpg': 'Collapsed multi-storey building with responders nearby',
  'sample7.jpg': 'Residential building with widespread collapse and rubble',
  'sample8.jpg': 'Flooded residential street and inundated ground floors',
  'sample9.jpg': 'Flooded street with a partly submerged car and pedestrians',
  'sample10.jpg': 'Residential street inundated by floodwater',
  'sample11.jpg': 'Flooded neighborhood with submerged cars',
  'sample12.jpg': 'Partially collapsed building with a responder in foreground',
  'sample13.jpg': 'Standing house with roof loss, cracked walls, and a tarp',
  'sample14.jpg': 'Major building collapse with rescue workers and rubble',
}

const images = findImages(sampleDir).sort((a, b) => a.file.localeCompare(b.file, undefined, { numeric: true }))
if (!images.length) throw new Error(`No sample images found under ${sampleDir}`)
console.log(`Found ${images.length} image(s) recursively under public/samples.`)
console.log('Loading CLIP model…')
let lastLoggedProgress = -25
const classifier = await pipeline('zero-shot-image-classification', 'Xenova/clip-vit-base-patch32', {
  progress_callback: (progress) => {
    if ('progress' in progress && progress.progress !== undefined) {
      const rounded = Math.floor(progress.progress / 25) * 25
      if (rounded > lastLoggedProgress) {
        lastLoggedProgress = rounded
        console.log(`Model download: ${rounded}%`)
      }
    }
  },
})
console.log('CLIP_MODEL_LOADED')

const classes = ['intact', 'minor', 'moderate', 'severe', 'destroyed']
const severityWeights = [5, 25, 50, 78, 95]
const confidenceTemperature = 2
const promptSets = {
  before: classes.map((damageClass) => `a disaster damage assessment photo showing ${damageClass} damage`),
  after: [
    'an intact undamaged residential building with no structural damage',
    'a residential building with minor damage such as small cracks or broken windows, but no collapsed walls or floors',
    'a residential building with moderate earthquake damage, deep cracks across walls, or a partly damaged roof, but most of the house remains standing; or a flooded street with houses and cars partially submerged',
    'a heavily earthquake damaged residential building with partial collapse, fallen floors, broken walls, exposed rooms, and rubble, but part of the structure remains standing',
    'a completely collapsed building with pancaked floors, crushed walls, and a large pile of rubble',
  ],
}

const rows = []
for (const { file, path } of images) {
  for (const [version, prompts] of Object.entries(promptSets)) {
    const start = performance.now()
    const result = await classifier(path, prompts, { hypothesis_template: version === 'after' ? '{}' : 'This is a photo of {}' })
    const inferenceMs = Math.round(performance.now() - start)
    const logits = classes.map((_, index) => Math.log(Math.max(result.find((candidate) => candidate.label === prompts[index])?.score ?? 0, 1e-6)) / confidenceTemperature)
    const maxLogit = Math.max(...logits)
    const exponentials = logits.map((logit) => Math.exp(logit - maxLogit))
    const total = exponentials.reduce((sum, value) => sum + value, 0)
    const probabilities = exponentials.map((value) => value / total)
    const bestIndex = probabilities.indexOf(Math.max(...probabilities))
    const damageClass = classes[bestIndex]
    const severity = Math.round(probabilities.reduce((sum, probability, index) => sum + probability * severityWeights[index], 0) * 10) / 10
    const confidence = Math.round(probabilities[bestIndex] * 10_000) / 100
    rows.push({ version, file, what: descriptions[file] ?? 'Image description not manually reviewed', damageClass, severity, confidence: `${confidence}%`, inferenceMs, source: 'model' })
  }
}

console.log('| Prompt set | File | What it shows | Class | Severity | Confidence | Inference ms | Source |')
console.log('| --- | --- | --- | --- | ---: | ---: | ---: | --- |')
for (const row of rows) console.log(`| ${row.version} | ${row.file} | ${row.what} | ${row.damageClass} | ${row.severity} | ${row.confidence} | ${row.inferenceMs} | ${row.source} |`)
