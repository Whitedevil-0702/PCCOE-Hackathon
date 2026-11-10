import { useEffect } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AppShell } from './components'
import { useAssessments, useModelStatus, useNetworkMode, useQueue } from './hooks'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Field from './pages/Field'
import Queue from './pages/Queue'
import Central from './pages/Central'
import Settings from './pages/Settings'
import UiPreview from './pages/UiPreview'

function ShellLayout() {
  const network = useNetworkMode()
  const queue = useQueue()
  const assessments = useAssessments()
  const model = useModelStatus()
  useEffect(() => { void model.init() }, [])
  return <AppShell networkMode={network.mode} onNetworkModeChange={network.setMode} queueCount={queue.queued.length + queue.syncing.length} deviceStatus={{ modelReady: model.state === 'ready', dbRecords: assessments.items.length }} teamName="ME BYTE" offlineDataKb={network.bytesSent / 1024}><Outlet /></AppShell>
}

export default function App() {
  useEffect(() => { document.title = 'ResQEdge' }, [])
  return <Routes><Route path="/" element={<Landing />} /><Route element={<ShellLayout />}><Route path="/dashboard" element={<Dashboard />} /><Route path="/field" element={<Field />} /><Route path="/queue" element={<Queue />} /><Route path="/central" element={<Central />} /><Route path="/settings" element={<Settings />} /></Route><Route path="/ui-preview" element={<UiPreview />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes>
}
