import { MapPin } from 'lucide-react'
import type { TriageRecommendation } from './uiTypes'
import { EmptyState } from './EmptyState'
import { PriorityChip } from './PriorityChip'

export interface RecommendationListProps {
  recommendations: TriageRecommendation[]
  emptyMessage?: string
  className?: string
}

export function RecommendationList({
  recommendations,
  emptyMessage = 'Each saved local scan produces a priority recommendation here.',
  className = '',
}: RecommendationListProps) {
  if (recommendations.length === 0) {
    return (
      <EmptyState
        icon={MapPin}
        title="No recommendations yet"
        message={emptyMessage}
        compact
        className={className}
      />
    )
  }

  return (
    <ol className={`triage-list ${className}`.trim()}>
      {recommendations.map((recommendation, index) => (
        <li className="triage-item" key={recommendation.id}>
          <span className="triage-index tabular" aria-hidden>
            {index + 1}
          </span>
          <div className="triage-copy">
            <div className="triage-title-row">
              <span className="triage-title">{recommendation.title}</span>
              <PriorityChip priority={recommendation.priority} />
            </div>
            <p>{recommendation.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
