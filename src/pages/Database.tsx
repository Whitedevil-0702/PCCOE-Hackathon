import { AlertTriangle, Cloud, Database as DatabaseIcon, HardDrive, Inbox, Timer } from 'lucide-react'
import {
  DamageSwatch,
  EmptyState,
  PageHeader,
  Panel,
  PriorityChip,
  StatTile,
  StatusLabel,
} from '../components'
import { fixtureQueue } from '../components/_fixtures'
import { capitalize, damageLabel, formatDateTime, prioritySlug } from '../components/format'

export default function Database() {
  const rows = fixtureQueue
  const queued = rows.filter((row) => row.status === 'queued').length
  const synced = rows.filter((row) => row.status === 'synced').length
  const failed = rows.filter((row) => row.status === 'failed').length

  return (
    <div className="page database-page">
      <PageHeader
        eyebrow="Local Storage"
        title="Local Database"
        subtitle="Every assessment on this device, including records still waiting for connectivity."
        actions={
          <span className="mini-badge">
            <DatabaseIcon size={12} aria-hidden />
            <b className="tabular">{rows.length}</b> local records
          </span>
        }
      />

      <div className="summary-grid">
        <StatTile label="Local records" value={rows.length} hint="Persisted in Dexie" icon={HardDrive} />
        <StatTile
          label="Queued"
          value={queued}
          hint="Waiting to sync"
          icon={Timer}
          tone={queued > 0 ? 'accent' : 'default'}
        />
        <StatTile label="Synced" value={synced} hint="Reached the cloud" icon={Cloud} tone="good" />
        <StatTile
          label="Failed"
          value={failed}
          hint="Needs attention"
          icon={AlertTriangle}
          tone={failed > 0 ? 'critical' : 'default'}
        />
      </div>

      <Panel
        title="Stored assessments"
        icon={DatabaseIcon}
        subtitle="Newest first · local fields only"
        actions={<span className="mini-badge">Local-only</span>}
        className="database-panel"
      >
        {rows.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No local records"
            message="Scan a photo in the field app to create the first assessment."
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Record</th>
                  <th>Damage</th>
                  <th>Priority</th>
                  <th>Context</th>
                  <th>Status</th>
                  <th>Captured</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.id} className={`row-priority-${prioritySlug(row.priority)}`}>
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
                        <span>{capitalize(row.context.populationDensity)} pop</span>
                        <span>{capitalize(row.context.infrastructureNearby)} infra</span>
                        <span>{capitalize(row.context.roadAccess)} roads</span>
                      </div>
                    </td>
                    <td>
                      <StatusLabel status={row.status} />
                    </td>
                    <td>
                      <span className="table-time tabular">{formatDateTime(row.createdAt)}</span>
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
