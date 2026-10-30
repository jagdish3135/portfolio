import { useLayoutEffect, useMemo, useRef } from 'react'
import type { Diagram, DiagramNode } from '../data/projects'
import { gsap, DUR, EASE, REVEAL_START } from '../lib/motion'
import { prefersReducedMotion } from '../lib/device'

/*
 * Draws a Diagram as inline SVG: lanes are columns, nodes stack inside them, edges are
 * curves (or straight drops inside a lane), and an optional band sits under some lanes.
 * Real <text>, so it stays readable to search engines and screen readers.
 */

const W = 1200
const TOP = 64
const NODE_H = 66
const GAP = 28
const PAD = 14

type Box = { x: number; y: number; w: number; h: number; node: DiagramNode; lane: number }

/** The page's text colour at a given strength, so the diagram follows the theme. */
const ink = (a: number) => `color-mix(in srgb, var(--ink) ${Math.round(a * 100)}%, transparent)`

/** Squeezes text that would overflow its box (a rough width estimate per character). */
const fit = (text: string, perChar: number, room: number) =>
  text.length * perChar > room ? { textLength: room, lengthAdjust: 'spacingAndGlyphs' as const } : {}

export function ArchDiagram({ diagram, accent, label }: { diagram: Diagram; accent: string; label: string }) {
  const root = useRef<HTMLDivElement>(null)
  const { lanes, edges, band } = diagram
  const laneW = W / lanes.length
  const nodeW = laneW - PAD * 2
  const maxNodes = Math.max(...lanes.map((l) => l.nodes.length))
  const bodyH = maxNodes * NODE_H + (maxNodes - 1) * GAP
  const channelY = TOP + bodyH + 22
  const bandY = TOP + bodyH + 54
  const H = band ? bandY + 70 : TOP + bodyH + 40

  const boxes = useMemo(() => {
    const map = new Map<string, Box>()
    lanes.forEach((lane, li) => {
      const h = lane.nodes.length * NODE_H + (lane.nodes.length - 1) * GAP
      const y0 = TOP + (bodyH - h) / 2
      lane.nodes.forEach((node, ni) => {
        map.set(node.id, { x: li * laneW + PAD, y: y0 + ni * (NODE_H + GAP), w: nodeW, h: NODE_H, node, lane: li })
      })
    })
    return map
  }, [lanes, laneW, nodeW, bodyH])

  const paths = edges.map((e) => {
    const a = boxes.get(e.from)!
    const b = boxes.get(e.to)!
    // Inside a lane: a straight drop, with room for a label beside it.
    if (a.lane === b.lane) {
      const x = a.x + a.w / 2
      return { ...e, d: `M${x} ${a.y + a.h} L${x} ${b.y - 4}`, mid: { x, y: (a.y + a.h + b.y) / 2 }, labelAt: 'side' as const }
    }
    const x1 = a.x + a.w
    const y1 = a.y + a.h / 2
    const x2 = b.x - 4
    const y2 = b.y + b.h / 2
    // Skipping a lane: run down the gap, along a channel under every node, and up into the target,
    // so the line never crosses a box.
    if (b.lane - a.lane >= 2) {
      const r = 10
      const xa = x1 + PAD
      const xb = b.x - PAD
      const d = [
        `M${x1} ${y1}`,
        `L${xa - r} ${y1} Q${xa} ${y1} ${xa} ${y1 + r}`,
        `L${xa} ${channelY - r} Q${xa} ${channelY} ${xa + r} ${channelY}`,
        `L${xb - r} ${channelY} Q${xb} ${channelY} ${xb} ${channelY - r}`,
        `L${xb} ${y2 + r} Q${xb} ${y2} ${xb + r} ${y2}`,
        `L${x2} ${y2}`,
      ].join(' ')
      return { ...e, d, mid: { x: (xa + xb) / 2, y: channelY }, labelAt: 'center' as const }
    }
    // Next lane over: a curve. The gap is too narrow for a label.
    const c = (x2 - x1) * 0.5
    return { ...e, d: `M${x1} ${y1} C${x1 + c} ${y1} ${x2 - c} ${y2} ${x2} ${y2}`, mid: { x: (x1 + x2) / 2, y: (y1 + y2) / 2 }, labelAt: 'none' as const }
  })

  useLayoutEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: REVEAL_START, once: true } })
      tl.from('[data-node]', { opacity: 0, y: 14, duration: DUR.base, stagger: 0.05, ease: EASE })
      tl.fromTo('[data-edge]', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: DUR.slow, stagger: 0.06, ease: 'power2.inOut' }, 0.2)
      tl.from('[data-fade]', { opacity: 0, duration: DUR.base }, 0.5)
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={root} className="-mx-[var(--gutter)] overflow-x-auto px-[var(--gutter)] md:mx-0 md:overflow-visible md:px-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full min-w-[880px]"
        role="img"
        aria-labelledby="arch-title"
        fontFamily="Inter Variable, system-ui, sans-serif"
      >
        <title id="arch-title">{label}</title>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 1 L9 5 L0 9" fill="none" style={{ stroke: ink(0.55) }} strokeWidth="1.4" />
          </marker>
        </defs>

        {lanes.map((lane, i) => (
          <g key={lane.title} data-fade>
            {i > 0 && <line x1={i * laneW} y1={8} x2={i * laneW} y2={TOP + bodyH + 10} style={{ stroke: ink(0.06) }} />}
            <text x={i * laneW + PAD} y={24} style={{ fill: 'var(--mute)' }} fontSize="11.5" letterSpacing="0.08em" fontWeight="500">
              {lane.title.toUpperCase()}
            </text>
          </g>
        ))}

        {paths.map((p, i) => (
          <g key={i}>
            <path
              d={p.d}
              fill="none"
              style={{ stroke: ink(0.4) }}
              strokeWidth="1.3"
              markerEnd="url(#arrow)"
              {...(p.dashed
                ? { strokeDasharray: '4 5', 'data-fade': true }
                : { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 0, 'data-edge': true })}
            />
            {p.label && p.labelAt !== 'none' && (
              <g data-fade>
                <rect
                  x={p.labelAt === 'side' ? p.mid.x + 8 : p.mid.x - (p.label.length * 6.4 + 14) / 2}
                  y={p.mid.y - 10}
                  width={p.label.length * 6.4 + 14}
                  height={20}
                  rx={10}
                  style={{ fill: 'var(--bg)', stroke: ink(0.15) }}
                />
                <text
                  x={p.labelAt === 'side' ? p.mid.x + 15 : p.mid.x}
                  y={p.mid.y + 4}
                  style={{ fill: 'var(--mute)' }}
                  fontSize="11"
                  textAnchor={p.labelAt === 'side' ? 'start' : 'middle'}
                >
                  {p.label}
                </text>
              </g>
            )}
          </g>
        ))}

        {[...boxes.values()].map(({ x, y, w, h, node }) => (
          <g key={node.id} data-node>
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              rx={12}
              style={{ fill: node.accent ? accent : ink(0.03), stroke: node.accent ? accent : ink(0.16) }}
              fillOpacity={node.accent ? 0.1 : 1}
              strokeOpacity={node.accent ? 0.75 : 1}
            />
            <text x={x + 14} y={y + 28} style={{ fill: 'var(--ink)' }} fontSize="15" fontWeight="600" {...fit(node.label, 8.4, w - 28)}>
              {node.label}
            </text>
            {node.sub && (
              <text x={x + 14} y={y + 48} style={{ fill: 'var(--mute)' }} fontSize="11.5" {...fit(node.sub, 6.1, w - 28)}>
                {node.sub}
              </text>
            )}
          </g>
        ))}

        {band && (
          <g data-fade>
            {Array.from({ length: band.lanes[1] - band.lanes[0] + 1 }, (_, k) => {
              const li = band.lanes[0] + k
              const lowest = [...boxes.values()].filter((b) => b.lane === li).sort((a, b) => b.y - a.y)[0]
              const x = li * laneW + laneW / 2
              return <line key={li} x1={x} y1={lowest.y + lowest.h} x2={x} y2={bandY} style={{ stroke: ink(0.25) }} strokeDasharray="3 4" />
            })}
            <rect
              x={band.lanes[0] * laneW + PAD}
              y={bandY}
              width={(band.lanes[1] - band.lanes[0] + 1) * laneW - PAD * 2}
              height={54}
              rx={12}
              style={{ fill: ink(0.03), stroke: ink(0.16) }}
              strokeDasharray="5 5"
            />
            <text x={band.lanes[0] * laneW + PAD + 16} y={bandY + 23} style={{ fill: 'var(--ink)' }} fontSize="13.5" fontWeight="600">
              {band.label}
            </text>
            {band.sub && (
              <text x={band.lanes[0] * laneW + PAD + 16} y={bandY + 41} style={{ fill: 'var(--mute)' }} fontSize="11.5">
                {band.sub}
              </text>
            )}
          </g>
        )}
      </svg>
    </div>
  )
}
