import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'

export interface EmptyStateProps {
  title: string
  message: string
  icon?: LucideIcon
  action?: ReactNode
  compact?: boolean
  className?: string
}

export function EmptyState({
  title,
  message,
  icon: Icon = Inbox,
  action,
  compact = false,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`empty-state ${compact ? 'is-compact' : ''} ${className}`.trim()}>
      <span className="empty-icon" aria-hidden>
        <Icon size={compact ? 16 : 20} />
      </span>
      <h3>{title}</h3>
      <p>{message}</p>
      {action && <div className="empty-action">{action}</div>}
    </div>
  )
}
