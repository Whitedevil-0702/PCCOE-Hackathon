import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { MoreVertical } from 'lucide-react'

export interface PanelProps {
  title: string
  icon?: LucideIcon
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
  id?: string
}

export function Panel({ title, icon: Icon, subtitle, actions, children, className = '', id }: PanelProps) {
  return (
    <section className={`panel ${className}`} id={id} aria-label={title}>
      <header className="panel-head">
        <div className="panel-heading">
          {Icon && (
            <span className="panel-icon" aria-hidden>
              <Icon size={14} />
            </span>
          )}
          <div className="panel-heading-text">
            <h2 className="panel-title">{title}</h2>
            {subtitle && <p className="panel-subtitle">{subtitle}</p>}
          </div>
        </div>
        <div className="panel-actions">
          {actions}
          <button type="button" className="panel-kebab" aria-label={`${title} options`} onClick={() => undefined}>
            <MoreVertical size={15} aria-hidden />
          </button>
        </div>
      </header>
      <div className="panel-body">{children}</div>
    </section>
  )
}
