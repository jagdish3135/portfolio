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

export function ArchDiagram({ diagram, accent, label }: { diagram: Diagram; accent: string; label: string }) {
  const root = useRef<HTMLDivElement>(null)
  const { lanes, edges, band } = diagram
  const laneW = W / lanes.length
  const nodeW = laneW - PAD * 2
  const maxNodes = Math.max(...lanes.map((l) => l.nodes.length))
  const bodyH = maxNodes * NODE_H + (maxNodes - 1) * GAP
  const bandY = TOP + bodyH + 46
  const H = band ? bandY + 70 : TOP + bodyH + 24

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
    if (a.lane === b.lane) {
      const x = a.x + a.w / 2
      return { ...e, d: `M${x} ${a.y + a.h} L${x} ${b.y - 4}`, mid: { x, y: (a.y + a.h + b.y) / 2 } }
    }
    const x1 = a.x + a.w
    const y1 = a.y + a.h / 2
    const x2 = b.x - 4
    const y2 = b.y + b.h / 2
    const c = (x2 - x1) * 0.5
    return { ...e, d: `M${x1} ${y1} C${x1 + c} ${y1} ${x2 - c} ${y2} ${x2} ${y2}`, mid: { x: (x1 + x2) / 2, y: (y1 + y2) / 2 } }
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
            <path d="M0 1 L9 5 L0 9" fill="none" stroke="rgb(237 237 237 / 0.55)" strokeWidth="1.4" />
          </marker>
        </defs>

        {lanes.map((lane, i) => (
          <g key={lane.title} data-fade>
            {i > 0 && <line x1={i * laneW} y1={8} x2={i * laneW} y2={TOP + bodyH + 10} stroke="rgb(237 237 237 / 0.06)" />}
            <text x={i * laneW + PAD} y={24} fill="#8e8e97" fontSize="11.5" letterSpacing="0.08em" fontWeight="500">
              {lane.title.toUpperCase()}
            </text>
          </g>
        ))}

        {paths.map((p, i) => (
          <g key={i}>
            <path
              d={p.d}
              fill="none"
              stroke="rgb(237 237 237 / 0.4)"
              strokeWidth="1.3"
              markerEnd="url(#arrow)"
              {...(p.dashed
                ? { strokeDasharray: '4 5', 'data-fade': true }
                : { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 0, 'data-edge': true })}
            />
            {p.label && (
              <g data-fade>
                <rect x={p.mid.x + 8} y={p.mid.y - 10} width={p.label.length * 6.4 + 14} height={20} rx={10} fill="#0b0b0f" stroke="rgb(237 237 237 / 0.15)" />
                <text x={p.mid.x + 15} y={p.mid.y + 4} fill="#8e8e97" fontSize="11">
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
              fill={node.accent ? accent : 'rgb(255 255 255 / 0.03)'}
              fillOpacity={node.accent ? 0.1 : 1}
              stroke={node.accent ? accent : 'rgb(237 237 237 / 0.16)'}
              strokeOpacity={node.accent ? 0.75 : 1}
            />
            <text x={x + 14} y={y + 28} fill="#ededed" fontSize="15" fontWeight="600">
              {node.label}
            </text>
            {node.sub && (
              <text x={x + 14} y={y + 48} fill="#8e8e97" fontSize="11.5">
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
              return <line key={li} x1={x} y1={lowest.y + lowest.h} x2={x} y2={bandY} stroke="rgb(237 237 237 / 0.25)" strokeDasharray="3 4" />
            })}
            <rect
              x={band.lanes[0] * laneW + PAD}
              y={bandY}
              width={(band.lanes[1] - band.lanes[0] + 1) * laneW - PAD * 2}
              height={54}
              rx={12}
              fill="rgb(255 255 255 / 0.03)"
              stroke="rgb(237 237 237 / 0.16)"
              strokeDasharray="5 5"
            />
            <text x={band.lanes[0] * laneW + PAD + 16} y={bandY + 23} fill="#ededed" fontSize="13.5" fontWeight="600">
              {band.label}
            </text>
            {band.sub && (
              <text x={band.lanes[0] * laneW + PAD + 16} y={bandY + 41} fill="#8e8e97" fontSize="11.5">
                {band.sub}
              </text>
            )}
          </g>
        )}
      </svg>
    </div>
  )
}
