import { useEffect, useLayoutEffect, useMemo, type ReactNode } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

/*
 * Small stand-ins for the three drei helpers this scene used (Line, RoundedBox, Environment),
 * built straight on three.js so the 3D chunk doesn't pull in the rest of drei's dependencies.
 */

type V3 = [number, number, number]

/** A line with a width in screen pixels (three's fat lines). */
export function Line({ points, color, lineWidth = 1, position }: { points: V3[]; color: string; lineWidth?: number; position?: V3 }) {
  const size = useThree((s) => s.size)
  const line = useMemo(() => {
    const geo = new LineGeometry()
    geo.setPositions(points.flat())
    const mat = new LineMaterial({ color, linewidth: lineWidth, worldUnits: false })
    return new Line2(geo, mat)
  }, [points, color, lineWidth])

  // Fat lines need the canvas size to draw the right width.
  useLayoutEffect(() => {
    line.material.resolution.set(size.width, size.height)
  }, [line, size.width, size.height])

  useEffect(
    () => () => {
      line.geometry.dispose()
      line.material.dispose()
    },
    [line],
  )
  return <primitive object={line} position={position} />
}

/** A box with rounded edges. Children are its material. */
export function RoundedBox({ args, radius, smoothness = 4, children }: { args: V3; radius: number; smoothness?: number; children: ReactNode }) {
  const geo = useMemo(() => new RoundedBoxGeometry(args[0], args[1], args[2], smoothness, radius), [args, radius, smoothness])
  useEffect(() => () => geo.dispose(), [geo])
  return <mesh geometry={geo}>{children}</mesh>
}

type Light = { form: 'rect' | 'ring'; intensity: number; position: V3; rotation?: V3; scale: V3 | number; color?: string }

/**
 * Studio lighting for reflections: a few glowing panels and a ring, rendered once into an
 * environment map. Made in code, so no HDR file is downloaded.
 */
export function Studio({ lights }: { lights: Light[] }) {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)

  useEffect(() => {
    const studio = new THREE.Scene()
    const disposables: { dispose(): void }[] = []
    for (const l of lights) {
      const geo = l.form === 'ring' ? new THREE.RingGeometry(0.5, 1, 48) : new THREE.PlaneGeometry(1, 1)
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(l.color ?? '#ffffff').multiplyScalar(l.intensity),
        side: THREE.DoubleSide,
        toneMapped: false,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(...l.position)
      if (l.rotation) mesh.rotation.set(...l.rotation)
      if (typeof l.scale === 'number') mesh.scale.setScalar(l.scale)
      else mesh.scale.set(...l.scale)
      studio.add(mesh)
      disposables.push(geo, mat)
    }
    const pmrem = new THREE.PMREMGenerator(gl)
    const target = pmrem.fromScene(studio, 0, 0.1, 100)
    scene.environment = target.texture
    pmrem.dispose()
    return () => {
      scene.environment = null
      target.dispose()
      disposables.forEach((d) => d.dispose())
    }
  }, [gl, scene, lights])

  return null
}
