import { useEffect, useRef, useState } from 'react'
import { Layers, Map } from 'lucide-react'
import type { NetworkMode } from '../lib/types'
import {
  AppShell,
  DemoBar,
  EmptyState,
  FieldCapturePanel,
  GuidedDemoButton,
  MetricsStrip,
  OfflineMap,
  Panel,
  PriorityChip,
  SeverityTriageChart,
  Skeleton,
  StatTile,
  StatusLabel,
  SyncProgressChart,
  SyncQueuePanel,
  TriagePanel,
} from '../components'
import {
  fixtureContext,
  fixtureDemoCaption,
  fixtureDeviceStatus,
  fixtureFieldResult,
  fixtureImage,
  fixtureMarkers,
  fixtureMetrics,
  fixtureModelStatus,
  fixtureOfflineDataKb,
  fixtureQueue,
  fixtureQueueReordered,
  fixtureRecommendations,
  fixtureSeverityCounts,
  fixtureSyncSeries,
  fixtureTeamName,
  fixtureTopLabel,
  fixtureTopSeverity,
  fixtureTriageStats,
} from '../components/_fixtures'
import type { FieldAssessmentResult, PipelineStep } from '../components/_fixtures'
import { formatClock } from '../components/format'

const CAPTURED_AT = Date.UTC(2026, 10, 10, 6, 29, 12)

