import { Inbox, MapPin, RefreshCw } from 'lucide-react'
import type { QueueRow } from './_fixtures'
import { damageColor, damageLabel, formatClock, formatCoord, prioritySlug } from './format'
import { EmptyState } from './EmptyState'
import { Panel } from './Panel'
import { PriorityChip } from './PriorityChip'
import { StatusLabel } from './StatusLabel'
import { useFlip } from './useFlip'

export interface SyncQueuePanelProps {
  rows: QueueRow[]
  persistedCount: number
  failedWrites: number
  title?: string
  subtitle?: string
  maxRows?: number
  emptyMessage?: string
  className?: string
}

function resolveStatus(row: QueueRow): { label: string; detail?: string } {
  if (row.status === 'queued' && row.attempts > 0) {
    const seconds = Math.max(1, Math.ceil((row.retryDelayMs ?? 2000) / 1000))
    return { label: `Retrying in ${seconds}s`, detail: `(attempt ${row.attempts})` }
  }
  switch (row.status) {
    case 'queued':
      return { label: 'Queued (waiting for network)' }
    case 'syncing':
      return { label: 'Syncing...' }
    case 'synced':
      return { label: `Synced ${formatClock(row.syncedAt ?? row.createdAt)}` }
    case 'failed':
      return { label: 'Failed' }
  }
}

export function SyncQueuePanel({
  rows,
  persistedCount,
  failedWrites,
  title = 'Sync Queue',
  subtitle = 'Priority-first drain · UUID idempotency',
  maxRows,
  emptyMessage = 'Assessments saved offline will wait here until connectivity returns.',
  className = '',
}: SyncQueuePanelProps) {
  const visibleRows = typeof maxRows === 'number' ? rows.slice(0, maxRows) : rows
  const pendingCount = rows.filter((row) => row.status !== 'synced').length
  const listRef = useFlip<HTMLDivElement>(visibleRows.map((row) => row.id).join('|'))

  return (
    <Panel
      title={title}
      icon={RefreshCw}
      subtitle={subtitle}
      className={`sync-queue-panel ${className}`.trim()}
      actions={
        <span className="queue-pending-badge">
          <span className="dot is-weak" aria-hidden />
          <b className="tabular">{pendingCount}</b> pending
        </span>
      }
    >
      {visibleRows.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Queue is clear"
          message={emptyMessage}
          compact
        />
      ) : (
        <div className="queue-list" ref={listRef}>
          {visibleRows.map((row, index) => {
            const status = resolveStatus(row)
            return (
              <article
                key={row.id}
                data-flip-key={row.id}
                className={`queue-row is-${prioritySlug(row.priority)} ${row.status === 'failed' ? 'is-failed' : ''}`.trim()}
              >
                <div className="queue-row-top">
                  <div className="queue-id-loc">
                    <span className="queue-id tabular">#RE-{String(row.seq ?? index + 1).padStart(3, '0')}</span>
                    <span className="queue-location">
                      <MapPin size={11} aria-hidden />
                      {row.locationLabel ?? formatCoord(row.lat, row.lng)}
                    </span>
                  </div>
                  <PriorityChip priority={row.priority} />
                </div>
                <div className="queue-row-bottom">
                  <StatusLabel status={row.status} label={status.label} detail={status.detail} />
                  <span className="queue-class">
                    <span
                      className="queue-swatch"
                      style={{ background: damageColor(row.damageClass) }}
                      aria-hidden
                    />
                    {damageLabel(row.damageClass)} · <span className="tabular">{row.severity}/100</span>
                  </span>
                  <span className="queue-time tabular">{formatClock(row.createdAt)}</span>
                </div>
              </article>
            )
          })}
        </div>
      )}
      <div className="queue-footer">
        <span className="queue-footer-dot" aria-hidden />
        <span>
          Local DB: <strong className="tabular">{persistedCount}</strong> records persisted
        </span>
        <span className="queue-footer-sep" aria-hidden>
          ·
        </span>
        <span>
          <strong className={`tabular ${failedWrites > 0 ? 'is-warning' : ''}`.trim()}>{failedWrites}</strong>{' '}
          failed writes this session
        </span>
      </div>
    </Panel>
  )
}
