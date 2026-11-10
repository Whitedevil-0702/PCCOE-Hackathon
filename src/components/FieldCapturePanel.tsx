import { useRef, useState } from 'react'
import type { ChangeEvent, CSSProperties, DragEvent } from 'react'
import {
  AlertTriangle,
  Camera,
  Check,
  CheckCircle2,
  Cpu,
  Image as ImageIcon,
  MapPin,
  Play,
  Save,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Timer,
} from 'lucide-react'
import type { ContextInput, InferenceResult, ModelState, AssessStep, Priority } from '../lib/types'
import {
  capitalize,
  damageColor,
  damageHeadline,
  damageLabel,
  formatClock,
  formatCoord,
  formatMs,
} from './format'
import { Panel } from './Panel'
import { PriorityChip } from './PriorityChip'

export const DEFAULT_SAMPLE_SOURCES = Array.from({ length: 8 }, (_, index) => `/samples/sample${index + 1}.jpg`)

type ActiveStep = Exclude<AssessStep, 'idle'>

const PIPELINE_STEPS: { key: ActiveStep; label: string }[] = [
  { key: 'preprocess', label: 'Preprocess' },
  { key: 'inference', label: 'Inference' },
  { key: 'triage', label: 'Triage' },
  { key: 'saved', label: 'Saved locally' },
]

const POPULATION_OPTIONS: ContextInput['populationDensity'][] = ['low', 'medium', 'high']
const INFRASTRUCTURE_OPTIONS: ContextInput['infrastructureNearby'][] = ['none', 'some', 'critical']
const ROAD_OPTIONS: ContextInput['roadAccess'][] = ['clear', 'partial', 'blocked']

function SampleThumb({
  src,
  index,
  onSelect,
}: {
  src: string
  index: number
  onSelect?: (src: string) => void
}) {
  const [failed, setFailed] = useState(false)
  if (failed) return null
  return (
    <button
      type="button"
      className="sample-thumb"
      title={`Use sample ${index + 1}`}
      onClick={() => onSelect?.(src)}
    >
      <img src={src} alt={`Damage sample ${index + 1}`} loading="lazy" onError={() => setFailed(true)} />
      <span>{String(index + 1).padStart(2, '0')}</span>
    </button>
  )
}

export interface FieldCapturePanelProps {
  imageUrl?: string | null
  running?: boolean
  result?: (InferenceResult & { priority?: Priority; priorityReason?: string }) | null
  context: ContextInput
  onContextChange: (context: ContextInput) => void
  locationLabel: string
  onLocationLabelChange: (value: string) => void
  onImageSelected?: (file: File) => void
  onSampleSelected?: (src: string) => void
  onRun?: () => void
  onSave?: () => void
  coords?: { lat: number; lng: number } | null
  capturedAt?: number | null
  modelStatus?: { state: ModelState; progress?: number; label?: string }
  pipelineStep?: AssessStep
  pipelineMs?: number
  priorityPreview?: { priority: Priority; reason: string } | null
  saved?: boolean
  sampleSources?: string[]
  className?: string
}

