import { useLayoutEffect, useRef, useState } from 'react'
import { SectionHeading } from '../components/SectionHeading'
import { ProjectCard } from '../components/ProjectCard'
import { FadeUp } from '../components/Reveal'
import { projects, more, pad } from '../data/projects'
import { gsap, ScrollTrigger } from '../lib/motion'
import { getLenis } from '../lib/smooth'
import { useMedia } from '../lib/device'
import { accentFor, useTheme } from '../lib/theme'

/** Desktop pointer + motion allowed → the pinned 3D stack. Everything else → a plain list. */
const STACK_QUERY = '(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)'

/*
 * The panels sit in a stack that recedes up and back. Scrolling brings them forward one at
 * a time: the front panel lifts away and tilts off, the next one slides into its place.
 * Position p runs 0 → n-1 with scroll; each panel is placed from its distance d = i - p.
 */
function place(d: number, vh: number) {
  if (d >= 0) {
    return {
      y: -d * 58,
      z: -d * 240,
      rx: d * 3,
      opacity: d > 3.4 ? 0 : d > 2.4 ? 3.4 - d : 1,
      dim: Math.min(d * 0.3, 0.75),
    }
  }
  // Leaving: stays solid for the first stretch, then lifts away and fades.
  const e = -d
  return {
    y: -e * vh * 0.95,
    z: e * 120,
    rx: -e * 16,
    opacity: e < 0.22 ? 1 : Math.max(1 - (e - 0.22) * 3.2, 0),
    dim: 0,
  }
}

/** Holds each panel at the front for a moment before moving on. */
function dwell(p: number) {
  const i = Math.floor(p)
  const f = p - i
  const t = Math.min(Math.max((f - 0.18) / 0.64, 0), 1)
  return i + t * t * (3 - 2 * t)
}

