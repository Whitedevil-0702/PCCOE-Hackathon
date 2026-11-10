import type { SyncStatus } from '../lib/types'
import { statusText } from './format'

export interface StatusLabelProps {
  status: SyncStatus
  label?: string
  detail?: string
  className?: string
}

export function StatusLabel({ status, label, detail, className = '' }: StatusLabelProps) {
  return (
    <span className={`status-label is-${status} ${className}`.trim()}>
      <span className="status-dot" aria-hidden />
      <span>{label ?? statusText(status)}</span>
      {detail && <span className="status-detail">{detail}</span>}
    </span>
  )
}
