import type { DamageClass, Priority } from '../lib/types'
export interface MapMarker { id: string; lat: number; lng: number; priority: Priority; label: string; damageClass?: DamageClass; severity?: number }
export interface TriageRecommendation { id: string; priority: Priority; title: string; detail: string }
export interface TriageStats { totalScans: number; criticalTargets: number; synced: number }
export interface SeverityCounts { Critical: number; High: number; Medium: number; Low: number }
export interface ChartPoint { t: number; synced: number; pending: number }
export function fallbackCoordinates(seed: string): { lat: number; lng: number } {
  let hash = 0
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  const latOffset = ((hash % 10001) / 10000 - 0.5) * 0.018
  const lngOffset = (((hash >>> 8) % 10001) / 10000 - 0.5) * 0.018
  return { lat: 18.5204 + latOffset, lng: 73.8567 + lngOffset }
}
