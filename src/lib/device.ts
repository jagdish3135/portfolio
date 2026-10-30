const mq = (q: string) => typeof window !== 'undefined' && window.matchMedia(q).matches

/** True on phones and tablets: no hover, or a coarse pointer. */
export const isTouch = () => mq('(hover: none), (pointer: coarse)')

export const prefersReducedMotion = () => mq('(prefers-reduced-motion: reduce)')

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
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
  if (prefersReducedMotion() || !hasWebGL()) return 'static'
  const nav = navigator as Navigator & { deviceMemory?: number }
  const memory = nav.deviceMemory ?? 8
  const cores = nav.hardwareConcurrency ?? 8
  const small = isTouch() || window.innerWidth < 768
  if (memory <= 2 || cores <= 2) return 'static'
  if (small && (memory <= 4 || cores <= 4)) return 'static'
  if (small) return 'lite'
  return 'full'
}
