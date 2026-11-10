import { AlertTriangle, CheckCircle2, MapPin, ScanLine } from 'lucide-react'
import {
  OfflineMap,
  PageHeader,
  Panel,
  PriorityChip,
  RecommendationList,
  StatTile,
} from '../components'
import {
  fixtureMarkers,
  fixtureRecommendations,
  fixtureTriageStats,
} from '../components/_fixtures'
import { priorityColor } from '../components/format'
import type { Priority } from '../lib/types'

const LEGEND: Priority[] = ['Critical', 'High', 'Medium', 'Low']

export default function MapPage() {
  const criticalCount = fixtureMarkers.filter((marker) => marker.priority === 'Critical').length

  return (
    <div className="page map-page">
      <PageHeader
        eyebrow="Geospatial Triage"
        title="Map & Triage"
        subtitle="Local markers show where damage assessments cluster. Recommendations are derived from saved field scans."
        actions={
          <span className="mini-badge">
            <MapPin size={12} aria-hidden />
            <b className="tabular">{fixtureMarkers.length}</b> local markers
          </span>
        }
      />

      <div className="map-layout">
        <Panel
          title="Assessment map"
          icon={MapPin}
          subtitle="Offline vector view · no tiles required"
          className="map-panel"
          actions={<span className="queue-pending-badge">{criticalCount} critical</span>}
        >
          <div className="map-legend">
            {LEGEND.map((priority) => (
              <span key={priority} className="map-legend-item">
                <span className="map-legend-dot" style={{ background: priorityColor(priority) }} aria-hidden />
                {priority}
              </span>
            ))}
          </div>
          <OfflineMap markers={fixtureMarkers} className="map-canvas" />
          <div className="map-foot">
            <span>Markers use on-device coordinates only.</span>
            <span className="map-foot-sep" aria-hidden>
              ·
            </span>
            <span>No external map service required.</span>
          </div>
        </Panel>

        <div className="map-side">
          <Panel
            title="Triage recommendations"
            icon={ScanLine}
            subtitle="Ordered by response urgency"
            actions={<span className="mini-badge">Local triage</span>}
          >
            <RecommendationList recommendations={fixtureRecommendations} />
          </Panel>

          <Panel title="Triage stats" icon={AlertTriangle} subtitle="Derived from local scans">
            <div className="map-stat-list">
              <StatTile label="Total local scans" value={fixtureTriageStats.totalScans} icon={ScanLine} />
              <StatTile
                label="Critical targets"
                value={fixtureTriageStats.criticalTargets}
                tone="critical"
                icon={AlertTriangle}
              />
              <StatTile label="Synced" value={fixtureTriageStats.synced} tone="good" icon={CheckCircle2} />
            </div>
            <div className="map-priority-row">
              {LEGEND.map((priority) => (
                <span key={priority} className="map-priority-item">
                  <PriorityChip priority={priority} />
                  <b className="tabular">
                    {fixtureMarkers.filter((marker) => marker.priority === priority).length}
                  </b>
                </span>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <p className="page-footnote">Decision-support, not a structural safety judgment.</p>
    </div>
  )
}
