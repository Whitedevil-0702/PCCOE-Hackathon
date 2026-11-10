import type { DamageClass } from '../lib/types'
import { damageColor } from './format'

export interface DamageSwatchProps {
  damageClass: DamageClass
  className?: string
}

export function DamageSwatch({ damageClass, className = '' }: DamageSwatchProps) {
  return (
    <span
      className={`damage-swatch ${className}`.trim()}
      style={{ background: damageColor(damageClass) }}
      aria-hidden
    />
  )
}
