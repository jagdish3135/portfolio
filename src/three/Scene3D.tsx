import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { PanelStack } from './PanelStack'

type Tier = 'full' | 'lite'
type Drag = { active: boolean; lastX: number; rot: number }

// Resting pose: an exploded, three-quarter view of the layers.
const BASE = { x: -0.22, y: -0.78, z: -0.05 }

/** Pointer position in -1..1, tracked on the window so text over the canvas doesn't block it. */
function useWindowPointer() {
  const p = useRef({ x: 0, y: 0 })
  useEffect(() => {
    const on = (e: PointerEvent) => {
      p.current.x = (e.clientX / window.innerWidth) * 2 - 1
      p.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', on, { passive: true })
    return () => window.removeEventListener('pointermove', on)
  }, [])
  return p
}

function Rig({ tier, ready, drag }: { tier: Tier; ready: boolean; drag: MutableRefObject<Drag> }) {
  const group = useRef<THREE.Group>(null)
  const pointer = useWindowPointer()
  const { viewport, size } = useThree()
  const narrow = size.width < 768
  const scale = narrow ? Math.min(0.8, viewport.width / 4.6) : Math.min(0.78, viewport.width / 11.2)
  const position: [number, number, number] = narrow
    ? [0, viewport.height * 0.2, 0]
    : [viewport.width * 0.17, viewport.height * 0.19, 0]

  useFrame(({ clock }, dt) => {
    const g = group.current
    if (!g) return
    const t = clock.elapsedTime
    const d = drag.current
    if (!d.active) d.rot = THREE.MathUtils.damp(d.rot, 0, 1.1, dt)
    const ty = BASE.y + Math.sin(t * 0.17) * 0.2 + pointer.current.x * 0.22 + d.rot
    const tx = BASE.x + pointer.current.y * 0.12 + Math.sin(t * 0.23) * 0.04
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, ty, 3.2, dt)
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, tx, 3.2, dt)
    g.rotation.z = BASE.z
    g.position.y = Math.sin(t * 0.5) * 0.06
  })

  return (
    <group position={position} scale={scale}>
      <group ref={group} rotation={[BASE.x, BASE.y, BASE.z]}>
        <PanelStack tier={tier} ready={ready} />
      </group>
    </group>
  )
}

/** A dark backdrop with a soft glow behind the object. Glass needs an opaque scene to refract. */
function Backdrop() {
  const { viewport } = useThree()
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 512
    const g = c.getContext('2d')!
    const grad = g.createRadialGradient(256, 256, 0, 256, 256, 256)
    grad.addColorStop(0, '#1a1a21')
    grad.addColorStop(0.55, '#111116')
    grad.addColorStop(1, '#0b0b0f')
    g.fillStyle = grad
    g.fillRect(0, 0, 512, 512)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
  return (
    <>
      <color attach="background" args={['#0b0b0f']} />
      <mesh position={[viewport.width * 0.16, viewport.height * 0.08, -4]} scale={[viewport.width * 1.3, viewport.width * 1.3, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </>
  )
}

/** Studio lighting made in code, so no HDR file is downloaded. */
function Studio() {
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer form="rect" intensity={2.6} position={[0, 4, 2]} rotation-x={Math.PI / 2} scale={[8, 3, 1]} />
      <Lightformer form="rect" intensity={2} position={[-5, 0.5, 1]} rotation-y={Math.PI / 2} scale={[1.2, 6, 1]} />
      <Lightformer form="rect" intensity={1.4} position={[5, -0.5, 0]} rotation-y={-Math.PI / 2} scale={[1.2, 6, 1]} />
      <Lightformer form="ring" intensity={0.8} color="#c6ff3d" position={[3, 2.5, 4]} scale={1.2} />
      <Lightformer form="rect" intensity={0.5} position={[0, -4, 1]} rotation-x={-Math.PI / 2} scale={[6, 2, 1]} />
    </Environment>
  )
}

export default function Scene3D({ tier, ready, onReady }: { tier: Tier; ready: boolean; onReady?: () => void }) {
  const wrap = useRef<HTMLDivElement>(null)
  const drag = useRef<Drag>({ active: false, lastX: 0, rot: 0 })
  const [running, setRunning] = useState(true)

  // Stop rendering when the hero is off screen or the tab is hidden.
  useEffect(() => {
    const el = wrap.current!
    let onScreen = true
    const update = () => setRunning(onScreen && document.visibilityState === 'visible')
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting
      update()
    })
    io.observe(el)
    document.addEventListener('visibilitychange', update)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', update)
    }
  }, [])

  const onDown = (e: React.PointerEvent) => {
    drag.current.active = true
    drag.current.lastX = e.clientX
    if (e.pointerType !== 'touch') (e.target as Element).setPointerCapture?.(e.pointerId)
  }
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d.active) return
    d.rot = THREE.MathUtils.clamp(d.rot + (e.clientX - d.lastX) * 0.006, -1.4, 1.4)
    d.lastX = e.clientX
  }
  const onUp = () => (drag.current.active = false)

  return (
    <div
      ref={wrap}
      className="absolute inset-0 touch-pan-y"
      data-cursor="drag"
      aria-hidden="true"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onPointerLeave={onUp}
    >
      <Canvas
        frameloop={running ? 'always' : 'never'}
        dpr={[1, tier === 'full' ? 1.75 : 1.25]}
        camera={{ position: [0, 0, 10], fov: 30 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: import.meta.env.DEV }}
        onCreated={() => onReady?.()}
      >
        <Backdrop />
        <Studio />
        <Rig tier={tier} ready={ready} drag={drag} />
      </Canvas>
    </div>
  )
}
