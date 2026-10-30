import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

/**
 * One easing curve and one set of durations for the whole site:
 * GSAP, Framer Motion and CSS all read from here.
 */
export const EASE = 'expo.out'
export const EASE_IN_OUT = 'expo.inOut'
/** Same curve as `expo.out`, for Framer Motion and CSS. Also in index.css as --ease-expo. */
export const EASE_BEZIER: [number, number, number, number] = [0.16, 1, 0.3, 1]

export const DUR = {
  fast: 0.35,
  base: 0.8,
  slow: 1.2,
  /** Route transitions */
  page: 0.6,
} as const

export const STAGGER = 0.08

/** Spring for magnetic elements */
export const SPRING = { stiffness: 220, damping: 16, mass: 0.5 }

/** Where scroll reveals start: when the element's top reaches 85% of the viewport. */
export const REVEAL_START = 'top 85%'

gsap.defaults({ ease: EASE, duration: DUR.base })

export { gsap, ScrollTrigger, SplitText }
