import type { DamageClass, Priority, SyncStatus } from '../lib/types'

export const PRIORITIES: Priority[] = ['Critical', 'High', 'Medium', 'Low']

const PRIORITY_COLORS: Record<Priority, string> = {
  Critical: '#EF4444',
  High: '#F97316',
  Medium: '#EAB308',
  Low: '#3B82F6',
}

const DAMAGE_COLORS: Record<DamageClass, string> = {
  intact: '#22C55E',
  minor: '#3B82F6',
  moderate: '#EAB308',
  severe: '#F97316',
  destroyed: '#EF4444',
}

const DAMAGE_LABELS: Record<DamageClass, string> = {
  intact: 'Intact',
  minor: 'Minor',
  moderate: 'Moderate',
  severe: 'Severe',
  destroyed: 'Destroyed',
}

const DAMAGE_HEADLINES: Record<DamageClass, string> = {
  intact: 'INTACT',
  minor: 'MINOR DAMAGE',
  moderate: 'MODERATE DAMAGE',
  severe: 'SEVERE DAMAGE',
  destroyed: 'SEVERE DAMAGE',
}

export function prioritySlug(priority: Priority): string {
  return priority.toLowerCase()
}

export function priorityRank(priority: Priority): number {
  return PRIORITIES.indexOf(priority)
}

export function comparePriorityThenRecency(
  a: { priority: Priority; createdAt: number },
  b: { priority: Priority; createdAt: number },
): number {
  return priorityRank(a.priority) - priorityRank(b.priority) || b.createdAt - a.createdAt
}

export function priorityColor(priority: Priority): string {
  return PRIORITY_COLORS[priority]
}

export function damageColor(damageClass: DamageClass): string {
  return DAMAGE_COLORS[damageClass]
}

export function damageLabel(damageClass: DamageClass): string {
  return DAMAGE_LABELS[damageClass]
}

export function damageHeadline(damageClass: DamageClass): string {
  return DAMAGE_HEADLINES[damageClass]
}

export function statusText(status: SyncStatus): string {
  const labels: Record<SyncStatus, string> = {
    queued: 'Queued',
    syncing: 'Syncing',
    synced: 'Synced',
    failed: 'Failed',
  }
  return labels[status]
}

function pad(value: number): string {
  return String(Math.trunc(value)).padStart(2, '0')
}

export function formatClock(timestamp: number): string {
  const date = new Date(timestamp)
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp)
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${formatClock(timestamp)}`
}

export function formatRelative(timestamp: number, now = Date.now()): string {
  const delta = Math.max(0, now - timestamp)
  const seconds = Math.floor(delta / 1000)
  if (seconds < 1) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return '0s'
  if (ms < 1000) return `${Math.round(ms)}ms`
  const seconds = ms / 1000
  if (seconds < 60) return `${seconds.toFixed(seconds < 10 ? 1 : 0)}s`
  const wholeSeconds = Math.round(seconds)
  const minutes = Math.floor(wholeSeconds / 60)
  const remainder = wholeSeconds % 60
  return `${minutes}m ${pad(remainder)}s`
}

export function formatPercent(value: number): string {
  const percent = value <= 1 ? value * 100 : value
  return `${Math.round(percent)}%`
}

export function formatKb(kb: number): string {
  if (!Number.isFinite(kb) || kb <= 0) return '0 KB'
  return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`
}

export function formatMs(ms: number): string {
  return `${Math.round(ms)} ms`
}

export function formatCoord(lat?: number, lng?: number): string {
  if (typeof lat !== 'number' || typeof lng !== 'number') return 'Location not set'
  const latDir = lat >= 0 ? 'N' : 'S'
  const lngDir = lng >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`
}

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function labelize(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(capitalize)
    .join(' ')
}
