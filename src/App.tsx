import { Navigate, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import Field from './pages/Field'
import Dashboard from './pages/Dashboard'
import UiPreview from './pages/UiPreview'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/field" element={<Field />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/ui-preview" element={<UiPreview />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
