import { lazy, Suspense, useLayoutEffect, useRef, useState, type MouseEvent } from 'react'
import { gsap, DUR, EASE, STAGGER } from '../lib/motion'
import { MagneticButton } from '../components/MagneticButton'
import { useIntro } from '../lib/intro'
import { getSceneTier, prefersReducedMotion, type SceneTier } from '../lib/device'
import { useISTTime } from '../lib/useLocalTime'
import { scrollTo } from '../lib/smooth'

// three.js lives in its own chunk and starts downloading while the loader runs.
const Scene3D = lazy(() => import('../three/Scene3D'))

function Poster() {
  return (
    <img
      src="/hero-poster.webp"
      alt=""
      aria-hidden="true"
      className="absolute inset-0 h-full w-full object-cover object-[70%_40%] md:object-center"
      decoding="async"
    />
  )
}

export function Hero() {
  const { ready } = useIntro()
  const [tier] = useState<SceneTier>(() => getSceneTier())
  const [sceneOn, setSceneOn] = useState(false)
  const root = useRef<HTMLElement>(null)
  const time = useISTTime()

  // Hide the copy until the loader hands over, then reveal it line by line.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set('[data-hero-line]', { yPercent: 110 })
      gsap.set('[data-hero-fade]', { opacity: 0, y: 16 })
    }, root)
    return () => ctx.revert()
  }, [])

  useLayoutEffect(() => {
    if (!ready) return
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) {
        gsap.set('[data-hero-line]', { yPercent: 0 })
        gsap.to('[data-hero-fade]', { opacity: 1, y: 0, duration: DUR.fast })
        return
      }
      gsap.to('[data-hero-line]', { yPercent: 0, duration: DUR.slow, stagger: STAGGER, ease: EASE })
      gsap.to('[data-hero-fade]', { opacity: 1, y: 0, duration: DUR.slow, stagger: STAGGER, delay: 0.35, ease: EASE })
    }, root)
    return () => ctx.revert()
  }, [ready])

  const go = (href: string) => (e: MouseEvent) => {
    e.preventDefault()
    scrollTo(href, -40)
  }

  return (
    <section ref={root} id="top" className="relative h-[100svh] min-h-[640px] w-full overflow-hidden" aria-labelledby="hero-title">
      <div className={`absolute inset-0 transition-opacity duration-[1400ms] ${sceneOn || tier === 'static' ? 'opacity-100' : 'opacity-0'}`}>
        {tier === 'static' ? (
          <Poster />
        ) : (
          <Suspense fallback={null}>
            <Scene3D tier={tier} ready={ready} onReady={() => setSceneOn(true)} />
          </Suspense>
        )}
      </div>

      {/* Scrim: keeps the copy readable over the glass */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%]"
        aria-hidden="true"
        style={{ background: 'linear-gradient(to top, #0b0b0f 18%, rgb(11 11 15 / 0.7) 48%, rgb(11 11 15 / 0))' }}
      />

      <div className="pointer-events-none relative flex h-full flex-col justify-end">
        <div className="container-x pb-6 md:pb-8">
          <div className="grid-12">
            <p data-hero-fade className="col-span-12 mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-mute md:mb-8">
              <span>AI-native builder</span>
              <span aria-hidden="true" className="hidden text-faint sm:inline">·</span>
              <span className="basis-full sm:basis-auto">Aspiring Forward Deployed Engineer</span>
              <span aria-hidden="true" className="hidden text-faint sm:inline">·</span>
              <span className="hidden sm:inline">Surat, India</span>
            </p>

            <h1
              id="hero-title"
              className="pointer-events-auto col-span-12 font-display text-[clamp(40px,6.6vw,124px)] font-medium leading-[0.92] tracking-[-0.025em] lg:col-span-11"
            >
              <span className="line-mask">
                <span data-hero-line>
                  Building <span className="text-accent">AI</span> solutions.
                </span>
              </span>
              <span className="line-mask">
                <span data-hero-line>Custom setups, shipped live.</span>
              </span>
            </h1>

            <div data-hero-fade className="pointer-events-auto col-span-12 mt-8 flex flex-wrap gap-3 md:mt-10">
              <MagneticButton href="#work" onClick={go('#work')} variant="primary">
                View Work <span aria-hidden="true">↓</span>
              </MagneticButton>
              <MagneticButton href="#contact" onClick={go('#contact')} variant="ghost">
                Let’s Talk
              </MagneticButton>
            </div>
          </div>

          <div data-hero-fade className="label mt-10 grid-12 items-center border-t border-line pt-5 text-mute md:mt-14">
            <span className="col-span-6 md:col-span-3">Scroll to explore ↓</span>
            <span className="col-span-3 hidden md:block">21.17° N, 72.83° E</span>
            <span className="col-span-6 text-right tabular md:col-span-3 md:text-left">
              Surat, IST — <span className="text-ink/85">{time}</span>
            </span>
            <span className="col-span-3 hidden text-right md:block">Portfolio ©{new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