export default function UiPreview() {
  const [networkMode, setNetworkMode] = useState<NetworkMode>('offline')
  const [queueByTime, setQueueByTime] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(fixtureImage)
  const [running, setRunning] = useState(false)
  const [saved, setSaved] = useState(false)
  const [result, setResult] = useState<FieldAssessmentResult | null>(fixtureFieldResult)
  const [pipelineStep, setPipelineStep] = useState<PipelineStep>('saved')
  const [pipelineMs, setPipelineMs] = useState(1840)
  const [context, setContext] = useState(fixtureContext)
  const [locationLabel, setLocationLabel] = useState('Riverside Clinic · Sector 7')
  const [demoVisible, setDemoVisible] = useState(false)
  const timersRef = useRef<number[]>([])
  const objectUrlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer))
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    }
  }, [])

  const schedule = (callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, delay)
    timersRef.current.push(timer)
  }

  const clearTimers = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer))
    timersRef.current = []
  }

  const handleRun = () => {
    clearTimers()
    setRunning(true)
    setSaved(false)
    setResult(null)
    setPipelineStep('preprocess')
    setPipelineMs(0)
    schedule(() => {
      setPipelineStep('inference')
      setPipelineMs(620)
    }, 400)
    schedule(() => {
      setPipelineStep('triage')
      setPipelineMs(1240)
    }, 900)
    schedule(() => {
      setResult(fixtureFieldResult)
      setPipelineStep('saved')
      setPipelineMs(1840)
      setRunning(false)
    }, 1500)
  }

  const handleImageSelected = (file: File) => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    const nextUrl = URL.createObjectURL(file)
    objectUrlRef.current = nextUrl
    setImageUrl(nextUrl)
    setResult(null)
    setSaved(false)
    setPipelineStep('idle')
    setPipelineMs(0)
  }

  const handleSampleSelected = (src: string) => {
    setImageUrl(src)
    setResult(null)
    setSaved(false)
    setPipelineStep('idle')
    setPipelineMs(0)
  }

  const clearPreview = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    setImageUrl(null)
    setResult(null)
    setSaved(false)
    setPipelineStep('idle')
    setPipelineMs(0)
  }

  const rows = queueByTime ? fixtureQueueReordered : fixtureQueue

  return (
    <>
      <AppShell
        networkMode={networkMode}
        onNetworkModeChange={setNetworkMode}
        queueCount={rows.filter((row) => row.status !== 'synced').length}
        deviceStatus={fixtureDeviceStatus}
        teamName={fixtureTeamName}
        offlineDataKb={fixtureOfflineDataKb}
      >
        <div className="ui-preview">
          <header className="page-header">
            <div>
              <p className="page-eyebrow">Hidden component bench</p>
              <h1 className="page-title">UI Preview</h1>
              <p className="page-subtitle">
                Every Phase A component rendered with realistic fixtures. No hooks or live data are used here.
              </p>
            </div>
            <div className="page-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setQueueByTime((value) => !value)}>
                Reorder queue
              </button>
              <button type="button" className="btn btn-secondary" onClick={clearPreview}>
                Clear image
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setDemoVisible((value) => !value)}>
                Toggle demo bar
              </button>
            </div>
          </header>

          <MetricsStrip metrics={fixtureMetrics} />

          <FieldCapturePanel
            imageUrl={imageUrl}
            running={running}
            result={result}
            context={context}
            onContextChange={setContext}
            locationLabel={locationLabel}
            onLocationLabelChange={setLocationLabel}
            onImageSelected={handleImageSelected}
            onSampleSelected={handleSampleSelected}
            onRun={handleRun}
            onSave={() => setSaved(true)}
            coords={{ lat: 18.5234, lng: 73.8567 }}
            capturedAt={CAPTURED_AT}
            modelStatus={fixtureModelStatus}
            pipelineStep={pipelineStep}
            pipelineMs={pipelineMs}
            priorityPreview={{
              priority: fixtureFieldResult.priority,
              reason: fixtureFieldResult.priorityReason,
            }}
            saved={saved}
          />

          <div className="preview-grid-2">
            <SyncQueuePanel rows={rows} persistedCount={128} failedWrites={1} />
            <TriagePanel
              markers={fixtureMarkers}
              recommendations={fixtureRecommendations}
              stats={fixtureTriageStats}
            />
          </div>

          <div className="preview-grid-2">
            <SyncProgressChart data={fixtureSyncSeries} />
            <SeverityTriageChart
              counts={fixtureSeverityCounts}
              topSeverity={fixtureTopSeverity}
              topLabel={fixtureTopLabel}
            />
          </div>

          <div className="preview-grid-2">
            <Panel title="Offline Map · Empty" icon={Map}>
              <OfflineMap markers={[]} />
            </Panel>
            <Panel title="Offline Map · Single Marker" icon={Map}>
              <OfflineMap markers={[fixtureMarkers[0]]} />
            </Panel>
          </div>

          <Panel title="Primitives" icon={Layers}>
            <div className="preview-stack">
              <div>
                <p className="preview-label">PriorityChip</p>
                <div className="preview-row">
                  <PriorityChip priority="Critical" />
                  <PriorityChip priority="High" />
                  <PriorityChip priority="Medium" />
                  <PriorityChip priority="Low" />
                </div>
              </div>
              <div>
                <p className="preview-label">StatusLabel</p>
                <div className="preview-row">
                  <StatusLabel status="queued" label="Queued (waiting for network)" />
                  <StatusLabel status="syncing" label="Syncing..." />
                  <StatusLabel status="synced" label={`Synced ${formatClock(CAPTURED_AT)}`} />
                  <StatusLabel status="failed" />
                </div>
              </div>
              <div>
                <p className="preview-label">StatTile</p>
                <div className="preview-stat-grid">
                  <StatTile label="Avg inference" value="1.8s" hint="On-device" />
                  <StatTile label="Critical targets" value="6" hint="Needs rescue" tone="critical" />
                  <StatTile label="Synced" value="31" hint="This session" tone="good" />
                </div>
              </div>
              <div className="preview-grid-2">
                <div>
                  <p className="preview-label">Skeleton</p>
                  <Skeleton variant="line" lines={3} />
                  <div className="preview-row preview-row-spaced">
                    <Skeleton variant="circle" />
                    <Skeleton variant="block" className="preview-skeleton-block" />
                  </div>
                </div>
                <div>
                  <p className="preview-label">EmptyState</p>
                  <EmptyState
                    title="No local records"
                    message="Scan a photo offline to create the first assessment."
                    compact
                  />
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </AppShell>

      <GuidedDemoButton onStart={() => setDemoVisible(true)} hidden={demoVisible} />
      <DemoBar
        visible={demoVisible}
        caption={fixtureDemoCaption}
        step={3}
        totalSteps={6}
        onStop={() => setDemoVisible(false)}
      />
    </>
  )
}
