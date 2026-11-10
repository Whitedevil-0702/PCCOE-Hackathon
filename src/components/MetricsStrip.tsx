import { Activity, CheckCircle2, Database, Gauge, RefreshCw, Sparkles, Timer } from 'lucide-react'
import type { Metrics } from '../lib/types'
import { formatDuration, formatMs, formatPercent } from './format'
import { StatTile } from './StatTile'

export interface MetricsStripProps {
  metrics: Metrics
  className?: string
}

export function MetricsStrip({ metrics, className = '' }: MetricsStripProps) {
  return (
    <section className={`metrics-strip ${className}`.trim()} aria-label="Session metrics">
      <div className="metrics-strip-head">
        <span className="eyebrow">Session metrics</span>
        <span className="metrics-strip-note">Measured this session</span>
      </div>
      <div className="metrics-grid">
        <StatTile
          label="Avg inference"
          value={formatMs(metrics.avgInferenceMs)}
          hint="On-device"
          icon={Timer}
        />
        <StatTile
          label="Assessed"
          value={metrics.totalAssessed}
          hint="Local scans"
          icon={Activity}
        />
        <StatTile
          label="Queued now"
          value={metrics.queuedCount}
          hint="Waiting to sync"
          icon={Database}
          tone={metrics.queuedCount > 0 ? 'accent' : 'default'}
        />
        <StatTile
          label="Avg queue wait"
          value={formatDuration(metrics.avgQueueWaitMs)}
          hint="Queued → synced"
          icon={Timer}
        />
        <StatTile
          label="Sync success"
          value={formatPercent(metrics.syncSuccessRate)}
          hint="Session rate"
          icon={CheckCircle2}
          tone="good"
        />
        <StatTile
          label="Retries"
          value={metrics.retryCount}
          hint="Backoff events"
          icon={RefreshCw}
          tone={metrics.retryCount > 0 ? 'critical' : 'default'}
        />
      </div>
    </section>
  )
}

export interface DemoBarProps {
  visible: boolean
  caption: string
  step: number
  totalSteps: number
  onStop: () => void
  className?: string
}

export function DemoBar({ visible, caption, step, totalSteps, onStop, className = '' }: DemoBarProps) {
  if (!visible) return null

  const safeTotal = Math.max(1, totalSteps)
  const safeStep = Math.max(1, Math.min(step, safeTotal))

  return (
    <div className={`demo-bar ${className}`.trim()} role="status" aria-live="polite">
      <span className="demo-bar-icon" aria-hidden>
        <Gauge size={17} />
      </span>
      <div className="demo-bar-body">
        <div className="demo-bar-top">
          <span className="demo-bar-kicker">Guided demo</span>
          <span className="demo-bar-step tabular">
            Step {safeStep}/{safeTotal}
          </span>
        </div>
        <p className="demo-bar-caption">{caption}</p>
        <div className="demo-bar-progress" aria-hidden>
          {Array.from({ length: safeTotal }, (_, index) => (
            <span key={index} className={index < safeStep ? 'is-done' : ''} />
          ))}
        </div>
      </div>
      <button type="button" className="demo-stop" onClick={onStop}>
        <span className="demo-stop-icon" aria-hidden />
        Stop
      </button>
    </div>
  )
}

export interface GuidedDemoButtonProps {
  onStart: () => void
  hidden?: boolean
  className?: string
}

export function GuidedDemoButton({ onStart, hidden = false, className = '' }: GuidedDemoButtonProps) {
  if (hidden) return null
  return (
    <button type="button" className={`demo-fab ${className}`.trim()} onClick={onStart}>
      <Sparkles size={14} aria-hidden />
      Guided demo
    </button>
  )
}
