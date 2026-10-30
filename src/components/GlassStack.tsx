import type { ReactNode } from 'react'

/**
 * A small exploded stack of glass panes, drawn with CSS 3D (no WebGL), so it can be
 * used many times on a page. Same motif as the hero.
 *
 * Layers go bottom → top. The parent sets --tilt-x / --tilt-y (degrees) to lean it toward
 * the pointer, and the panes spread apart while the parent `.group` is hovered.
 * The last layer is "active": its outline turns lime on hover.
 */
export function GlassStack({ layers, className = '' }: { layers: ReactNode[]; className?: string }) {
  return (
    <div className={`glass-stack ${className}`} aria-hidden="true">
      <div className="glass-stack__float">
        <div className="glass-stack__tilt">
          {layers.map((layer, i) => (
            <div
              key={i}
              className={`glass-stack__pane ${i === layers.length - 1 ? 'is-top' : ''}`}
              style={{ ['--i' as string]: i }}
            >
              <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                {layer}
              </svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
