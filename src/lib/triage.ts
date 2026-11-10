import type { ContextInput, Priority } from './types'

export function computePriority(severity: number, ctx: ContextInput): { priority: Priority; reason: string } {
  let score = Math.max(0, Math.min(100, severity))
  if (ctx.populationDensity === 'high') score += 15
  else if (ctx.populationDensity === 'low') score -= 13
  if (ctx.infrastructureNearby === 'critical') score += 18
  else if (ctx.infrastructureNearby === 'none') score -= 13
  if (ctx.roadAccess === 'blocked') score += 15
  else if (ctx.roadAccess === 'clear') score -= 13
  const priority: Priority = score >= 90 ? 'Critical' : score >= 65 ? 'High' : score >= 35 ? 'Medium' : 'Low'
  const factors = [
    severity >= 65 ? 'substantial reported damage' : severity >= 35 ? 'moderate reported damage' : 'limited reported damage',
    ctx.populationDensity === 'high' ? 'high population density' : null,
    ctx.populationDensity === 'low' ? 'low population exposure' : null,
    ctx.infrastructureNearby === 'critical' ? 'critical nearby infrastructure' : null,
    ctx.infrastructureNearby === 'none' ? 'no nearby critical infrastructure' : null,
    ctx.roadAccess === 'blocked' ? 'blocked road access' : ctx.roadAccess === 'partial' ? 'partial road access' : null,
    ctx.roadAccess === 'clear' ? 'clear road access' : null,
  ].filter((value): value is string => value !== null)
  return { priority, reason: `Prioritized for ${factors.join(', ')}.` }
}
