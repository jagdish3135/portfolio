import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './motion'
import { prefersReducedMotion } from './device'

let lenis: Lenis | null = null

/** Starts Lenis and drives it from the GSAP ticker so ScrollTrigger stays in sync. */
export function startSmoothScroll() {
  if (lenis || prefersReducedMotion()) return lenis
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis?.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  return lenis
}

export const getLenis = () => lenis

/** Scrolls to an element or offset, smoothly when Lenis is running. */
export function scrollTo(target: string | number | HTMLElement, offset = 0) {
  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 1.4 })
    return
  }
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (typeof el === 'number') window.scrollTo({ top: el + offset })
  else if (el instanceof HTMLElement) el.scrollIntoView({ block: 'start' })
}

export function lockScroll(locked: boolean) {
  document.documentElement.classList.toggle('is-loading', locked)
  if (locked) lenis?.stop()
  else lenis?.start()
}
