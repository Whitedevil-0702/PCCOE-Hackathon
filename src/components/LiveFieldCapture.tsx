import { useEffect, useState } from 'react'
import type { ContextInput, InferenceResult } from '../lib/types'
import { computePriority } from '../lib'
import { useAssess, useModelStatus } from '../hooks'
import { FieldCapturePanel } from './FieldCapturePanel'

const initialContext: ContextInput = { populationDensity: 'medium', infrastructureNearby: 'some', roadAccess: 'partial' }
const toDataUrl = (blob: Blob) => new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=reject;reader.readAsDataURL(blob)})

export function LiveFieldCapture({className}:{className?:string}) {
 const assess=useAssess(), model=useModelStatus()
 useEffect(()=>{void model.init()},[])
 const [imageUrl,setImageUrl]=useState<string|null>(null),[blob,setBlob]=useState<Blob|null>(null),[result,setResult]=useState<InferenceResult|null>(null),[context,setContext]=useState(initialContext),[locationLabel,setLocationLabel]=useState(''),[saved,setSaved]=useState(false)
 const selectFile=(file:File)=>{setBlob(file);setImageUrl(URL.createObjectURL(file));setResult(null);setSaved(false)}
 const run=async()=>{if(blob)setResult(await assess.run(blob))}
 const sample=async(src:string)=>{try{const response=await fetch(src);if(!response.ok)return;const data=await response.blob();setBlob(data);setImageUrl(src);setResult(await assess.run(data));setSaved(false)}catch{setImageUrl(null)}}
 const preview=result?computePriority(result.severity,context):null
 const save=async()=>{if(!result||!imageUrl)return;const offset=0.009;await assess.save({imageDataUrl:blob?await toDataUrl(blob):imageUrl,result,context,lat:18.5204+(Math.random()-0.5)*offset,lng:73.8567+(Math.random()-0.5)*offset,locationLabel:locationLabel.trim()});setSaved(true)}
 return <FieldCapturePanel className={className} imageUrl={imageUrl} running={assess.running} result={result?{...result,priority:preview?.priority,priorityReason:preview?.reason}:null} context={context} onContextChange={setContext} locationLabel={locationLabel} onLocationLabelChange={setLocationLabel} onImageSelected={selectFile} onSampleSelected={(src)=>void sample(src)} onRun={()=>void run()} onSave={()=>void save()} modelStatus={model} pipelineStep={assess.step} priorityPreview={preview} saved={saved}/>
}