function StackedWork() {
  const stageRef = useRef<HTMLDivElement>(null)
  const slots = useRef<HTMLElement[]>([])
  const dims = useRef<HTMLElement[]>([])
  const stRef = useRef<ScrollTrigger | null>(null)
  const [active, setActive] = useState(0)
  const theme = useTheme()
  const n = projects.length

  useLayoutEffect(() => {
    const state = { target: 0, current: 0, shown: 0 }
    let vh = window.innerHeight

    const apply = (p: number) => {
      slots.current.forEach((el, i) => {
        const s = place(i - p, vh)
        el.style.transform = `translate3d(-50%, calc(-50% + ${s.y}px), ${s.z}px) rotateX(${s.rx}deg)`
        el.style.opacity = String(s.opacity)
        el.style.zIndex = String(100 - i)
        el.style.pointerEvents = Math.abs(i - p) < 0.45 ? 'auto' : 'none'
        dims.current[i].style.opacity = String(s.dim)
      })
    }

    const ctx = gsap.context(() => {
      stRef.current = ScrollTrigger.create({
        trigger: stageRef.current,
        start: 'top top',
        end: () => `+=${(n - 1) * window.innerHeight * 0.75}`,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefresh: () => (vh = window.innerHeight),
        onUpdate: (self) => (state.target = dwell(self.progress * (n - 1))),
      })
    }, stageRef)

    // Ease toward the scroll position every frame, so the stack glides instead of stepping.
    const tick = (_t: number, dt: number) => {
      const k = 1 - Math.pow(1 - 0.12, (dt / 1000) * 60)
      state.current += (state.target - state.current) * k
      if (Math.abs(state.target - state.current) < 0.0005) state.current = state.target
      apply(state.current)
      const idx = Math.round(state.current)
      if (idx !== state.shown) {
        state.shown = idx
        setActive(idx)
      }
    }
    apply(0)
    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
      ctx.revert()
    }
  }, [n])

  /** Scroll so panel i is at the front (keyboard focus and the side list use this). */
  const goTo = (i: number) => {
    const st = stRef.current
    if (!st) return
    const y = st.start + (i / (n - 1)) * (st.end - st.start)
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(y, { duration: 1 })
    else window.scrollTo({ top: y })
  }

  return (
    <div ref={stageRef} className="work-stage">
      {/* Side index: counter and names */}
      <div className="container-x pointer-events-none absolute inset-0 grid-12 items-center">
        <div className="pointer-events-auto col-span-2 self-center">
          <p className="font-display text-[56px] font-medium leading-none tabular" aria-hidden="true">
            {pad(active)}
            <span className="text-[20px] text-mute"> / {pad(n - 1)}</span>
          </p>
          <ol className="mt-8 space-y-2" aria-label="Projects">
            {projects.map((p, i) => (
              <li key={p.slug}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  tabIndex={-1}
                  className={`flex items-center gap-2 text-left text-[14px] transition-colors duration-300 ${
                    i === active ? 'text-ink' : 'text-mute hover:text-ink/80'
                  }`}
                >
                  <span
                    className="h-px transition-all duration-500"
                    style={{ width: i === active ? 18 : 8, background: i === active ? accentFor(p.accent, theme) : 'currentColor' }}
                    aria-hidden="true"
                  />
                  {p.name}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <ol className="absolute inset-0 [perspective:1800px] [perspective-origin:50%_15%]" aria-label="Selected work">
        {projects.map((p, i) => (
          <li
            key={p.slug}
            ref={(el) => {
              if (el) slots.current[i] = el
            }}
            className="work-stage__slot"
          >
            <ProjectCard project={p} index={i} variant="stack" eager={i < 2} onFocus={() => goTo(i)} />
            <div
              ref={(el) => {
                if (el) dims.current[i] = el
              }}
              className="work-stage__dim"
              aria-hidden="true"
            />
          </li>
        ))}
      </ol>

      <p className="label pointer-events-none absolute bottom-8 right-[var(--gutter)] text-mute" aria-hidden="true">
        Scroll to flip through ↓
      </p>
    </div>
  )
}

function ListWork() {
  return (
    <ol className="container-x grid-12 mt-12 gap-y-14 md:mt-16" aria-label="Selected work">
      {projects.map((p, i) => (
        <FadeUp as="li" key={p.slug} className="col-span-12 md:col-span-6" delay={(i % 2) * 0.06}>
          <ProjectCard project={p} index={i} variant="list" eager={i < 1} />
        </FadeUp>
      ))}
    </ol>
  )
}

export function Work() {
  const stacked = useMedia(STACK_QUERY)
  return (
    <section id="work" className="pb-28 md:pb-40" aria-labelledby="work-title">
      <div className="container-x">
        <SectionHeading index="03" label="Selected work" id="work-title" title="Things I’ve built and shipped." />
        <p className="mt-6 grid-12 text-[17px] leading-relaxed text-mute md:mt-8">
          <span className="col-span-12 max-w-[56ch] md:col-span-6 md:col-start-4">
            Eight projects, all live and public on GitHub. I built each one solo, with AI as my co-pilot, then tested
            and deployed it.
          </span>
        </p>
      </div>

      {stacked ? (
        <div className="mt-6">
          <StackedWork />
        </div>
      ) : (
        <ListWork />
      )}

      <div className="container-x mt-20 md:mt-28">
        <div className="grid-12 gap-y-4 border-t border-line pt-6">
          <p className="label col-span-12 text-mute md:col-span-3">More</p>
          <ul className="col-span-12 md:col-span-9">
            {more.map((m) => (
              <li key={m.name} className="grid grid-cols-1 gap-2 py-2 md:grid-cols-[220px_1fr_auto] md:gap-6">
                <span className="font-display text-[22px] font-medium">{m.name}</span>
                <span className="text-[15px] leading-relaxed text-mute">
                  {m.pitch} <span className="text-ink/70">{m.stack.join(' · ')}</span>
                </span>
                <span className="label text-mute md:text-right">{m.note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
