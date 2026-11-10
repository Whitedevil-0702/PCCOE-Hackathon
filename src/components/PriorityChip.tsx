import type { Priority } from '../lib/types'
import { prioritySlug } from './format'

export interface PriorityChipProps {
  priority: Priority
  size?: 'sm' | 'md'
  className?: string
}

export function PriorityChip({ priority, size = 'sm', className = '' }: PriorityChipProps) {
  return (
    <span className={`priority-chip is-${prioritySlug(priority)} size-${size} ${className}`.trim()}>
      {priority}
    </span>
  )
}
