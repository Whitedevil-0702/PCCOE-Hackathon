import { describe, expect, it } from 'vitest'
import { computePriority } from '../src/lib/triage'
import type { ContextInput } from '../src/lib/types'

const neutral: ContextInput = { populationDensity: 'medium', infrastructureNearby: 'some', roadAccess: 'partial' }

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
  it('reduces response priority when exposure is low and roads remain clear', () => {
    const mitigatingContext: ContextInput = { populationDensity: 'low', infrastructureNearby: 'none', roadAccess: 'clear' }
    expect(computePriority(73, mitigatingContext).priority).toBe('Low')
    expect(computePriority(73, mitigatingContext).reason).toContain('low population exposure')
  })
  it('supports the four real-photo demo priority scenarios', () => {
    const critical: ContextInput = { populationDensity: 'high', infrastructureNearby: 'critical', roadAccess: 'blocked' }
    const medium: ContextInput = { populationDensity: 'medium', infrastructureNearby: 'some', roadAccess: 'partial' }
    const low: ContextInput = { populationDensity: 'low', infrastructureNearby: 'none', roadAccess: 'clear' }
    expect([
      computePriority(73, critical).priority,
      computePriority(73, medium).priority,
      computePriority(48, medium).priority,
      computePriority(73, low).priority,
    ]).toEqual(['Critical', 'High', 'Medium', 'Low'])
  })
  it('clamps severity and gives a human readable reason', () => {
    expect(computePriority(500, neutral).priority).toBe('Critical')
    expect(computePriority(-10, neutral).priority).toBe('Low')
    expect(computePriority(50, neutral).reason).toContain('moderate reported damage')
  })
})
