import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { gsap, DUR, EASE_IN_OUT } from './motion'
import { prefersReducedMotion } from './device'

/*
 * Shared-element transition, GSAP Flip-style:
 * 1. The card reports its cover's on-screen box and image (`takeOff`).
 * 2. A fixed copy of the cover is drawn at that box, and the route changes.
 * 3. The detail page reports its hero cover (`land`), and the copy flies there.
 * Working with screen boxes means the card's 3D transforms and the scroll reset don't matter.
 */

type Flight = { slug: string; src: string; from: DOMRect; radius: number }

type Ctx = {
  takeOff: (f: Flight) => void
  /** Returns true when a flight is landing on this element (so it should start hidden). */
  land: (slug: string, target: HTMLElement, onLanded: () => void) => boolean
}

const FlightContext = createContext<Ctx>({ takeOff: () => {}, land: () => false })

export function FlightProvider({ children }: { children: ReactNode }) {
  const [flight, setFlight] = useState<Flight | null>(null)
  const planeRef = useRef<HTMLDivElement>(null)
  const current = useRef<Flight | null>(null)

  const takeOff = useCallback((f: Flight) => {
    current.current = f
    setFlight(f)
  }, [])

  const scheduled = useRef<number | null>(null)

  const land = useCallback((slug: string, target: HTMLElement, onLanded: () => void) => {
    const f = current.current
    if (!f || f.slug !== slug) return false

    // In dev, React mounts the page twice: the second call replaces the first.
    if (scheduled.current !== null) cancelAnimationFrame(scheduled.current)

    // Wait a frame so the new page has laid out and the scroll reset has applied.
    scheduled.current = requestAnimationFrame(() => {
      scheduled.current = null
      current.current = null
      const plane = planeRef.current
      if (!plane) {
        onLanded()
        setFlight(null)
        return
      }
      const to = target.getBoundingClientRect()
      const radius = parseFloat(getComputedStyle(target).borderRadius) || 0
      const done = () => {
        onLanded()
        gsap.to(plane, { opacity: 0, duration: DUR.fast, onComplete: () => setFlight(null) })
      }
      if (prefersReducedMotion()) {
        done()
        return
      }
      gsap.to(plane, {
        left: to.left,
        top: to.top,
        width: to.width,
        height: to.height,
        borderRadius: radius,
        duration: DUR.base,
        ease: EASE_IN_OUT,
        onComplete: done,
      })
    })
    return true
  }, [])

  return (
    <FlightContext.Provider value={{ takeOff, land }}>
      {children}
      {flight &&
        createPortal(
          <div
            ref={planeRef}
            aria-hidden="true"
            className="pointer-events-none fixed z-[9400] overflow-hidden"
            style={{
              left: flight.from.left,
              top: flight.from.top,
              width: flight.from.width,
              height: flight.from.height,
              borderRadius: flight.radius,
            }}
          >
            <img src={flight.src} alt="" className="h-full w-full object-cover object-top" />
          </div>,
          document.body,
        )}
    </FlightContext.Provider>
  )
}

export const useFlight = () => useContext(FlightContext)
