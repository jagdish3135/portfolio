import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { prefersReducedMotion } from '../lib/device'
import { lockScroll } from '../lib/smooth'

type Props = {
  /** Called as the curtain lifts, so the hero can start revealing. */
  onReveal: () => void
  /** Called when the loader is gone. */
  onDone: () => void
}

/**
 * Counts 000 → 100 next to a large "JP", then flies the initials into the nav logo
 * while the curtain lifts. About 1.8 s in total.
 */
export function Loader({ onReveal, onDone }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const curtainRef = useRef<HTMLDivElement>(null)
  const jpRef = useRef<HTMLDivElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)
  const barRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    window.history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
    lockScroll(true)

    let alive = true
    const reduced = prefersReducedMotion()
    const jp = jpRef.current!
    const fonts = Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 700))])

    const ctx = gsap.context(() => {
      const counter = { v: 0 }
      const tl = gsap.timeline({
        onComplete: () => {
          lockScroll(false)
          onDone()
        },
      })

      if (reduced) {
        countRef.current!.textContent = '100'
        tl.to(rootRef.current, { opacity: 0, duration: 0.35, delay: 0.25, onStart: onReveal })
        return
      }

      tl.from('[data-letter]', { yPercent: 105, duration: 0.7, stagger: 0.07, ease: 'expo.out' }, 0)
      tl.to(
        counter,
        {
          v: 100,
          duration: 1.0,
          ease: 'power2.inOut',
          onUpdate() {
            countRef.current!.textContent = String(Math.round(counter.v)).padStart(3, '0')
            barRef.current!.style.transform = `scaleX(${counter.v / 100})`
          },
        },
        0,
      )
      // Hold here until fonts are in, so the nav logo is measured at its final size.
      tl.addPause('counted', () => void fonts.then(() => {
        if (alive) tl.resume()
      }))

      // Fly the initials onto the nav logo (FLIP), measured at this moment.
      const flip = () => {
        const logo = document.querySelector('[data-logo]')
        const from = jp.getBoundingClientRect()
        const to = logo?.getBoundingClientRect()
        if (!to) return { x: 0, y: -40, scale: 0.2 }
        return {
          x: to.left + to.width / 2 - (from.left + from.width / 2),
          y: to.top + to.height / 2 - (from.top + from.height / 2),
          scale: to.height / from.height,
        }
      }
      let target: ReturnType<typeof flip> | null = null
      const get = () => (target ??= flip())

      tl.to('[data-loader-meta]', { opacity: 0, y: -10, duration: 0.3, ease: 'power2.in' }, 'counted')
      tl.to(
        jp,
        { x: () => get().x, y: () => get().y, scale: () => get().scale, duration: 0.8, ease: 'expo.inOut' },
        'counted',
      )
      tl.to(curtainRef.current, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.8, ease: 'expo.inOut' }, 'counted+=0.08')
      // The initials hand over to the script name in the nav: they fade as it fades in.
      tl.to(jp, { opacity: 0, duration: 0.35, ease: 'power1.out' }, 'counted+=0.5')
      tl.add(onReveal, 'counted+=0.4')
    }, rootRef)

    return () => {
      alive = false
      ctx.revert()
      lockScroll(false)
    }
    // Runs once on first load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={rootRef} className="fixed inset-0 z-[9500]" role="status" aria-label="Loading" data-loader>
      <div ref={curtainRef} className="absolute inset-0 bg-bg" style={{ clipPath: 'inset(0% 0% 0% 0%)' }}>
        <div data-loader-meta className="container-x absolute inset-x-0 bottom-0 pb-8">
          <div className="grid-12 items-end">
            <p className="label col-span-6 text-mute">
              Jagdish Patil
              <br />
              Portfolio ©{new Date().getFullYear()}
            </p>
            <p className="col-span-6 text-right font-display text-[clamp(48px,8vw,120px)] font-medium leading-none tabular">
              <span ref={countRef}>000</span>
            </p>
          </div>
          <div className="mt-6 h-px w-full bg-line">
            <div ref={barRef} className="h-px origin-left bg-accent" style={{ transform: 'scaleX(0)' }} />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div
          ref={jpRef}
          className="flex overflow-hidden font-display text-[clamp(120px,22vw,300px)] font-semibold leading-none tracking-tight"
          aria-hidden="true"
        >
          <span data-letter className="inline-block">
            J
          </span>
          <span data-letter className="inline-block">
            P
          </span>
        </div>
      </div>
    </div>
  )
}
