import { ArrowDownUp } from 'lucide-react'
import { PageHeader, SyncEventLog, SyncQueuePanel } from '../components'
import { useAssessments, useMetrics, useQueue, useSyncProgress } from '../hooks'

export default function Queue() {
 const queue=useQueue(), progress=useSyncProgress(), metrics=useMetrics(), assessments=useAssessments()
 return <div className="page queue-page"><PageHeader eyebrow="Sync Engine" title="Sync Queue" subtitle="Live queue status, retries and sync events." actions={<span className="mini-badge"><ArrowDownUp size={12}/>Critical to Low</span>}/><div className="queue-layout"><SyncQueuePanel rows={[...queue.syncing,...queue.queued]} persistedCount={assessments.items.length} failedWrites={metrics.failedWrites} subtitle="Live order by priority"/><SyncEventLog events={progress.events} isSyncing={progress.isSyncing}/></div><p className="page-footnote">Decision-support, not a structural safety judgment.</p></div>
}
