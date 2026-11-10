import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { performance } from 'node:perf_hooks'
import { pipeline } from '@huggingface/transformers'

const sampleDir = resolve('public/samples')
const localFiles = existsSync(sampleDir) ? readdirSync(sampleDir).filter((name) => /\.(png|jpe?g|webp)$/i.test(name)) : []
const trackedFiles = execFileSync('git', ['ls-tree', '-r', '--name-only', 'HEAD', 'public/samples'], { encoding: 'utf8' })
  .split(/\r?\n/).filter((path) => /\.(png|jpe?g|webp)$/i.test(path))
const names = [...new Set([...localFiles, ...trackedFiles.map((path) => path.slice('public/samples/'.length))])]
if (!names.length) throw new Error('No sample images found in public/samples or HEAD')

const loadFiles = new Map()
for (const name of names) {
  const source = join(sampleDir, name)
  if (existsSync(source)) loadFiles.set(name, source)
  else {
    const targetDir = join(tmpdir(), 'resqedge-sample-eval')
    mkdirSync(targetDir, { recursive: true })
    const target = join(targetDir, name)
    writeFileSync(target, execFileSync('git', ['show', `HEAD:public/samples/${name}`], { maxBuffer: 50 * 1024 * 1024 }))
    loadFiles.set(name, target)
  }
}

console.log(`Loading CLIP model for ${names.length} sample image(s)…`)
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
const severityByClass = { intact: 5, minor: 25, moderate: 48, severe: 73, destroyed: 94 }
const promptSets = {
  before: classes.map((damageClass) => `a disaster damage assessment photo showing ${damageClass} damage`),
  after: [
    'a photo of an intact undamaged building with no visible cracks or collapse',
    'a photo of a building with minor cosmetic damage and a few small cracks',
    'a photo of a building with moderate structural damage, large cracks, or partial wall failure',
    'a photo of a severely damaged building with major structural failure that is still partly standing',
    'a photo of a destroyed collapsed building reduced to rubble after a disaster',
  ],
}
for (const [file, path] of loadFiles) {
  for (const [version, labels] of Object.entries(promptSets)) {
    const start = performance.now()
    const result = await classifier(path, labels)
    const inferenceMs = Math.round(performance.now() - start)
    const best = result[0]
    const labelIndex = labels.indexOf(best.label)
    const damageClass = classes[labelIndex]
    if (!damageClass) throw new Error(`Unknown model label: ${best.label}`)
    console.log(JSON.stringify({ version, file, class: damageClass, severity: severityByClass[damageClass], confidence: Math.round(best.score * 100), inferenceMs, source: 'model', rawLabel: best.label }))
  }
}
