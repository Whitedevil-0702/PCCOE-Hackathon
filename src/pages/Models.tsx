import { useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  CloudOff,
  Cpu,
  HardDrive,
  Layers,
  Power,
  RefreshCw,
  ScanLine,
  Sparkles,
  XCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { PageHeader, Panel, Skeleton } from '../components'
import { fixtureModelStatus } from '../components/_fixtures'
import type { ModelState, ModelStatus } from '../components/_fixtures'
import { damageColor, damageLabel } from '../components/format'
import type { DamageClass } from '../lib/types'

const MODEL_META: Record<ModelState, { label: string; description: string; icon: LucideIcon; tone: string }> = {
  idle: {
    label: 'Not initialized',
    description: 'Run initialization once to download and cache the model.',
    icon: Power,
    tone: 'is-idle',
  },
  loading: {
    label: 'Loading model',
    description: 'Downloading weights and warming up the local runtime.',
    icon: Cpu,
    tone: 'is-loading',
  },
  ready: {
    label: 'Ready for offline use',
    description: 'The model is cached locally and available without a network.',
    icon: CheckCircle2,
    tone: 'is-ready',
  },
  fallback: {
    label: 'Fallback active',
    description: 'The model could not run. Rule-based classification is active.',
    icon: AlertTriangle,
    tone: 'is-fallback',
  },
  error: {
    label: 'Model error',
    description: 'Initialization failed. Use the fallback until the model can be reloaded.',
    icon: XCircle,
    tone: 'is-error',
  },
}

const DAMAGE_CLASSES: DamageClass[] = ['intact', 'minor', 'moderate', 'severe', 'destroyed']

export default function Models() {
  const [status, setStatus] = useState<ModelStatus>(fixtureModelStatus)
  const [progress, setProgress] = useState(fixtureModelStatus.state === 'ready' ? 100 : 0)
  const timersRef = useRef<number[]>([])

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  const init = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer))
    timersRef.current = []
    setStatus({ state: 'loading', label: 'Caching model for offline use' })
    setProgress(8)
    const checkpoints = [24, 52, 78, 100]
    checkpoints.forEach((value, index) => {
      const timer = window.setTimeout(
        () => {
          setProgress(value)
          if (value === 100) setStatus({ state: 'ready', label: 'Ready for offline use' })
        },
        350 + index * 450,
      )
      timersRef.current.push(timer)
    })
  }

  const meta = MODEL_META[status.state]
  const StatusIcon = meta.icon
  const busy = status.state === 'loading'

  return (
    <div className="page models-page">
      <PageHeader
        eyebrow="On-device Inference"
        title="Offline AI Models"
        subtitle="Zero-shot damage classification runs in the browser. The model is cached once, then works with the network off."
        actions={
          <button type="button" className="btn btn-secondary" onClick={init} disabled={busy}>
            <RefreshCw size={14} className={busy ? 'spin-slow' : ''} aria-hidden />
            {busy ? 'Initializing…' : 'Reinitialize model'}
          </button>
        }
      />

      <div className="models-grid">
        <Panel
          title="Model status"
          icon={Cpu}
          subtitle="Transformers.js zero-shot CLIP"
          className="model-status-card"
          actions={<span className={`model-state-badge ${meta.tone}`}>{status.state}</span>}
        >
          <div className={`model-hero ${meta.tone}`}>
            <span className="model-hero-icon" aria-hidden>
              <StatusIcon size={26} />
            </span>
            <div className="model-hero-copy">
              <h3>{status.label ?? meta.label}</h3>
              <p>{meta.description}</p>
            </div>
          </div>

          <div className="model-progress-block">
            <div className="model-progress-head">
              <span>Cached weights</span>
              <span className="tabular">{progress}%</span>
            </div>
            <div className="progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
              <span style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="model-facts">
            <div className="model-fact">
              <CloudOff size={14} aria-hidden />
              <span>Runs without a network after first load</span>
            </div>
            <div className="model-fact">
              <HardDrive size={14} aria-hidden />
              <span>Cached in browser storage on this device</span>
            </div>
            <div className="model-fact">
              <Sparkles size={14} aria-hidden />
              <span>Rule-based fallback if inference fails</span>
            </div>
          </div>
        </Panel>

        <Panel
          title="Classification labels"
          icon={Layers}
          subtitle="Visual damage classes"
          actions={<span className="mini-badge">5 labels</span>}
        >
          <div className="label-list">
            {DAMAGE_CLASSES.map((damageClass) => (
              <div className="label-row" key={damageClass}>
                <span className="label-swatch" style={{ background: damageColor(damageClass) }} aria-hidden />
                <span className="label-name">{damageLabel(damageClass)}</span>
                <span className="label-code tabular">{damageClass}</span>
              </div>
            ))}
          </div>
          <p className="panel-note">
            Labels describe visible damage only. They are not structural safety judgments.
          </p>
        </Panel>
      </div>

      <div className="models-bottom">
        <Panel title="Inference pipeline" icon={ScanLine} subtitle="Local processing sequence">
          <ol className="pipeline-list">
            <li>
              <span className="pipeline-index tabular">01</span>
              <div>
                <strong>Preprocess</strong>
                <p>Resize and normalize the captured image in the browser.</p>
              </div>
            </li>
            <li>
              <span className="pipeline-index tabular">02</span>
              <div>
                <strong>Zero-shot inference</strong>
                <p>Score the image against the five damage labels.</p>
              </div>
            </li>
            <li>
              <span className="pipeline-index tabular">03</span>
              <div>
                <strong>Triage</strong>
                <p>Combine severity with population, infrastructure and road context.</p>
              </div>
            </li>
            <li>
              <span className="pipeline-index tabular">04</span>
              <div>
                <strong>Persist</strong>
                <p>Save the assessment to the local queue with a UUID.</p>
              </div>
            </li>
          </ol>
        </Panel>

        <Panel title="Runtime" icon={Boxes} subtitle="Local model environment">
          {busy ? (
            <div className="runtime-stack">
              <Skeleton variant="line" lines={4} />
              <Skeleton variant="block" className="runtime-skeleton" />
            </div>
          ) : (
            <dl className="runtime-list">
              <div>
                <dt>Runtime</dt>
                <dd>Transformers.js</dd>
              </div>
              <div>
                <dt>Task</dt>
                <dd>Zero-shot image classification</dd>
              </div>
              <div>
                <dt>Device cache</dt>
                <dd className={status.state === 'ready' ? 'is-good' : 'is-warn'}>
                  {status.state === 'ready' ? 'Cached for offline' : 'Not cached'}
                </dd>
              </div>
              <div>
                <dt>Network use</dt>
                <dd>First load only</dd>
              </div>
            </dl>
          )}
        </Panel>
      </div>

      <p className="page-footnote">
        Decision-support, not a structural safety judgment.
      </p>
    </div>
  )
}
