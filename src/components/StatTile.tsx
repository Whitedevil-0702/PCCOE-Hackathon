import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export type StatTone = 'default' | 'accent' | 'critical' | 'good' | 'muted'

export interface StatTileProps {
  label: string
  value: ReactNode
  hint?: string
  icon?: LucideIcon
  tone?: StatTone
  className?: string
}

export function StatTile({ label, value, hint, icon: Icon, tone = 'default', className = '' }: StatTileProps) {
  return (
    <div className={`stat-tile tone-${tone} ${className}`.trim()}>
      <div className="stat-tile-head">
        <span className="stat-label">{label}</span>
        {Icon && <Icon size={14} className="stat-icon" aria-hidden />}
      </div>
      <div className="stat-value tabular">{value}</div>
      {hint && <p className="stat-hint">{hint}</p>}
    </div>
  )
}
