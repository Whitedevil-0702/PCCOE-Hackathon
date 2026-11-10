import { describe, expect, it } from 'vitest'
import { computePriority } from '../src/lib/triage'
import type { ContextInput } from '../src/lib/types'

const neutral: ContextInput = { populationDensity: 'low', infrastructureNearby: 'none', roadAccess: 'clear' }

describe('computePriority', () => {
  it('orders priorities by severity thresholds', () => {
    expect([20, 50, 70, 95].map((severity) => computePriority(severity, neutral).priority)).toEqual(['Low', 'Medium', 'High', 'Critical'])
  })
  it('bumps priority from population, infrastructure, and road context', () => {
    const context: ContextInput = { populationDensity: 'high', infrastructureNearby: 'critical', roadAccess: 'blocked' }
    expect(computePriority(30, context).priority).toBe('High')
    expect(computePriority(60, context).priority).toBe('Critical')
    expect(computePriority(5, context).priority).toBe('Medium')
    expect(computePriority(0, neutral).priority).toBe('Low')
  })
  it('clamps severity and gives a human readable reason', () => {
    expect(computePriority(500, neutral).priority).toBe('Critical')
    expect(computePriority(-10, neutral).priority).toBe('Low')
    expect(computePriority(50, neutral).reason).toContain('moderate reported damage')
  })
})
