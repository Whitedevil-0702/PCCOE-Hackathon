import type { DamageClass } from './types'

const classes: DamageClass[] = ['intact', 'minor', 'moderate', 'severe', 'destroyed']
const severityWeights = [5, 25, 50, 78, 95]
export const confidenceTemperature = 2

/** Apply temperature scaling to class probabilities and calculate expected severity. */
export function scoreDamageProbabilities(scores: number[]): { damageClass: DamageClass; severity: number; confidence: number } {
  if (scores.length !== classes.length || scores.some((score) => !Number.isFinite(score) || score < 0)) {
    throw new Error('Expected five non-negative class probabilities')
  }
  const logits = scores.map((score) => Math.log(Math.max(score, 1e-6)) / confidenceTemperature)
  const maxLogit = Math.max(...logits)
  const exponentials = logits.map((logit) => Math.exp(logit - maxLogit))
  const total = exponentials.reduce((sum, value) => sum + value, 0)
  const probabilities = exponentials.map((value) => value / total)
  const bestIndex = probabilities.indexOf(Math.max(...probabilities))
  const severity = probabilities.reduce((sum, probability, index) => sum + probability * severityWeights[index], 0)
  return {
    damageClass: classes[bestIndex],
    severity: Math.round(severity * 10) / 10,
    confidence: Math.round(probabilities[bestIndex] * 10_000) / 100,
  }
}
