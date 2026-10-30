import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../lib/motion'
import { ParticleName } from '../lib/particles'
import { useIntro } from '../lib/intro'
import { useTheme } from '../lib/theme'
import { prefersReducedMotion } from '../lib/device'
import { site } from '../data/site'

/*
 * The first screen after the loader: "JAGDISH PATIL" in particles. Scrolling cuts the name at the
 * gap between the words, the halves slide apart, and the photo opens up between them.
 * With reduced motion it's the plain name above the photo, no pinning.
 */

/** Photo frame size for the stage: about 400 px wide on desktop, 62% of the width on phones. */
function frameSize(w: number, h: number) {
  const vertical = w < 768
  const width = vertical ? Math.min(w * 0.62, h * 0.4 * 0.8) : Math.min(w * 0.28, 400, h * 0.62 * 0.8)
  return { width, height: width * 1.25, vertical }
}

function Portrait() {
  if (site.portrait) {
    return (
      <picture className="block h-full w-full">
        <source srcSet={`${site.portrait}.avif`} type="image/avif" />
        <img
          src={`${site.portrait}.webp`}
          alt={`Portrait of ${site.name}`}
          className="h-full w-full object-cover object-top"
          width={800}
          height={1000}
        />
      </picture>
    )
  }
  // Until a portrait is set: a quiet glass monogram, never a stand-in face.
  return (
    <div className="relative grid h-full w-full place-items-center overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(70% 55% at 50% 38%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 70%), linear-gradient(160deg, var(--glass-1), var(--glass-2))',
        }}
      />
      <div
        className="absolute inset-6 rounded-[18px] border border-line"
        style={{ backgroundImage: 'linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)', backgroundSize: '100% 25%, 25% 100%' }}
      />
      <span className="relative font-display text-[clamp(72px,9vw,128px)] font-semibold leading-none tracking-tight text-ink/80">JP</span>
    </div>
  )
}

export function Intro() {
  const { ready } = useIntro()
  const theme = useTheme()
  const [reduced] = useState(prefersReducedMotion)
  const stage = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const caption = useRef<HTMLDivElement>(null)
  const engine = useRef<ParticleName | null>(null)

  // Build the particles once the display font is ready; rebuild on resize.
  useEffect(() => {
    if (reduced || !canvas.current) return
    const onFrame = (q: number) => {
      // The photo opens from the centre as the halves part: sideways on desktop, up and down on phones.
      const f = frame.current
      if (!f) return
      const vertical = window.innerWidth < 768
      const open = (1 - q) * 50
      f.style.clipPath = vertical ? `inset(${open}% 0 ${open}% 0 round 28px)` : `inset(0 ${open}% 0 ${open}% round 28px)`
      f.style.transform = `scale(${0.92 + q * 0.08})`
      if (caption.current) caption.current.style.opacity = String(Math.max(0, (q - 0.7) / 0.3))
    }
    const e = new ParticleName(canvas.current, {
      onFrame,
      photo: (w, h, vertical) => {
        const s = frameSize(w, h)
        return { cx: w / 2, cy: h / 2, half: (vertical ? s.height : s.width) / 2 + (vertical ? 18 : 40) }
      },
    })
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
        end: '+=130%',
        pin: true,
        anticipatePin: 1,
        // Hold the whole name for the first 8%, finish the cut by 80%, then hold the portrait.
        onUpdate: (self) => engine.current?.setSplit((self.progress - 0.08) / 0.72),
      })
    }, stage)
    return () => ctx.revert()
  }, [reduced])

  if (reduced) {
    return (
      <section id="top" className="container-x pt-32 pb-16 text-center" aria-label="Jagdish Patil">
        <p className="font-display text-[clamp(48px,11vw,180px)] font-semibold leading-[0.9] tracking-tight" aria-hidden="true">
          JAGDISH PATIL
        </p>
        <div className="mx-auto mt-12 aspect-[4/5] w-[min(70vw,380px)] overflow-hidden rounded-[28px] border border-line">
          <Portrait />
        </div>
      </section>
    )
  }

  return (
    <section id="top" aria-label="Jagdish Patil">
      <div ref={stage} className="relative h-[100svh] min-h-[560px] w-full overflow-hidden">
        <h2 className="sr-only">Jagdish Patil</h2>

        {/* The photo, opened by the split. Sized like frameSize(). */}
        <div className="absolute inset-0 grid place-items-center">
          <div
            ref={frame}
            data-portrait-frame
            className="relative aspect-[4/5] w-[min(62vw,32svh)] overflow-hidden rounded-[28px] border border-line shadow-[0_50px_100px_-40px_var(--shadow)] md:w-[min(28vw,400px,49.6svh)]"
            style={{ clipPath: 'inset(0 50% 0 50% round 28px)', willChange: 'clip-path, transform' }}
          >
            <Portrait />
          </div>
        </div>

        <canvas ref={canvas} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />

        <div
          ref={caption}
          className="label pointer-events-none absolute inset-x-0 bottom-[7svh] text-center text-mute"
          style={{ opacity: 0 }}
        >
          {site.name} · AI-native builder · Surat, India
        </div>
        <p className="label pointer-events-none absolute inset-x-0 bottom-6 text-center text-mute" aria-hidden="true">
          Scroll ↓
        </p>
      </div>
    </section>
  )
}
