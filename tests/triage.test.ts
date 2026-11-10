import { describe, expect, it } from 'vitest'
import { computePriority } from '../src/lib/triage'
import type { ContextInput } from '../src/lib/types'

const neutral: ContextInput = { populationDensity: 'low', infrastructureNearby: 'none', roadAccess: 'clear' }

describe('computePriority', () => {
  it('orders priorities by severity thresholds', () => {
    expect([20, 50, 70, 95].map((severity) => computePriority(severity, neutral).priority)).toEqual(['Low', 'Medium', 'High', 'Critical'])
    expect([44, 45, 64, 65, 74, 75].map((severity) => computePriority(severity, neutral).priority)).toEqual(['Low', 'Medium', 'Medium', 'High', 'High', 'Critical'])
  })
  it('bumps priority from population, infrastructure, and road context', () => {
    const context: ContextInput = { populationDensity: 'high', infrastructureNearby: 'critical', roadAccess: 'blocked' }
    expect(computePriority(30, context).priority).toBe('Critical')
    expect(computePriority(60, context).priority).toBe('Critical')
    expect(computePriority(5, context).priority).toBe('Medium')
    expect(computePriority(0, neutral).priority).toBe('Low')
  })
  it('does not lower priority for lower exposure or clear access', () => {
    const lowContext: ContextInput = { populationDensity: 'low', infrastructureNearby: 'none', roadAccess: 'clear' }
    expect(computePriority(73, lowContext).priority).toBe('High')
  })
  it('supports four severity-led demo priorities with neutral context', () => {
    expect([
      computePriority(75.5, neutral).priority,
      computePriority(67.1, neutral).priority,
      computePriority(47.9, neutral).priority,
      computePriority(25, neutral).priority,
    ]).toEqual(['Critical', 'High', 'Medium', 'Low'])
  })
  it('clamps severity and gives a human readable reason', () => {
    expect(computePriority(500, neutral).priority).toBe('Critical')
    expect(computePriority(-10, neutral).priority).toBe('Low')
    expect(computePriority(50, neutral).reason).toContain('moderate reported damage')
    expect(computePriority(40, neutral).reason).toContain('limited reported damage')
  })
})
