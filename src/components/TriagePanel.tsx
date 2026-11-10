import { AlertTriangle, CheckCircle2, MapPin, ScanLine } from 'lucide-react'
import type { MapMarker, TriageRecommendation, TriageStats } from './_fixtures'
import { OfflineMap } from './OfflineMap'
import { Panel } from './Panel'
import { RecommendationList } from './RecommendationList'
import { StatTile } from './StatTile'

export interface TriagePanelProps {
  markers: MapMarker[]
  recommendations: TriageRecommendation[]
  stats: TriageStats
  title?: string
  subtitle?: string
  emptyMessage?: string
  className?: string
}

export function TriagePanel({
  markers,
  recommendations,
  stats,
  title = 'Triage',
  subtitle = 'Local recommendations · decision support only',
  emptyMessage,
  className = '',
}: TriagePanelProps) {
  return (
    <Panel
      title={title}
      icon={MapPin}
      subtitle={subtitle}
      className={`triage-panel ${className}`.trim()}
      actions={<span className="mini-badge">Local triage</span>}
    >
      <div className="triage-body">
        <OfflineMap markers={markers} emptyMessage={emptyMessage} />

        <div className="triage-recommendations">
          <p className="triage-heading">Triage recommendations:</p>
          <RecommendationList recommendations={recommendations} />
        </div>

        <div className="triage-stats">
          <StatTile label="Total Local Scans" value={stats.totalScans} icon={ScanLine} />
          <StatTile
            label="Critical Targets"
            value={stats.criticalTargets}
            tone="critical"
            icon={AlertTriangle}
          />
          <StatTile label="Synced" value={stats.synced} tone="good" icon={CheckCircle2} />
        </div>
      </div>
    </Panel>
  )
}
