import { useState } from 'react'
import { Camera } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  DemoBar,
  FieldCapturePanel,
  GuidedDemoButton,
  MetricsStrip,
  PageHeader,
  SeverityTriageChart,
  SyncProgressChart,
  SyncQueuePanel,
  TriagePanel,
} from '../components'
import {
  fixtureDemoCaption,
  fixtureDeviceStatus,
  fixtureFailedWrites,
  fixtureMarkers,
  fixtureMetrics,
  fixtureModelStatus,
  fixtureQueue,
  fixtureRecommendations,
  fixtureSeverityCounts,
  fixtureSyncSeries,
  fixtureTopLabel,
  fixtureTopSeverity,
  fixtureTriageStats,
} from '../components/_fixtures'
import { useFixtureCapture } from './useFixtureCapture'

export default function Dashboard() {
  const capture = useFixtureCapture()
  const [searchParams] = useSearchParams()
  const [demoVisible, setDemoVisible] = useState(() => searchParams.get('demo') === '1')
  const pendingRows = fixtureQueue.filter((row) => row.status !== 'synced')

  return (
    <div className="page dashboard-page">
      <PageHeader
        eyebrow="Mission Control"
        title="Command Dashboard"
        subtitle="Offline-first damage assessment, priority triage and sync health across the active response sector."
        actions={
          <Link className="btn btn-primary" to="/field">
            <Camera size={14} aria-hidden />
            Capture assessment
          </Link>
        }
      />

      <MetricsStrip metrics={fixtureMetrics} />

      <div className="dashboard-tri">
        <FieldCapturePanel
          className="dashboard-capture"
          imageUrl={capture.imageUrl}
          running={capture.running}
          result={capture.result}
          context={capture.context}
          onContextChange={capture.setContext}
          locationLabel={capture.locationLabel}
          onLocationLabelChange={capture.setLocationLabel}
          onImageSelected={capture.selectFile}
          onSampleSelected={capture.selectSample}
          onRun={capture.run}
          onSave={capture.save}
          coords={{ lat: 18.5234, lng: 73.8567 }}
          capturedAt={Date.UTC(2026, 10, 10, 6, 29, 12)}
          modelStatus={fixtureModelStatus}
          pipelineStep={capture.pipelineStep}
          pipelineMs={capture.pipelineMs}
          priorityPreview={
            capture.result
              ? { priority: capture.result.priority, reason: capture.result.priorityReason }
              : null
          }
          saved={capture.saved}
        />
        <SyncQueuePanel
          rows={pendingRows}
          persistedCount={fixtureDeviceStatus.dbRecords}
          failedWrites={fixtureFailedWrites}
          maxRows={5}
        />
        <TriagePanel
          markers={fixtureMarkers}
          recommendations={fixtureRecommendations}
          stats={fixtureTriageStats}
        />
      </div>

      <div className="dashboard-charts">
        <SyncProgressChart data={fixtureSyncSeries} />
        <SeverityTriageChart
          counts={fixtureSeverityCounts}
          topSeverity={fixtureTopSeverity}
          topLabel={fixtureTopLabel}
        />
      </div>

      <GuidedDemoButton onStart={() => setDemoVisible(true)} hidden={demoVisible} />
      <DemoBar
        visible={demoVisible}
        caption={fixtureDemoCaption}
        step={1}
        totalSteps={6}
        onStop={() => setDemoVisible(false)}
      />
    </div>
  )
}
