import { useLayoutEffect, useRef } from 'react'

export function useFlip<T extends HTMLElement>(orderKey: string) {
  const containerRef = useRef<T | null>(null)
  const previousPositions = useRef(new Map<string, DOMRect>())

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    const prefersReducedMotion =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const nextPositions = new Map<string, DOMRect>()
    const nodes = container.querySelectorAll<HTMLElement>('[data-flip-key]')

    nodes.forEach((node) => {
      const key = node.dataset.flipKey
      if (!key) return

      const nextRect = node.getBoundingClientRect()
      nextPositions.set(key, nextRect)
      const previousRect = previousPositions.current.get(key)

      if (!previousRect || prefersReducedMotion) return

      const deltaX = previousRect.left - nextRect.left
      const deltaY = previousRect.top - nextRect.top
      if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) return

      node.animate(
        [{ transform: `translate(${deltaX}px, ${deltaY}px)` }, { transform: 'translate(0, 0)' }],
        {
          duration: 420,
          easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        },
      )
    })

    previousPositions.current = nextPositions
  }, [orderKey])

  return containerRef
}
