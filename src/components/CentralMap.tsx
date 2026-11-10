import { useCallback, useState } from 'react'
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { MapMarker } from './_fixtures'
import { damageLabel, priorityColor } from './format'
import { OfflineMap } from './OfflineMap'

export interface CentralMapProps {
  markers: MapMarker[]
  className?: string
}

const TILE_FAILURE_LIMIT = 3

export function CentralMap({ markers, className = '' }: CentralMapProps) {
  const [tileFailures, setTileFailures] = useState(0)
  const handleTileError = useCallback(() => setTileFailures((value) => value + 1), [])

  const center: [number, number] =
    markers.length > 0
      ? [
          markers.reduce((sum, marker) => sum + marker.lat, 0) / markers.length,
          markers.reduce((sum, marker) => sum + marker.lng, 0) / markers.length,
        ]
      : [18.5234, 73.8567]

  if (tileFailures >= TILE_FAILURE_LIMIT) {
    return (
      <div className={`central-map ${className}`.trim()}>
        <div className="central-map-fallback">
          <span className="mini-badge">Map tiles unavailable · offline view</span>
          <OfflineMap markers={markers} />
        </div>
      </div>
    )
  }

  return (
    <div className={`central-map ${className}`.trim()}>
      <MapContainer center={center} zoom={12} scrollWheelZoom={false} className="central-leaflet">
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains="abcd"
          eventHandlers={{ tileerror: handleTileError }}
        />
        {markers.map((marker) => {
          const color = priorityColor(marker.priority)
          return (
            <CircleMarker
              key={marker.id}
              center={[marker.lat, marker.lng]}
              radius={8}
              pathOptions={{ color: '#0B1020', weight: 2, fillColor: color, fillOpacity: 1 }}
            >
              <Popup>
                <div className="central-popup">
                  <strong>{marker.label}</strong>
                  <span>
                    {marker.damageClass ? damageLabel(marker.damageClass) : 'Damage unknown'}
                    {typeof marker.severity === 'number' ? ` · ${marker.severity}/100` : ''}
                  </span>
                  <span style={{ color }}>{marker.priority} priority</span>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>
      <div className="central-map-legend" aria-hidden>
        {(['Critical', 'High', 'Medium', 'Low'] as const).map((priority) => (
          <span key={priority} className="central-legend-item">
            <span className="central-legend-dot" style={{ background: priorityColor(priority) }} />
            {priority}
          </span>
        ))}
      </div>
    </div>
  )
}
