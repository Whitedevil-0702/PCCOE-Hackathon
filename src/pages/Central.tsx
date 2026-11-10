import { useEffect, useRef, useState } from 'react'
import { Cloud, Inbox, Radio, RotateCcw } from 'lucide-react'
import {
  CentralMap,
  DamageSwatch,
  EmptyState,
  PageHeader,
  Panel,
  PriorityChip,
  StatTile,
  StatusLabel,
} from '../components'
import type { MapMarker, QueueRow } from '../components/_fixtures'
import {
  fixtureCentralItems,
  fixtureLastSyncAt,
} from '../components/_fixtures'
import {
  comparePriorityThenRecency,
  damageLabel,
  formatDateTime,
  formatRelative,
  prioritySlug,
} from '../components/format'
import type { Priority } from '../lib/types'

const PRIORITIES: Priority[] = ['Critical', 'High', 'Medium', 'Low']

const PRIORITY_TONES: Record<Priority, 'critical' | 'accent' | 'default' | 'muted'> = {
  Critical: 'critical',
  High: 'accent',
  Medium: 'default',
  Low: 'muted',
}

export default function Central() {
  const [items, setItems] = useState<QueueRow[]>(fixtureCentralItems)
  const [lastSyncedAt, setLastSyncedAt] = useState<number | undefined>(fixtureLastSyncAt)
  const [newIds, setNewIds] = useState<Set<string>>(() => new Set())
  const [now, setNow] = useState(() => Date.now())
  const seenRef = useRef<Set<string>>(new Set(fixtureCentralItems.map((item) => item.id)))

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const fresh = items.filter((item) => !seenRef.current.has(item.id))
    if (fresh.length === 0) return
    fresh.forEach((item) => seenRef.current.add(item.id))
    setNewIds(new Set(fresh.map((item) => item.id)))
    const timer = window.setTimeout(() => setNewIds(new Set()), 2800)
    return () => window.clearTimeout(timer)
  }, [items])

  const rows = [...items].sort(comparePriorityThenRecency)
  const counts: Record<Priority, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 }
  rows.forEach((row) => {
    counts[row.priority] += 1
  })

  const markers: MapMarker[] = rows
    .filter((row) => typeof row.lat === 'number' && typeof row.lng === 'number')
    .map((row) => ({
      id: row.id,
      lat: row.lat as number,
      lng: row.lng as number,
      priority: row.priority,
      label: `${row.locationLabel ?? `#RE-${row.seq ?? '—'}`} · ${damageLabel(row.damageClass)}`,
      damageClass: row.damageClass,
      severity: row.severity,
    }))

  const reset = () => {
    if (!window.confirm('Reset the cloud view? Local queue data is not affected.')) return
    seenRef.current = new Set()
    setItems([])
    setLastSyncedAt(undefined)
    setNewIds(new Set())
  }

  return (
    <div className="page central-page">
      <PageHeader
        eyebrow="Cloud View"
        title="Central"
        subtitle="Assessments that reached the command cloud, sorted by priority then capture time."
        actions={
          <>
            <span className="live-badge">
              <span className="live-dot" aria-hidden />
              {lastSyncedAt ? `Last synced ${formatRelative(lastSyncedAt, now)}` : 'No cloud records'}
            </span>
            <button type="button" className="btn btn-secondary" onClick={reset} disabled={items.length === 0}>
              <RotateCcw size={14} aria-hidden />
              Reset cloud
            </button>
          </>
        }
      />

      <div className="summary-grid central-summary">
        {PRIORITIES.map((priority) => (
          <StatTile
            key={priority}
            label={`${priority} priority`}
            value={counts[priority]}
            hint={`${priority} records in cloud`}
            tone={PRIORITY_TONES[priority]}
          />
        ))}
      </div>

      <Panel
        title="Cloud coverage"
        icon={Radio}
        subtitle="Dark map tiles · online view only"
        actions={<span className="mini-badge">Central</span>}
        className="central-map-panel"
      >
        <CentralMap markers={markers} />
        <div className="central-map-foot">
          <span>
            <Cloud size={12} aria-hidden /> {markers.length} geotagged records
          </span>
          <span>Zoom and pan to inspect clusters</span>
        </div>
      </Panel>

      <Panel
        title="Synced assessments"
        icon={Cloud}
        subtitle="Priority first · newest capture first within each priority"
        actions={<span className="mini-badge">{rows.length} records</span>}
        className="central-table-panel"
      >
        {rows.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No cloud records"
            message="Synced assessments will appear here when the queue reaches the cloud."
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table central-table">
              <thead>
                <tr>
                  <th>Record</th>
                  <th>Damage</th>
                  <th>Priority</th>
                  <th>Context</th>
                  <th>Status</th>
                  <th>Synced</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`row-priority-${prioritySlug(row.priority)} ${newIds.has(row.id) ? 'is-new' : ''}`.trim()}
                  >
                    <td>
                      <div className="record-cell">
                        <img className="record-thumb" src={row.imageDataUrl} alt="" />
                        <div className="record-copy">
                          <span className="record-id tabular">
                            #RE-{String(row.seq ?? index + 1).padStart(3, '0')}
                          </span>
                          <span className="record-location">{row.locationLabel ?? 'Location not set'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="damage-cell">
                        <DamageSwatch damageClass={row.damageClass} />
                        <div>
                          <span className="damage-name">{damageLabel(row.damageClass)}</span>
                          <span className="damage-severity tabular">{row.severity}/100</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <PriorityChip priority={row.priority} />
                    </td>
                    <td>
                      <div className="context-tags">
                        <span>{row.context.populationDensity} pop</span>
                        <span>{row.context.infrastructureNearby} infra</span>
                        <span>{row.context.roadAccess} roads</span>
                      </div>
                    </td>
                    <td>
                      <StatusLabel status={row.status} />
                    </td>
                    <td>
                      <span className="table-time tabular">
                        {formatDateTime(row.syncedAt ?? row.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <p className="page-footnote">Decision-support, not a structural safety judgment.</p>
    </div>
  )
}
