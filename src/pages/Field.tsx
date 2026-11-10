import { Eraser, Gauge, ShieldCheck, Smartphone, WifiOff } from 'lucide-react'
import { FieldCapturePanel, PageHeader, Panel, SyncQueuePanel } from '../components'
import {
  fixtureDeviceStatus,
  fixtureFailedWrites,
  fixtureModelStatus,
  fixtureQueue,
} from '../components/_fixtures'
import { useFixtureCapture } from './useFixtureCapture'

const FIELD_CAPTURED_AT = Date.UTC(2026, 10, 10, 6, 29, 12)

export default function Field() {
  const capture = useFixtureCapture()
  const pendingRows = fixtureQueue.filter((row) => row.status !== 'synced')

  return (
    <div className="page field-page">
      <PageHeader
        eyebrow="Field App"
        title="Field Upload"
        subtitle="Capture damage photos and classify them on-device. Assessments are stored locally and queued for sync."
        actions={
          <button type="button" className="btn btn-secondary" onClick={capture.clear}>
            <Eraser size={14} aria-hidden />
            Clear image
          </button>
        }
      />

      <div className="field-layout">
        <FieldCapturePanel
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
          capturedAt={FIELD_CAPTURED_AT}
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

        <div className="field-side">
          <SyncQueuePanel
            rows={pendingRows}
            persistedCount={fixtureDeviceStatus.dbRecords}
            failedWrites={fixtureFailedWrites}
            maxRows={4}
            emptyMessage="Scans saved on this device will stay here until the network returns."
          />

          <Panel
            title="Offline workflow"
            icon={WifiOff}
            subtitle="No connectivity required for capture or triage"
            actions={<span className="mini-badge">Local-first</span>}
          >
            <ul className="check-list">
              <li>
                <Smartphone size={14} aria-hidden />
                <span>Images are processed by the on-device model.</span>
              </li>
              <li>
                <Gauge size={14} aria-hidden />
                <span>Severity and priority are computed locally.</span>
              </li>
              <li>
                <ShieldCheck size={14} aria-hidden />
                <span>Results are decision support, never a safety certification.</span>
              </li>
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  )
}