export function FieldCapturePanel({
  imageUrl,
  running = false,
  result,
  context,
  onContextChange,
  locationLabel,
  onLocationLabelChange,
  onImageSelected,
  onSampleSelected,
  onRun,
  onSave,
  coords,
  capturedAt,
  modelStatus = { state: 'idle' },
  pipelineStep = 'idle',
  pipelineMs = 0,
  priorityPreview,
  saved = false,
  sampleSources = DEFAULT_SAMPLE_SOURCES,
  className = '',
}: FieldCapturePanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const activeIndex = pipelineStep === 'idle' ? -1 : PIPELINE_STEPS.findIndex((step) => step.key === pipelineStep)
  const progress = Math.max(0, Math.min(100, Math.round(modelStatus.progress ?? 0)))

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) onImageSelected?.(file)
    event.target.value = ''
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) onImageSelected?.(file)
  }

  const openPicker = () => inputRef.current?.click()

  return (
    <Panel
      title="Field Capture"
      icon={Camera}
      subtitle="On-device assessment · save now, sync later"
      className={`field-capture-panel ${className}`.trim()}
      actions={<span className="mini-badge">Offline capable</span>}
    >
      <div className="capture-layout">
        <div className="capture-visual">
          {imageUrl ? (
            <div className={`capture-preview ${running ? 'is-running' : ''}`}>
              <img src={imageUrl} alt="Selected field damage capture" />
              <div className="preview-top">
                <span className="preview-chip">
                  <ScanLine size={12} aria-hidden />
                  On-device
                </span>
                <button type="button" className="preview-replace" onClick={openPicker}>
                  Replace
                </button>
              </div>
              {running && <span className="scan-line" aria-hidden />}
              {running && (
                <div className="inference-running" role="status">
                  <span className="spinner" aria-hidden />
                  Analyzing on-device…
                </div>
              )}
              {result && !running && (
                <div
                  className="assessment-bar"
                  style={{ '--class-color': damageColor(result.damageClass) } as CSSProperties}
                >
                  <div className="assessment-copy">
                    <span className="assessment-kicker">
                      AI assessment · {result.source === 'model' ? 'on-device model' : 'rule-based fallback'}
                    </span>
                    <span className="assessment-headline">
                      {damageHeadline(result.damageClass)}{' '}
                      <em>({Math.round(result.confidence)}% confidence)</em>
                    </span>
                    <span className="assessment-class">
                      CLASS: {damageLabel(result.damageClass)} <span>(visual damage class)</span>
                    </span>
                  </div>
                  <div className="assessment-severity">
                    <strong className="tabular">{Math.round(result.severity)}</strong>
                    <span>/100 severity</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              className={`capture-drop ${dragging ? 'is-dragging' : ''}`}
              role="button"
              tabIndex={0}
              aria-label="Add a damage photo"
              onClick={openPicker}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  openPicker()
                }
              }}
              onDragOver={(event) => {
                event.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <span className="capture-drop-icon" aria-hidden>
                <Camera size={22} />
              </span>
              <h3>Drop a damage photo here</h3>
              <p>or browse files · camera capture on mobile</p>
              <span className="capture-drop-cta">
                <ImageIcon size={14} aria-hidden />
                Choose image
              </span>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={handleFile}
            tabIndex={-1}
          />

          <div className="capture-meta">
            <span>
              <MapPin size={12} aria-hidden />
              {formatCoord(coords?.lat, coords?.lng)}
            </span>
            <span>
              <Timer size={12} aria-hidden />
              {capturedAt ? `Captured ${formatClock(capturedAt)}` : 'No capture yet'}
            </span>
            <span>
              <Cpu size={12} aria-hidden />
              {result
                ? `${result.source === 'model' ? 'On-device model' : 'Fallback'} · ${formatMs(result.inferenceMs)}`
                : 'Awaiting scan'}
            </span>
          </div>

          <div className="sample-strip" aria-label="Sample images">
            {sampleSources.map((src, index) => (
              <SampleThumb key={src} src={src} index={index} onSelect={onSampleSelected} />
            ))}
          </div>
        </div>

        <div className="capture-controls">
          <label className="compact-field">
            <span>Population density</span>
            <select
              value={context.populationDensity}
              onChange={(event) =>
                onContextChange({
                  ...context,
                  populationDensity: event.target.value as ContextInput['populationDensity'],
                })
              }
            >
              {POPULATION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {capitalize(option)}
                </option>
              ))}
            </select>
          </label>

          <label className="compact-field">
            <span>Infrastructure nearby</span>
            <select
              value={context.infrastructureNearby}
              onChange={(event) =>
                onContextChange({
                  ...context,
                  infrastructureNearby: event.target.value as ContextInput['infrastructureNearby'],
                })
              }
            >
              {INFRASTRUCTURE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {capitalize(option)}
                </option>
              ))}
            </select>
          </label>

          <label className="compact-field">
            <span>Road access</span>
            <select
              value={context.roadAccess}
              onChange={(event) =>
                onContextChange({
                  ...context,
                  roadAccess: event.target.value as ContextInput['roadAccess'],
                })
              }
            >
              {ROAD_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {capitalize(option)}
                </option>
              ))}
            </select>
          </label>

          <label className="compact-field">
            <span>Location label</span>
            <input
              type="text"
              value={locationLabel}
              placeholder="e.g. Riverside Clinic · Sector 7"
              onChange={(event) => onLocationLabelChange(event.target.value)}
            />
          </label>

          <div className={`priority-preview ${priorityPreview ? 'has-preview' : 'is-empty'}`}>
            <div className="priority-preview-head">
              <span className="eyebrow">Live priority preview</span>
              {priorityPreview && <PriorityChip priority={priorityPreview.priority} size="md" />}
            </div>
            <p>
              {priorityPreview?.reason ??
                'Set context inputs to preview the triage priority before saving.'}
            </p>
            {priorityPreview && (
              <span className="priority-preview-note">
                <Sparkles size={11} aria-hidden />
                Decision support only
              </span>
            )}
          </div>

          <div className="stepper-block">
            <div className="stepper-head">
              <span className="eyebrow">Pipeline</span>
              {pipelineMs > 0 && <span className="stepper-time tabular">{Math.round(pipelineMs)} ms</span>}
            </div>
            <ol className="stepper">
              {PIPELINE_STEPS.map((step, index) => {
                const state = index < activeIndex ? 'is-done' : index === activeIndex ? 'is-active' : ''
                return (
                  <li key={step.key} className={`stepper-step ${state}`.trim()}>
                    <span className="stepper-node">
                      {index < activeIndex ? <Check size={9} aria-hidden /> : index + 1}
                    </span>
                    <span className="stepper-label">{step.label}</span>
                  </li>
                )
              })}
            </ol>
          </div>

          <div className={`model-chip is-${modelStatus.state}`}>
            {modelStatus.state === 'ready' && <CheckCircle2 size={15} aria-hidden />}
            {modelStatus.state === 'loading' && <Cpu size={15} aria-hidden />}
            {modelStatus.state === 'fallback' && <AlertTriangle size={15} aria-hidden />}
            <div className="model-chip-copy">
              <span>
                {modelStatus.label ??
                  (modelStatus.state === 'ready'
                    ? 'Model ready for offline use'
                    : modelStatus.state === 'loading'
                      ? 'Loading model for offline use…'
                      : 'Rule-based fallback active')}
              </span>
              {modelStatus.state === 'loading' && (
                <span className="model-progress" aria-hidden>
                  <span style={{ width: `${progress}%` }} />
                </span>
              )}
            </div>
            {modelStatus.state === 'loading' && <span className="model-progress-value tabular">{progress}%</span>}
          </div>

          <div className="capture-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={onRun}
              disabled={!onRun || running || !imageUrl}
            >
              <Play size={14} fill="currentColor" aria-hidden />
              {running ? 'Running inference…' : 'Run on-device inference'}
              <span className="active-badge">Active</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onSave}
              disabled={!onSave || !result || running || saved}
            >
              <Save size={14} aria-hidden />
              {saved ? 'Saved locally' : 'Save to local queue'}
            </button>
          </div>
        </div>
      </div>

      <p className="decision-note">
        <ShieldCheck size={12} aria-hidden />
        Decision-support, not a structural safety judgment.
      </p>
    </Panel>
  )
}
