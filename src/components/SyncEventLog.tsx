import { Activity, AlertTriangle, CheckCheck, CheckCircle2, RefreshCw, XCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { SyncLogEntry } from './_fixtures'
import { EmptyState } from './EmptyState'
import { formatClock, formatDuration } from './format'
import { Panel } from './Panel'

export interface SyncEventLogProps {
  events: SyncLogEntry[]
  isSyncing?: boolean
  title?: string
  subtitle?: string
  maxRows?: number
  className?: string
}

interface EventMeta {
  icon: LucideIcon
  tone: string
  title: string
  detail?: (event: SyncLogEntry) => string
}

function eventMeta(event: SyncLogEntry): EventMeta {
  switch (event.type) {
    case 'item-start':
      return { icon: RefreshCw, tone: 'is-syncing', title: 'Sync started' }
    case 'item-success':
      return { icon: CheckCircle2, tone: 'is-success', title: 'Synced to cloud' }
    case 'item-retry':
      return {
        icon: AlertTriangle,
        tone: 'is-retry',
        title: 'Retry scheduled',
        detail: () => `Attempt ${event.attempt} · ${formatDuration(event.delayMs)} backoff`,
      }
    case 'item-failed':
      return { icon: XCircle, tone: 'is-failed', title: 'Sync failed after retries' }
    case 'queue-drained':
      return { icon: CheckCheck, tone: 'is-success', title: 'Queue drained · all pending items synced' }
  }
}

export function SyncEventLog({
  events,
  isSyncing = false,
  title = 'Sync Event Log',
  subtitle = 'Live events from the local sync engine',
  maxRows,
  className = '',
}: SyncEventLogProps) {
  const visibleEvents = typeof maxRows === 'number' ? events.slice(0, maxRows) : events

  return (
    <Panel
      title={title}
      icon={Activity}
      subtitle={subtitle}
      className={`sync-event-log ${className}`.trim()}
      actions={
        <span className={`live-badge ${isSyncing ? 'is-busy' : ''}`.trim()}>
          <span className="live-dot" aria-hidden />
          {isSyncing ? 'Syncing' : 'Session'}
        </span>
      }
    >
      {visibleEvents.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No sync events yet"
          message="Sync activity will stream here when the queue starts draining."
          compact
        />
      ) : (
        <ol className="event-list">
          {visibleEvents.map((event, index) => {
            const meta = eventMeta(event)
            const Icon = meta.icon
            const rawId = 'id' in event ? event.id : 'queue-drained'
            const itemId = event.seq ? `#RE-${String(event.seq).padStart(3, '0')}` : rawId.slice(0, 8)
            return (
              <li className={`event-row ${meta.tone}`} key={`${event.type}-${rawId}-${index}`}>
                <span className="event-icon" aria-hidden>
                  <Icon size={14} />
                </span>
                <div className="event-copy">
                  <div className="event-top">
                    <span className="event-title">{meta.title}</span>
                    <span className="event-time tabular">{event.at ? formatClock(event.at) : 'Live'}</span>
                  </div>
                  {event.type === 'queue-drained' ? (
                    <p className="event-detail">All queued assessments have reached the cloud.</p>
                  ) : (
                    <p className="event-detail">
                      <span className="event-id tabular">{itemId}</span>
                      {meta.detail ? ` · ${meta.detail(event)}` : ''}
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      )}
      <div className="event-footer">
        <span className={`dot ${isSyncing ? 'is-online' : 'is-weak'}`} aria-hidden />
        {isSyncing ? 'Draining queue by priority' : 'Waiting for the next sync cycle'}
      </div>
    </Panel>
  )
}
