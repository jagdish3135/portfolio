import { createContext, useCallback, useContext, useRef, type ReactNode, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, type LinkProps } from 'react-router-dom'
import { gsap, DUR, EASE_IN_OUT } from './motion'
import { prefersReducedMotion } from './device'

/*
 * Route change with a panel wipe: a lime panel then a black one sweep up over the page,
 * the route changes underneath, and both sweep off the top. About 600 ms in all.
 * Project cards use the cover flight instead (lib/flight.tsx).
 */

type Go = (to: string, state?: unknown) => void
const TransitionContext = createContext<Go>(() => {})

export function TransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const lime = useRef<HTMLDivElement>(null)
  const dark = useRef<HTMLDivElement>(null)
  const busy = useRef(false)

  const go = useCallback<Go>(
    (to, state) => {
      if (busy.current) return
      if (prefersReducedMotion()) {
        navigate(to, { state })
        return
      }
      busy.current = true
      const panels = [lime.current, dark.current]
      const half = DUR.page / 2
      gsap
        .timeline({ onComplete: () => void (busy.current = false) })
        .set(panels, { display: 'block', transformOrigin: '50% 100%', scaleY: 0 })
        .to(panels, { scaleY: 1, duration: half, stagger: 0.06, ease: EASE_IN_OUT })
        .add(() => navigate(to, { state }))
        .set(panels, { transformOrigin: '50% 0%' }, '+=0.04')
        .to([dark.current, lime.current], { scaleY: 0, duration: half, stagger: 0.05, ease: EASE_IN_OUT })
        .set(panels, { display: 'none' })
    },
    [navigate],
  )

  return (
    <TransitionContext.Provider value={go}>
      {children}
      {createPortal(
        <div aria-hidden="true">
          <div ref={lime} className="pointer-events-none fixed inset-0 z-[9300] hidden bg-accent" />
          <div ref={dark} className="pointer-events-none fixed inset-0 z-[9301] hidden bg-bg" />
        </div>,
        document.body,
      )}
    </TransitionContext.Provider>
  )
}

export const usePageTransition = () => useContext(TransitionContext)

/** A router Link that plays the panel wipe. Modified clicks (new tab) behave normally. */
export function TransitionLink({ to, state, onClick, ...rest }: LinkProps & { to: string }) {
  const go = usePageTransition()
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    go(to, state)
  }
  return <Link to={to} state={state} onClick={handle} {...rest} />
}
