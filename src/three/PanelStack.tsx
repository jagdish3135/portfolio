import { useMemo, useRef, type MutableRefObject, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line, RoundedBox } from './primitives'
import * as THREE from 'three'

/*
 * An interface pulled apart into its design layers, like an exploded view:
 *   0  the 12-column grid
 *   1  wireframe blocks
 *   2  type
 *   3  components
 *   4  the selected button (the one accent)
 *
 * Every detail is opaque on purpose: three.js only refracts opaque objects through
 * transmissive glass, so the back layers show softly through the front panes.
 */

export const W = 3.2
export const H = 2.0
const D = 0.05
const SPACING = 0.68
const FACE = D / 2 + 0.004

const INK = '#d9d9de'
const DIM = '#6e6e77'
const DARK = '#2a2a31'
const ACCENT = '#c6ff3d'

type V3 = [number, number, number]

function roundedRect(w: number, h: number, r: number, seg = 6): V3[] {
  const pts: V3[] = []
  const corners: [number, number, number][] = [
    [w / 2 - r, h / 2 - r, 0],
    [-w / 2 + r, h / 2 - r, Math.PI / 2],
    [-w / 2 + r, -h / 2 + r, Math.PI],
    [w / 2 - r, -h / 2 + r, (3 * Math.PI) / 2],
  ]
  for (const [cx, cy, start] of corners) {
    for (let i = 0; i <= seg; i++) {
      const a = start + (i / seg) * (Math.PI / 2)
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0])
    }
  }
  pts.push(pts[0])
  return pts
}

function Outline({ w, h, r = 0.04, at = [0, 0], color = DIM, width = 1 }: { w: number; h: number; r?: number; at?: [number, number]; color?: string; width?: number }) {
  const points = useMemo(() => roundedRect(w, h, Math.min(r, w / 2, h / 2)), [w, h, r])
  return <Line points={points} color={color} lineWidth={width} position={[at[0], at[1], 0]} />
}

function Fill({ w, h, r = 0.02, at = [0, 0], color = INK }: { w: number; h: number; r?: number; at?: [number, number]; color?: string }) {
  const geo = useMemo(() => {
    const rr = Math.min(r, w / 2, h / 2)
    const s = new THREE.Shape()
    s.moveTo(-w / 2 + rr, -h / 2)
    s.lineTo(w / 2 - rr, -h / 2)
    s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + rr)
    s.lineTo(w / 2, h / 2 - rr)
    s.quadraticCurveTo(w / 2, h / 2, w / 2 - rr, h / 2)
    s.lineTo(-w / 2 + rr, h / 2)
    s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - rr)
    s.lineTo(-w / 2, -h / 2 + rr)
    s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + rr, -h / 2)
    return new THREE.ShapeGeometry(s, 4)
  }, [w, h, r])
  return (
    <mesh geometry={geo} position={[at[0], at[1], 0]}>
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  )
}

function Seg({ a, b, color = DIM, width = 1 }: { a: [number, number]; b: [number, number]; color?: string; width?: number }) {
  return <Line points={[[a[0], a[1], 0], [b[0], b[1], 0]]} color={color} lineWidth={width} />
}

/* ---------- the five layers ---------- */

function GridLayer() {
  const cols = 12
  const inner = W - 0.36
  const gap = 0.05
  const colW = (inner - gap * (cols - 1)) / cols
  return (
    <>
      {Array.from({ length: cols }, (_, i) => (
        <Fill key={i} w={colW} h={H - 0.36} r={0.01} color="#1c1c22" at={[-inner / 2 + colW / 2 + i * (colW + gap), 0]} />
      ))}
    </>
  )
}

function WireLayer() {
  return (
    <>
      <Outline w={W - 0.36} h={0.18} at={[0, 0.73]} />
      <Outline w={1.35} h={0.95} at={[-0.74, 0.0]} />
      <Seg a={[-1.415, 0.47]} b={[-0.065, -0.47]} />
      <Seg a={[-1.415, -0.47]} b={[-0.065, 0.47]} />
      <Outline w={1.25} h={0.42} at={[0.79, 0.26]} />
      <Outline w={1.25} h={0.42} at={[0.79, -0.26]} />
      <Outline w={W - 0.36} h={0.2} at={[0, -0.72]} />
    </>
  )
}

function TypeLayer() {
  return (
    <>
      <Fill w={0.42} h={0.05} at={[-1.2, 0.73]} color={DIM} />
      <Fill w={1.55} h={0.15} at={[-0.65, 0.42]} color={INK} />
      <Fill w={1.05} h={0.15} at={[-0.9, 0.2]} color={INK} />
      <Fill w={2.1} h={0.04} at={[-0.37, -0.02]} color={DIM} />
      <Fill w={1.9} h={0.04} at={[-0.47, -0.12]} color={DIM} />
      <Fill w={1.4} h={0.04} at={[-0.72, -0.22]} color={DIM} />
    </>
  )
}

