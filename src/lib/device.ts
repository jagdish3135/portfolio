import { useSyncExternalStore } from 'react'

const mq = (q: string) => typeof window !== 'undefined' && window.matchMedia(q).matches

/** True on phones and tablets: no hover, or a coarse pointer. */
export const isTouch = () => mq('(hover: none), (pointer: coarse)')

export const prefersReducedMotion = () => mq('(prefers-reduced-motion: reduce)')

/**
 * 'gpu' when WebGL runs on a graphics card, 'software' when the browser falls back to drawing
 * on the CPU (SwiftShader, llvmpipe: no GPU, or a blocked one), 'none' without WebGL.
 * The glass scene is far too heavy for the software path, so those get the still image.
 */
function webglSupport(): 'gpu' | 'software' | 'none' {
  try {
    const c = document.createElement('canvas')
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null
    if (!gl) return 'none'
    const info = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER))
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return /swiftshader|llvmpipe|software|basic render/i.test(renderer) ? 'software' : 'gpu'
  } catch {
    return 'none'
  }
}

export type SceneTier = 'full' | 'lite' | 'static'

/**
 * How much 3D this device gets.
 * full   = glass panels with real refraction
 * lite   = same scene, cheaper materials, lower pixel ratio (phones, tablets)
 * static = a still image (no WebGL, reduced motion, or a low-end device)
 */
export function getSceneTier(): SceneTier {
  // ?scene=full|lite|static forces a tier (used by the screenshot scripts, which render without a GPU).
  const forced = new URLSearchParams(location.search).get('scene')
  if (forced === 'full' || forced === 'lite' || forced === 'static') return forced
  if (prefersReducedMotion() || webglSupport() !== 'gpu') return 'static'
  const nav = navigator as Navigator & { deviceMemory?: number }
  const memory = nav.deviceMemory ?? 8
  const cores = nav.hardwareConcurrency ?? 8
  const small = isTouch() || window.innerWidth < 768
  if (memory <= 2 || cores <= 2) return 'static'
  if (small && (memory <= 4 || cores <= 4)) return 'static'
  if (small) return 'lite'
  return 'full'
}


/** Live result of a media query. */
export function useMedia(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query)
      m.addEventListener('change', cb)
      return () => m.removeEventListener('change', cb)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}
