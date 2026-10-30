import { useLayoutEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProject, neighbours, pad, projects, type Project } from '../data/projects'
import { useFlight } from '../lib/flight'
import { gsap, DUR, EASE, STAGGER } from '../lib/motion'
import { getLenis } from '../lib/smooth'
import { MagneticButton } from '../components/MagneticButton'
import { prefersReducedMotion } from '../lib/device'

function ProjectView({ p }: { p: Project }) {
  const { land } = useFlight()
  const root = useRef<HTMLElement>(null)
  const coverRef = useRef<HTMLDivElement>(null)
  const [coverHidden, setCoverHidden] = useState(false)
  const index = projects.findIndex((x) => x.slug === p.slug)
  const { prev, next } = neighbours(p.slug)

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
    getLenis()?.scrollTo(0, { immediate: true, force: true })
    document.title = `${p.name} — Jagdish Patil`

    const landing = land(p.slug, coverRef.current!, () => setCoverHidden(false))
    setCoverHidden(landing)

    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from('[data-detail-line]', { yPercent: 110, duration: DUR.slow, stagger: STAGGER, ease: EASE, delay: landing ? 0.25 : 0 })
      gsap.from('[data-detail-fade]', { opacity: 0, y: 20, duration: DUR.slow, stagger: STAGGER, ease: EASE, delay: landing ? 0.45 : 0.15 })
    }, root)
    return () => ctx.revert()
  }, [p.slug, p.name, land])

  return (
    <article ref={root} style={{ ['--accent' as string]: p.accent }} aria-labelledby="project-title">
      <header className="container-x pt-32 md:pt-40">
        <div className="grid-12 gap-y-6">
          <p data-detail-fade className="label col-span-12 flex items-center gap-3 text-mute md:col-span-3 md:pt-4">
            <Link to="/" state={{ scrollTo: '#work' }} className="hover:text-ink">
              ← All work
            </Link>
            <span aria-hidden="true" className="h-px w-6 bg-line" />
            <span className="tabular text-ink/85">{pad(index)}</span>
          </p>
          <div className="col-span-12 md:col-span-9">
            <h1
              id="project-title"
              className="font-display text-[clamp(52px,9vw,168px)] font-medium leading-[0.9] tracking-[-0.03em]"
            >
              <span className="line-mask">
                <span data-detail-line>{p.name}</span>
              </span>
            </h1>
            <p data-detail-fade className="mt-6 max-w-[54ch] text-[clamp(18px,1.6vw,22px)] leading-relaxed text-mute">
              {p.pitch}
            </p>
          </div>
        </div>
      </header>

      <div className="container-x mt-12 md:mt-16">
        <div className="rounded-[28px] p-[clamp(12px,3.2vw,48px)]" style={{ background: p.accent }}>
          <div
            ref={coverRef}
            className="aspect-[16/10] overflow-hidden rounded-[16px] bg-[#15151a] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.6)]"
            style={{ opacity: coverHidden ? 0 : 1 }}
          >
            <picture>
              <source srcSet={`${p.media.desktop}.avif`} type="image/avif" />
              <img
                src={`${p.media.desktop}.webp`}
                alt={`${p.name} home page`}
                width={1440}
                height={900}
                className="h-full w-full object-cover object-top"
              />
            </picture>
          </div>
        </div>
      </div>

      <section className="container-x mt-12 md:mt-16" aria-label="Quick facts">
        <dl data-detail-fade className="grid-12 gap-y-8 border-t border-line pt-8">
          <div className="col-span-6 md:col-span-3">
            <dt className="label text-mute">Role</dt>
            <dd className="mt-3 text-[15px] leading-relaxed">{p.role}</dd>
          </div>
          <div className="col-span-6 md:col-span-2">
            <dt className="label text-mute">Year</dt>
            <dd className="mt-3 text-[15px]">{p.year}</dd>
          </div>
          <div className="col-span-12 md:col-span-4">
            <dt className="label text-mute">Stack</dt>
            <dd className="mt-3 flex flex-wrap gap-2">
              {p.stack.map((s) => (
                <span key={s} className="rounded-full border border-line px-3 py-1 text-[13px] text-ink/85">
                  {s}
                </span>
              ))}
            </dd>
          </div>
          <div className="col-span-12 md:col-span-3">
            <dt className="label text-mute">Links</dt>
            <dd className="mt-3 flex flex-wrap gap-2">
              <MagneticButton href={p.live} external variant="primary" className="!h-10 !px-4 !text-[14px]">
                Live site ↗
              </MagneticButton>
              <MagneticButton href={p.repo} external variant="ghost" className="!h-10 !px-4 !text-[14px]">
                GitHub ↗
              </MagneticButton>
            </dd>
          </div>
        </dl>
      </section>

      <section className="container-x my-24 md:my-32" aria-label="Case study">
        <p className="grid-12 text-[15px] text-mute">
          <span className="col-span-12 md:col-span-6 md:col-start-4">
            The full case study (problem, architecture, features, hardest part) arrives in the next checkpoint.
          </span>
        </p>
      </section>

      <nav className="container-x border-t border-line py-10" aria-label="More projects">
        <div className="grid-12 gap-y-6">
          <Link to={`/work/${prev.slug}`} className="col-span-6 text-mute hover:text-ink" data-cursor="view" data-cursor-label="← Prev">
            <span className="label">Previous</span>
            <span className="mt-2 block font-display text-[clamp(24px,3vw,44px)] text-ink">{prev.name}</span>
          </Link>
          <Link to={`/work/${next.slug}`} className="col-span-6 text-right text-mute hover:text-ink" data-cursor="view" data-cursor-label="Next →">
            <span className="label">Next</span>
            <span className="mt-2 block font-display text-[clamp(24px,3vw,44px)] text-ink">{next.name}</span>
          </Link>
        </div>
      </nav>
    </article>
  )
}

export default function ProjectPage() {
  const { slug = '' } = useParams()
  const p = getProject(slug)
  if (!p) {
    return (
      <section className="container-x grid min-h-[70svh] place-items-center pt-32 text-center">
        <div>
          <h1 className="font-display text-[clamp(40px,6vw,96px)] font-medium">Project not found</h1>
          <Link to="/" className="mt-6 inline-block text-mute underline underline-offset-4 hover:text-ink">
            Back to the home page
          </Link>
        </div>
      </section>
    )
  }
  return <ProjectView key={p.slug} p={p} />
}
