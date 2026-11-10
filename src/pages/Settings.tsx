import { useState } from 'react'
import { Radio, Wifi, WifiOff, Signal, Trash2, Database, RotateCcw } from 'lucide-react'
import type { NetworkMode } from '../lib/types'
import { PageHeader, Panel } from '../components'
import { useCentral, useLocalAdmin, useMetrics, useModelStatus, useNetworkMode } from '../hooks'

const options:{mode:NetworkMode;label:string;icon:typeof Wifi}[]=[{mode:'online',label:'Online',icon:Wifi},{mode:'weak',label:'Weak network',icon:Signal},{mode:'offline',label:'Offline',icon:WifiOff}]
export default function Settings(){
 const net=useNetworkMode(), admin=useLocalAdmin(), central=useCentral(), metrics=useMetrics(), model=useModelStatus(),[message,setMessage]=useState('')
 return <div className="page settings-page"><PageHeader eyebrow="Preferences" title="Settings" subtitle="Manage local demo data and connectivity simulation."/><div className="settings-grid"><Panel title="Network simulation" icon={Radio}><div className="network-options">{options.map(o=>{const Icon=o.icon;return <button key={o.mode} className={`network-option ${net.mode===o.mode?'is-active':''}`} onClick={()=>net.setMode(o.mode)}><Icon size={17}/>{o.label}</button>})}</div><p>Data sent: {Math.round(net.bytesSent)} bytes</p></Panel><Panel title="Local runtime" icon={Database}><p>Model state: {model.state}{model.cachedForOffline?' (cached for offline use)':''}</p><p>Session assessments: {metrics.totalAssessed}</p><div className="capture-actions"><button className="btn btn-secondary" onClick={()=>void admin.seedDemo().then(()=>setMessage('Demo records added.'))}>Seed demo records</button><button className="btn btn-secondary" onClick={()=>void admin.clearLocal().then(()=>setMessage('Local records cleared.'))}><Trash2 size={14}/>Clear local data</button><button className="btn btn-secondary" onClick={()=>void central.reset().then(()=>setMessage('Central data reset.'))}><RotateCcw size={14}/>Reset central data</button></div>{message&&<p role="status">{message}</p>}</Panel></div></div>
}
