import { useId, useState } from 'react'
import type { MapMarker } from './uiTypes'
import { priorityColor, prioritySlug } from './format'

const MAP_WIDTH = 800
const MAP_HEIGHT = 420
const MAP_PADDING = 66

interface ProjectedMarker extends MapMarker {
  x: number
  y: number
}

function projectMarkers(markers: MapMarker[]): ProjectedMarker[] {
  if (markers.length === 0) return []
  if (markers.length === 1) {
    return [{ ...markers[0], x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 }]
  }

  const lats = markers.map((marker) => marker.lat)
  const lngs = markers.map((marker) => marker.lng)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)
  const latSpan = maxLat - minLat || 0.0001
  const lngSpan = maxLng - minLng || 0.0001
  const innerWidth = MAP_WIDTH - MAP_PADDING * 2
  const innerHeight = MAP_HEIGHT - MAP_PADDING * 2

  return markers.map((marker) => ({
    ...marker,
    x: MAP_PADDING + ((marker.lng - minLng) / lngSpan) * innerWidth,
    y: MAP_PADDING + ((maxLat - marker.lat) / latSpan) * innerHeight,
  }))
}

export interface OfflineMapProps {
  markers: MapMarker[]
  className?: string
  emptyMessage?: string
  ariaLabel?: string
}