function ComponentLayer() {
  const circle = useMemo(() => {
    const pts: V3[] = []
    for (let i = 0; i <= 40; i++) {
      const a = (i / 40) * Math.PI * 2
      pts.push([Math.cos(a) * 0.13, Math.sin(a) * 0.13, 0])
    }
    return pts
  }, [])
  return (
    <>
      <Outline w={0.62} h={0.18} r={0.09} at={[-0.4, -0.52]} color={INK} />
      <Outline w={0.3} h={0.16} r={0.08} at={[0.75, 0.6]} color={DIM} />
      <Fill w={0.11} h={0.11} r={0.055} at={[0.81, 0.6]} color={INK} />
      <Line points={circle} color={DIM} lineWidth={1} position={[1.25, 0.6, 0]} />
      <Seg a={[0.35, -0.52]} b={[1.35, -0.52]} color={DARK} width={1.5} />
      <Seg a={[0.35, -0.52]} b={[0.95, -0.52]} color={INK} width={1.5} />
      <Fill w={0.09} h={0.09} r={0.045} at={[0.95, -0.52]} color={INK} />
    </>
  )
}

function SelectionLayer() {
  const bx = -1.11
  const by = -0.52
  const bw = 0.62
  const bh = 0.18
  const pad = 0.06
  const sw = bw + pad * 2
  const sh = bh + pad * 2
  const handles: [number, number][] = [
    [bx - sw / 2, by + sh / 2],
    [bx + sw / 2, by + sh / 2],
    [bx - sw / 2, by - sh / 2],
    [bx + sw / 2, by - sh / 2],
  ]
  const arrow = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(0, 0)
    s.lineTo(0, -0.26)
    s.lineTo(0.065, -0.2)
    s.lineTo(0.11, -0.3)
    s.lineTo(0.145, -0.285)
    s.lineTo(0.1, -0.19)
    s.lineTo(0.185, -0.19)
    s.closePath()
    return new THREE.ShapeGeometry(s)
  }, [])
  return (
    <>
      <Fill w={bw} h={bh} r={0.09} at={[bx, by]} color={ACCENT} />
      <Outline w={sw} h={sh} r={0.005} at={[bx, by]} color={ACCENT} width={1.25} />
      {handles.map(([x, y], i) => (
        <Fill key={i} w={0.045} h={0.045} r={0.004} at={[x, y]} color={ACCENT} />
      ))}
      <Fill w={0.5} h={0.09} r={0.015} at={[bx - sw / 2 + 0.25, by + sh / 2 + 0.09]} color={ACCENT} />
      <mesh geometry={arrow} position={[bx + 0.2, by - 0.02, 0.001]}>
        <meshBasicMaterial color="#f5f5f5" toneMapped={false} />
      </mesh>
    </>
  )
}

const LAYERS: (() => ReactNode)[] = [GridLayer, WireLayer, TypeLayer, ComponentLayer, SelectionLayer]

/* ---------- panes ---------- */

function Pane({
  index,
  count,
  tier,
  spread,
  children,
}: {
  index: number
  count: number
  tier: 'full' | 'lite'
  spread: MutableRefObject<number>
  children: ReactNode
}) {
  const ref = useRef<THREE.Group>(null)
  const outline = useMemo(() => roundedRect(W, H, 0.07), [])
  const offset = index - (count - 1) / 2

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const g = ref.current
    if (!g) return
    g.position.z = offset * SPACING * spread.current + Math.sin(t * 0.8 + index * 0.9) * 0.03
    g.position.y = Math.sin(t * 0.6 + index * 1.3) * 0.025
  })

  return (
    <group ref={ref}>
      <RoundedBox args={[W, H, D]} radius={0.06} smoothness={4}>
        {tier === 'full' ? (
          <meshPhysicalMaterial
            transmission={1}
            thickness={0.4}
            roughness={0.22}
            ior={1.25}
            color="#f4f6fa"
            clearcoat={0.6}
            clearcoatRoughness={0.1}
            envMapIntensity={1.5}
          />
        ) : (
          <meshPhysicalMaterial color="#c9ccd3" transparent opacity={0.1} roughness={0.15} envMapIntensity={1.4} depthWrite={false} />
        )}
      </RoundedBox>
      <Line points={outline} color={index === count - 1 ? '#d4d4da' : '#7a7a83'} lineWidth={1.25} position={[0, 0, FACE]} />
      <group position={[0, 0, FACE + 0.002]}>{children}</group>
    </group>
  )
}

export function PanelStack({ tier, ready }: { tier: 'full' | 'lite'; ready: boolean }) {
  // 0 = stacked flat, 1 = pulled apart. Eases out once the intro hands over.
  const spread = useRef(0.05)
  useFrame((_, dt) => {
    spread.current = THREE.MathUtils.damp(spread.current, ready ? 1 : 0.05, 1.6, dt)
  })
  const layers = tier === 'lite' ? [LAYERS[0], LAYERS[2], LAYERS[3], LAYERS[4]] : LAYERS
  return (
    <>
      {layers.map((Layer, i) => (
        <Pane key={i} index={i} count={layers.length} tier={tier} spread={spread}>
          <Layer />
        </Pane>
      ))}
    </>
  )
}
