import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../lib/motion'
import { ParticleName } from '../lib/particles'
import { useIntro } from '../lib/intro'
import { useTheme } from '../lib/theme'
import { prefersReducedMotion } from '../lib/device'

/*
 * The first screen after the loader: "JAGDISH PATIL" in particles. Scrolling cuts the name at the
 * gap between the words; the halves part, scatter and fade, handing over to the hero.
 * With reduced motion it's the plain name, no pinning.
 */

export function Intro() {
  const { ready } = useIntro()
  const theme = useTheme()
  const [reduced] = useState(prefersReducedMotion)
  const stage = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const engine = useRef<ParticleName | null>(null)
  const hint = useRef<HTMLParagraphElement>(null)

  // Build the particles once the display font is ready; rebuild on resize.
  useEffect(() => {
    if (reduced || !canvas.current) return
    const e = new ParticleName(canvas.current)
    engine.current = e
    let alive = true
    const build = () => {
      if (!alive) return
      e.build()
      e.play()
    }
    void document.fonts.load('600 100px "Clash Display"').then(build, build)

    let timer = 0
    const onResize = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => e.build(), 200)
    }
    const onPointer = (ev: PointerEvent) => {
      const r = canvas.current!.getBoundingClientRect()
      e.setPointer(ev.clientX - r.left, ev.clientY - r.top)
    }
    const onLeave = () => e.setPointer(-9999, -9999)
    window.addEventListener('resize', onResize)
    window.addEventListener('pointermove', onPointer, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)

    // Only animate while the stage is on screen and the tab is visible.
    let onScreen = true
    const sync = () => (onScreen && !document.hidden ? e.play() : e.pause())
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      sync()
    })
    io.observe(stage.current!)
    document.addEventListener('visibilitychange', sync)

    return () => {
      alive = false
      e.pause()
      io.disconnect()
      window.clearTimeout(timer)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointer)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('visibilitychange', sync)
      engine.current = null
    }
  }, [reduced])

  // Particle colours follow the theme.
  useEffect(() => {
    const css = getComputedStyle(document.documentElement)
    engine.current?.setColours(
      css.getPropertyValue('--ink').trim(),
      css.getPropertyValue('--mute').trim(),
      theme === 'light' ? '#8fc31c' : '#c6ff3d',
    )
  }, [theme, reduced])

  // Fly in when the loader hands over.
  useEffect(() => {
    if (ready) engine.current?.assemble()
  }, [ready])

  // Pin the stage while scrolling cuts the name open.
  useLayoutEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: stage.current,
        start: 'top top',
        end: '+=90%',
        pin: true,
        anticipatePin: 1,
        // Hold the whole name for the first 10%, then cut it open and let it fade by the end.
        onUpdate: (self) => {
          engine.current?.setSplit((self.progress - 0.1) / 0.85)
          if (hint.current) hint.current.style.opacity = String(Math.max(0, 1 - self.progress * 4))
        },
      })
    }, stage)
    return () => ctx.revert()
  }, [reduced])

  if (reduced) {
    return (
      <section id="top" className="container-x grid min-h-[70svh] place-items-center pt-24 text-center" aria-label="Jagdish Patil">
        <h2 className="sr-only">Jagdish Patil</h2>
        <p className="font-display text-[clamp(48px,11vw,180px)] font-semibold leading-[0.9] tracking-tight" aria-hidden="true">
          JAGDISH PATIL
        </p>
      </section>
    )
  }

  return (
    <section id="top" aria-label="Jagdish Patil">
      <div ref={stage} className="relative h-[100svh] min-h-[560px] w-full overflow-hidden">
        <h2 className="sr-only">Jagdish Patil</h2>
        <canvas ref={canvas} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />

        <p ref={hint} className="label pointer-events-none absolute inset-x-0 bottom-6 text-center text-mute" aria-hidden="true">
          Scroll ↓
        </p>
      </div>
    </section>
  )
}
