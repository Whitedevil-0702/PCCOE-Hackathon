import { describe, expect, it } from 'vitest'
import { confidenceTemperature, scoreDamageProbabilities } from '../src/lib/scoring'

describe('probability weighted damage scores', () => {
  it('uses the expected score over intact, minor, moderate, severe, destroyed weights', () => {
    const result = scoreDamageProbabilities([0.1, 0.2, 0.3, 0.25, 0.15])
    expect(result.damageClass).toBe('moderate')
    expect(result.severity).toBeGreaterThan(50)
    expect(result.severity).toBeLessThan(60)
    expect(Number.isInteger(result.severity)).toBe(false)
  })
  it('temperature scales confidence so a dominant class does not report 100%', () => {
    const result = scoreDamageProbabilities([1, 0, 0, 0, 0])
    expect(confidenceTemperature).toBeGreaterThan(1)
    expect(result.damageClass).toBe('intact')
    expect(result.severity).toBeLessThan(5.3)
    expect(result.confidence).toBeGreaterThan(95)
    expect(result.confidence).toBeLessThan(100)
  })
  it('rejects distributions that do not contain five valid scores', () => {
    expect(() => scoreDamageProbabilities([0.5, 0.5])).toThrow('Expected five')
  })
})
