export interface SkeletonProps {
  variant?: 'block' | 'line' | 'circle'
  lines?: number
  className?: string
}

export function Skeleton({ variant = 'block', lines = 3, className = '' }: SkeletonProps) {
  if (variant === 'line') {
    return (
      <div className={`skeleton-lines ${className}`.trim()} aria-hidden>
        {Array.from({ length: lines }, (_, index) => (
          <span key={index} className="skeleton skeleton-line" style={{ width: `${100 - index * 14}%` }} />
        ))}
      </div>
    )
  }
  return <span className={`skeleton skeleton-${variant} ${className}`.trim()} aria-hidden />
}
