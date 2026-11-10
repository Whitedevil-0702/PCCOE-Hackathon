import { useId, useState } from 'react'
import { Activity } from 'lucide-react'
import type { ChartPoint } from './uiTypes'
import { formatClock } from './format'
import { EmptyState } from './EmptyState'
import { Panel } from './Panel'

const WIDTH = 720
const HEIGHT = 260
const MARGIN = { top: 20, right: 18, bottom: 28, left: 36 }

export interface SyncProgressChartProps {
  data: ChartPoint[]
  title?: string
  subtitle?: string
  className?: string
}

export function SyncProgressChart({
  data,
  title = 'Sync Progress',
  subtitle = 'Session timeline · synced vs pending',
  className = '',
}: SyncProgressChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const rawId = useId()
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, '')
  const innerWidth = WIDTH - MARGIN.left - MARGIN.right
  const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom
  const maxValue = Math.max(1, ...data.flatMap((point) => [point.synced, point.pending]))
  const yMax = Math.max(5, Math.ceil(maxValue / 5) * 5)

  const xFor = (index: number) =>
    data.length <= 1 ? MARGIN.left + innerWidth / 2 : MARGIN.left + (index / (data.length - 1)) * innerWidth
  const yFor = (value: number) => MARGIN.top + innerHeight - (value / yMax) * innerHeight

  const buildLine = (key: 'synced' | 'pending') =>
    data.map((point, index) => `${index === 0 ? 'M' : 'L'} ${xFor(index).toFixed(2)} ${yFor(point[key]).toFixed(2)}`).join(' ')

  const syncedLine = buildLine('synced')
  const pendingLine = buildLine('pending')
  const baseline = MARGIN.top + innerHeight
  const syncedArea =
    data.length > 0
      ? `${syncedLine} L ${xFor(data.length - 1).toFixed(2)} ${baseline} L ${xFor(0).toFixed(2)} ${baseline} Z`
      : ''
  const pendingArea =
    data.length > 0
      ? `${pendingLine} L ${xFor(data.length - 1).toFixed(2)} ${baseline} L ${xFor(0).toFixed(2)} ${baseline} Z`
      : ''

  const ticks = [0, 0.25, 0.5, 0.75, 1]
  const xLabelIndexes = data.length <= 1 ? [0] : [0, Math.floor((data.length - 1) / 2), data.length - 1]
  const hoveredPoint = hoveredIndex === null ? null : data[hoveredIndex]

  return (
    <Panel
      title={title}
      icon={Activity}
      subtitle={subtitle}
      className={`chart-panel ${className}`.trim()}
      actions={
        <div className="chart-legend" aria-hidden>
          <span className="chart-legend-item">
            <span className="chart-legend-dot is-synced" />
            Synced
          </span>
          <span className="chart-legend-item">
            <span className="chart-legend-dot is-pending" />
            Pending
          </span>
        </div>
      }
    >
      {data.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No sync activity yet"
          message="Run a sync to see synced and pending counts over time."
          compact
        />
      ) : (
        <div className="chart-wrap">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="chart-svg"
            role="img"
            aria-label="Sync progress over time"
          >
            <defs>
              <linearGradient id={`synced-area-${uid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22C55E" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
              </linearGradient>
              <linearGradient id={`pending-area-${uid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EAB308" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#EAB308" stopOpacity="0" />
              </linearGradient>
            </defs>

            {ticks.map((tick) => {
              const y = MARGIN.top + innerHeight - tick * innerHeight
              return (
                <g key={tick}>
                  <line
                    x1={MARGIN.left}
                    x2={WIDTH - MARGIN.right}
                    y1={y}
                    y2={y}
                    className="chart-grid-line"
                  />
                  <text x={MARGIN.left - 8} y={y + 3} textAnchor="end" className="chart-axis-text">
                    {Math.round(tick * yMax)}
                  </text>
                </g>
              )
            })}

            <path d={pendingArea} fill={`url(#pending-area-${uid})`} />
            <path d={syncedArea} fill={`url(#synced-area-${uid})`} />
            <path d={pendingLine} className="chart-line is-pending" />
            <path d={syncedLine} className="chart-line is-synced" />

            {xLabelIndexes.map((index) => (
              <text
                key={index}
                x={xFor(index)}
                y={HEIGHT - 8}
                textAnchor={index === 0 ? 'start' : index === data.length - 1 ? 'end' : 'middle'}
                className="chart-axis-text"
              >
                {formatClock(data[index].t)}
              </text>
            ))}

            {hoveredIndex !== null && hoveredPoint && (
              <g pointerEvents="none">
                <line
                  x1={xFor(hoveredIndex)}
                  x2={xFor(hoveredIndex)}
                  y1={MARGIN.top}
                  y2={baseline}
                  className="chart-crosshair"
                />
                <circle cx={xFor(hoveredIndex)} cy={yFor(hoveredPoint.pending)} r="4" className="chart-point is-pending" />
                <circle cx={xFor(hoveredIndex)} cy={yFor(hoveredPoint.synced)} r="4" className="chart-point is-synced" />
                <g
                  transform={`translate(${Math.min(WIDTH - 142, Math.max(8, xFor(hoveredIndex) + 10))} ${MARGIN.top + 4})`}
                >
                  <rect width="132" height="52" rx="8" className="chart-tooltip-bg" />
                  <text x="9" y="15" className="chart-tooltip-time">
                    {formatClock(hoveredPoint.t)}
                  </text>
                  <circle cx="11" cy="28" r="3" fill="#22C55E" />
                  <text x="20" y="32" className="chart-tooltip-text">
                    Synced {hoveredPoint.synced}
                  </text>
                  <circle cx="11" cy="42" r="3" fill="#EAB308" />
                  <text x="20" y="46" className="chart-tooltip-text">
                    Pending {hoveredPoint.pending}
                  </text>
                </g>
              </g>
            )}

            {data.map((point, index) => (
              <circle
                key={`${point.t}-${index}`}
                cx={xFor(index)}
                cy={yFor(point.synced)}
                r="11"
                fill="transparent"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onFocus={() => setHoveredIndex(index)}
                onBlur={() => setHoveredIndex(null)}
                tabIndex={0}
                role="img"
                aria-label={`${formatClock(point.t)}: ${point.synced} synced, ${point.pending} pending`}
              />
            ))}
          </svg>
        </div>
      )}
    </Panel>
  )
}