export function OfflineMap({
  markers,
  className = '',
  emptyMessage = 'Capture geo-tagged assessments to populate this map.',
  ariaLabel,
}: OfflineMapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const rawId = useId()
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, '')
  const projected = projectMarkers(markers)

  return (
    <div className={`offline-map ${className}`.trim()}>
      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        role="img"
        aria-label={ariaLabel ?? `Offline map with ${markers.length} assessment markers`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id={`map-glow-${uid}`} cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#1C2C4E" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#111B30" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#0B1424" stopOpacity="0" />
          </radialGradient>
          <pattern id={`map-dots-${uid}`} width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1" fill="#223052" opacity="0.65" />
          </pattern>
          <filter id={`pin-glow-${uid}`} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="#0B1424" />
        <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill={`url(#map-dots-${uid})`} opacity="0.45" />
        <ellipse cx={MAP_WIDTH / 2} cy={MAP_HEIGHT / 2} rx={360} ry={190} fill={`url(#map-glow-${uid})`} />

        <g fill="none" stroke="#1B2741" strokeWidth="1.1" opacity="0.9">
          <path d="M-40 104 C 110 48 214 154 372 102 S 640 34 852 108" />
          <path d="M-40 152 C 120 94 238 198 402 146 S 664 86 852 158" />
          <path d="M-40 206 C 118 150 254 248 420 196 S 678 142 852 212" />
          <path d="M-40 268 C 132 214 260 306 432 256 S 690 206 852 272" />
          <path d="M-40 330 C 140 282 272 366 448 318 S 700 274 852 336" />
          <path d="M-40 390 C 152 348 286 418 462 382 S 712 344 852 398" />
          <path d="M64 -20 C 118 74 44 160 104 250 S 168 360 110 440" />
          <path d="M236 -20 C 288 82 214 168 274 258 S 338 366 280 440" />
          <path d="M462 -20 C 514 82 440 168 500 258 S 564 366 506 440" />
          <path d="M660 -20 C 712 82 638 168 698 258 S 762 366 704 440" />
        </g>

        <g opacity="0.55">
          <rect x="140" y="140" width="188" height="104" rx="12" fill="#17233D" stroke="#233254" strokeWidth="1" />
          <rect x="486" y="220" width="210" height="118" rx="16" fill="#16213A" stroke="#233254" strokeWidth="1" />
          <path d="M330 88 L386 54 L448 92 L440 150 L344 156Z" fill="#17233D" stroke="#233254" strokeWidth="1" />
        </g>

        <g transform={`translate(18 18)`}>
          <rect width="128" height="25" rx="12.5" fill="rgba(11, 16, 32, 0.86)" stroke="#1F2A44" />
          <circle cx="14" cy="12.5" r="3.6" fill="#3B82F6" />
          <text x="25" y="16" fill="#8A97B2" fontFamily="Inter, sans-serif" fontSize="8.5" fontWeight="700" letterSpacing="1.4">
            OFFLINE MAP
          </text>
        </g>

        <g transform={`translate(${MAP_WIDTH - 46} 42)`}>
          <circle r="15" fill="rgba(11, 16, 32, 0.7)" stroke="#1F2A44" />
          <path d="M0 -8 L4.2 5 L0 2.2 L-4.2 5Z" fill="#FF7A1A" />
          <text y="25" textAnchor="middle" fill="#5F6E8C" fontFamily="Inter, sans-serif" fontSize="8" fontWeight="700">
            N
          </text>
        </g>

        {projected.length === 0 ? (
          <g transform={`translate(${MAP_WIDTH / 2} ${MAP_HEIGHT / 2})`}>
            <circle r="30" fill="#141F36" stroke="#1F2A44" />
            <path
              d="M0 -12 C -7 -12 -12 -7 -12 0 C -12 8 0 17 0 17 C 0 17 12 8 12 0 C 12 -7 7 -12 0 -12Z"
              fill="none"
              stroke="#5F6E8C"
              strokeWidth="1.6"
            />
            <circle cy="-1" r="3.4" fill="#5F6E8C" />
            <text y="52" textAnchor="middle" fill="#8A97B2" fontFamily="Inter, sans-serif" fontSize="12" fontWeight="600">
              No geo-tagged scans yet
            </text>
            <text y="71" textAnchor="middle" fill="#5F6E8C" fontFamily="Inter, sans-serif" fontSize="10">
              {emptyMessage}
            </text>
          </g>
        ) : (
          projected.map((marker) => {
            const color = priorityColor(marker.priority)
            const hovered = hoveredId === marker.id
            const labelText = marker.label.length > 44 ? `${marker.label.slice(0, 41)}…` : marker.label
            const labelWidth = Math.min(288, Math.max(126, labelText.length * 6 + 20))
            const placeLeft = marker.x > MAP_WIDTH * 0.58
            const labelX = Math.min(
              MAP_WIDTH - labelWidth - 8,
              Math.max(8, placeLeft ? marker.x - labelWidth - 14 : marker.x + 14),
            )
            const labelY = Math.min(MAP_HEIGHT - 30, Math.max(34, marker.y - 34))

            return (
              <g
                key={marker.id}
                transform={`translate(${marker.x} ${marker.y})`}
                className={`map-marker is-${prioritySlug(marker.priority)}`}
                tabIndex={0}
                role="img"
                aria-label={marker.label}
                onMouseEnter={() => setHoveredId(marker.id)}
                onMouseLeave={() => setHoveredId(null)}
                onFocus={() => setHoveredId(marker.id)}
                onBlur={() => setHoveredId(null)}
              >
                <title>{marker.label}</title>
                {marker.priority === 'Critical' && (
                  <circle className="pin-halo" r={hovered ? 30 : 25} fill={color} opacity="0.16" />
                )}
                <line x1="0" y1="8" x2="0" y2="18" stroke={color} strokeWidth="2" opacity="0.7" />
                <circle
                  r={hovered ? 10 : 8}
                  fill={color}
                  stroke="#0B1020"
                  strokeWidth="2"
                  filter={`url(#pin-glow-${uid})`}
                  className="pin-body"
                />
                <circle r="2.6" fill="#0B1020" />
                <g transform={`translate(${labelX - marker.x} ${labelY - marker.y})`} className="pin-label">
                  <rect
                    width={labelWidth}
                    height="24"
                    rx="7"
                    fill={hovered ? '#1B2742' : 'rgba(11, 16, 32, 0.88)'}
                    stroke={color}
                    strokeOpacity={hovered ? 0.85 : 0.45}
                  />
                  <circle cx="10" cy="12" r="2.6" fill={color} />
                  <text
                    x="17"
                    y="12.5"
                    dominantBaseline="middle"
                    fill={hovered ? '#FFFFFF' : '#E8ECF4'}
                    fontFamily="Inter, sans-serif"
                    fontSize="10"
                    fontWeight="600"
                  >
                    {labelText}
                  </text>
                </g>
              </g>
            )
          })
        )}

        <g transform={`translate(18 ${MAP_HEIGHT - 20})`}>
          <text fill="#43516F" fontFamily="Inter, sans-serif" fontSize="8" fontWeight="600" letterSpacing="1.1">
            LOCAL CACHE · NO NETWORK REQUIRED
          </text>
        </g>
      </svg>
    </div>
  )
}
