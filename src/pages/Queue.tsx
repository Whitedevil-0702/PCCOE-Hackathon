import { ArrowDownUp } from 'lucide-react'
import { PageHeader, SyncEventLog, SyncQueuePanel } from '../components'
import {
  fixtureDeviceStatus,
  fixtureFailedWrites,
  fixtureQueue,
  fixtureSyncEvents,
} from '../components/_fixtures'
import { comparePriorityThenRecency } from '../components/format'

export default function Queue() {
  const rows = fixtureQueue.filter((row) => row.status !== 'synced').sort(comparePriorityThenRecency)
  const isSyncing = rows.some((row) => row.status === 'syncing')

  return (
    <div className="page queue-page">
      <PageHeader
        eyebrow="Sync Engine"
        title="Sync Queue"
        subtitle="Critical work drains first. Failed items back off exponentially and retry with the same UUID."
        actions={
          <span className="mini-badge">
            <ArrowDownUp size={12} aria-hidden />
            Critical → Low
          </span>
        }
      />

      <div className="queue-layout">
        <SyncQueuePanel
          rows={rows}
          persistedCount={fixtureDeviceStatus.dbRecords}
          failedWrites={fixtureFailedWrites}
          subtitle="Live drain order · priority first, then oldest"
        />
        <SyncEventLog events={fixtureSyncEvents} isSyncing={isSyncing} />
      </div>

      <div className="queue-strategy">
        <span>
          <b>1.</b> Drain by priority
        </span>
        <span>
          <b>2.</b> Retry with exponential backoff
        </span>
        <span>
          <b>3.</b> Resend the same UUID for idempotency
        </span>
      </div>

      <p className="page-footnote">Decision-support, not a structural safety judgment.</p>
    </div>
  )
}
