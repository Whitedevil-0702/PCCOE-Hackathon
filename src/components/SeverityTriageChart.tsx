import { BarChart3, RefreshCw } from 'lucide-react'
import type { SeverityCounts } from './uiTypes'
import { PRIORITIES, priorityColor, prioritySlug } from './format'
import { EmptyState } from './EmptyState'
import { Panel } from './Panel'

const WIDTH = 560
const HEIGHT = 200
const PAD_X = 16
const BASELINE = HEIGHT - 30
const TOP = 22

export interface SeverityTriageChartProps {
  counts: SeverityCounts
  topSeverity: number
  topLabel?: string
  title?: string
  subtitle?: string
  className?: string
}

export function SeverityTriageChart({
  counts,
  topSeverity,
  topLabel,
  title = 'Severity Triage',
  subtitle = 'Priority distribution across local scans',
  className = '',
}: SeverityTriageChartProps) {
  const values = PRIORITIES.map((priority) => counts[priority])
  const total = values.reduce((sum, value) => sum + value, 0)
  const maxValue = Math.max(1, ...values)
  const slotWidth = (WIDTH - PAD_X * 2) / PRIORITIES.length
  const barWidth = Math.min(54, slotWidth * 0.52)

  return (
    <Panel
      title={title}
      icon={BarChart3}
      subtitle={subtitle}
      className={`chart-panel ${className}`.trim()}
      actions={
        <span className="priority-sync-tag">
          <RefreshCw size={10} aria-hidden />
          Priority Sync
        </span>
      }
    >
      <div className="severity-head">
        <div className="severity-score">
          <span>Severity Score:</span>
          <strong className="tabular">{Math.round(topSeverity)}/100</strong>
        </div>
        {topLabel && <p className="severity-top-label">{topLabel}</p>}
      </div>

      {total === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No triaged scans yet"
          message="Saved assessments will be grouped here by response priority."
          compact
        />
      ) : (
        <div className="severity-chart">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="chart-svg" role="img" aria-label="Priority distribution bar chart">
            {[0.33, 0.66, 1].map((fraction) => {
              const y = BASELINE - fraction * (BASELINE - TOP)
              return (
                <line
                  key={fraction}
                  x1={PAD_X}
                  x2={WIDTH - PAD_X}
                  y1={y}
                  y2={y}
                  className="chart-grid-line"
                />
              )
            })}

            {PRIORITIES.map((priority, index) => {
              const value = counts[priority]
              const color = priorityColor(priority)
              const barHeight = (value / maxValue) * (BASELINE - TOP)
              const x = PAD_X + index * slotWidth + (slotWidth - barWidth) / 2
              const y = BASELINE - barHeight

              return (
                <g key={priority} className={`severity-bar is-${prioritySlug(priority)}`}>
                  <title>{`${priority}: ${value}`}</title>
                  <rect
                    x={x}
                    y={TOP}
                    width={barWidth}
                    height={BASELINE - TOP}
                    rx="7"
                    className="severity-track"
                  />
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={Math.max(value > 0 ? 5 : 0, barHeight)}
                    rx="7"
                    fill={color}
                    opacity="0.88"
                    className="severity-fill"
                  />
                  <text x={x + barWidth / 2} y={Math.max(TOP + 11, y - 6)} textAnchor="middle" className="severity-value">
                    {value}
                  </text>
                  <text
                    x={x + barWidth / 2}
                    y={HEIGHT - 9}
                    textAnchor="middle"
                    className="severity-label"
                    fill={color}
                  >
                    {priority.toUpperCase()}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      )}
    </Panel>
  )
}
