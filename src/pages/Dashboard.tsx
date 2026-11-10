import { Camera } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import { MetricsStrip, PageHeader, SyncProgressChart, SeverityTriageChart, SyncQueuePanel, TriagePanel, GuidedDemoButton, DemoBar, LiveFieldCapture } from '../components'
import { useAssessments, useMetrics, useQueue, useRecommendations, useSyncProgress, useDemo } from '../hooks'
import { PRIORITIES, comparePriorityThenRecency } from '../components/format'

export default function Dashboard() {
 const {items}=useAssessments(), metrics=useMetrics(), queue=useQueue(), sync=useSyncProgress(), recommendations=useRecommendations(), demo=useDemo()
 const [search]=useSearchParams()
 useEffect(()=>{if(search.get('demo')==='1')demo.start()},[])
 const counts=Object.fromEntries(PRIORITIES.map(p=>[p,items.filter(x=>x.priority===p).length])) as Record<(typeof PRIORITIES)[number],number>
 const markers=items.filter(x=>typeof x.lat==='number'&&typeof x.lng==='number').map(x=>({id:x.id,lat:x.lat!,lng:x.lng!,priority:x.priority,label:x.locationLabel||`#RE-${x.seq}`,damageClass:x.damageClass,severity:x.severity}))
 const top=[...items].sort((a,b)=>b.severity-a.severity)[0]
 return <div className="page dashboard-page"><PageHeader eyebrow="Mission Control" title="Command Dashboard" subtitle="Offline first damage assessment, priority triage and sync health." actions={<Link className="btn btn-primary" to="/field"><Camera size={14}/> Capture assessment</Link>}/><MetricsStrip metrics={metrics}/><div className="dashboard-tri"><LiveFieldCapture className="dashboard-capture"/><SyncQueuePanel rows={[...queue.syncing,...queue.queued].sort(comparePriorityThenRecency)} persistedCount={items.length} failedWrites={metrics.failedWrites} maxRows={5}/><TriagePanel markers={markers} recommendations={recommendations} stats={{totalScans:items.length,criticalTargets:items.filter(x=>x.priority==='Critical').length,synced:items.filter(x=>x.status==='synced').length}}/></div><div className="dashboard-charts"><SyncProgressChart data={sync.history}/><SeverityTriageChart counts={counts} topSeverity={top?.severity ?? 0} topLabel={top?.locationLabel}/></div><GuidedDemoButton onStart={demo.start} hidden={demo.running}/><DemoBar visible={demo.running} caption={demo.caption} step={demo.step} totalSteps={demo.total} onStop={demo.stop}/></div>
}
