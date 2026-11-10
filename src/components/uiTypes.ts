import type { DamageClass, Priority } from '../lib/types'
export interface MapMarker { id: string; lat: number; lng: number; priority: Priority; label: string; damageClass?: DamageClass; severity?: number }
export interface TriageRecommendation { id: string; priority: Priority; title: string; detail: string }
export interface TriageStats { totalScans: number; criticalTargets: number; synced: number }
export interface SeverityCounts { Critical: number; High: number; Medium: number; Low: number }
export interface ChartPoint { t: number; synced: number; pending: number }
