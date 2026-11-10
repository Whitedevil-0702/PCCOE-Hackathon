import { useState } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import type { NetworkMode } from './lib/types'
import { AppShell } from './components'
import { fixtureDeviceStatus, fixtureOfflineDataKb, fixtureQueue, fixtureTeamName } from './components/_fixtures'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Field from './pages/Field'
import Database from './pages/Database'
import Queue from './pages/Queue'
import Models from './pages/Models'
import MapPage from './pages/MapPage'
import Central from './pages/Central'
import Settings from './pages/Settings'
import UiPreview from './pages/UiPreview'

function ShellLayout() {
  const [networkMode, setNetworkMode] = useState<NetworkMode>('online')
  const pendingCount = fixtureQueue.filter((row) => row.status !== 'synced').length

  return (
    <AppShell
      networkMode={networkMode}
      onNetworkModeChange={setNetworkMode}
      queueCount={pendingCount}
      deviceStatus={fixtureDeviceStatus}
      teamName={fixtureTeamName}
      offlineDataKb={fixtureOfflineDataKb}
    >
      <Outlet context={{ networkMode, setNetworkMode }} />
    </AppShell>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<ShellLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/field" element={<Field />} />
        <Route path="/database" element={<Database />} />
        <Route path="/queue" element={<Queue />} />
        <Route path="/models" element={<Models />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/central" element={<Central />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="/ui-preview" element={<UiPreview />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
