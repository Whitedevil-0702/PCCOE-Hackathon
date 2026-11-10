import { Cloud, Inbox, Radio, RotateCcw } from 'lucide-react'
import { CentralMap, EmptyState, PageHeader, Panel, StatTile } from '../components'
import type { MapMarker } from '../components/uiTypes'
import { useCentral } from '../hooks'
import { PRIORITIES, comparePriorityThenRecency, damageLabel } from '../components/format'

export default function Central() {
 const central=useCentral(), rows=[...central.items].sort(comparePriorityThenRecency)
 const counts=Object.fromEntries(PRIORITIES.map(p=>[p,rows.filter(x=>x.priority===p).length])) as Record<(typeof PRIORITIES)[number],number>
 const markers:MapMarker[]=rows.filter(x=>typeof x.lat==='number'&&typeof x.lng==='number').map(x=>({id:x.id,lat:x.lat!,lng:x.lng!,priority:x.priority,label:`${x.locationLabel||`#RE-${x.seq}`} - ${damageLabel(x.damageClass)}`,damageClass:x.damageClass,severity:x.severity}))
 return <div className="page central-page"><PageHeader eyebrow="Cloud View" title="Central" subtitle={central.error??'Assessments polled from the command API.'} actions={<button className="btn btn-secondary" onClick={()=>void central.reset()}><RotateCcw size={14}/>Reset cloud</button>}/><div className="summary-grid central-summary">{PRIORITIES.map(p=><StatTile key={p} label={`${p} priority`} value={counts[p]} hint="Cloud records"/>)}</div><Panel title="Cloud coverage" icon={Radio} subtitle="Map markers require assessment coordinates"><CentralMap markers={markers}/></Panel><Panel title="Synced assessments" icon={Cloud} subtitle="Latest cloud records">{rows.length===0?<EmptyState icon={Inbox} title="No cloud records" message="Synced assessments will appear here."/>:<div className="table-wrap"><table className="data-table"><thead><tr><th>Record</th><th>Damage</th><th>Priority</th><th>Status</th></tr></thead><tbody>{rows.map(row=><tr key={row.id}><td>#RE-{row.seq} {row.locationLabel}</td><td>{damageLabel(row.damageClass)} ({row.severity}/100)</td><td>{row.priority}</td><td>{row.status}</td></tr>)}</tbody></table></div>}</Panel></div>
}
