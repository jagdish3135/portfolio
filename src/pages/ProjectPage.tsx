import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { getProject, pad, projects, type CaseStudy, type Project } from '../data/projects'
import { useFlight } from '../lib/flight'
import { gsap, DUR, EASE, STAGGER } from '../lib/motion'
import { getLenis } from '../lib/smooth'
import { setMeta } from '../lib/meta'
import { TransitionLink } from '../lib/transition'
import { prefersReducedMotion } from '../lib/device'
import { MagneticButton } from '../components/MagneticButton'
import { SplitReveal, FadeUp } from '../components/Reveal'
import { ArchDiagram } from '../components/ArchDiagram'
import { Parallax, Picture, Zoomable } from '../components/Media'
import { ProjectNav } from '../components/ProjectNav'

/** Left: "(01) The problem". Right: the content, on the 12-column grid. */
function Chapter({ index, label, title, children, id }: { index: string; label: string; title?: ReactNode; children: ReactNode; id: string }) {
  return (
    <section className="container-x py-20 md:py-28" aria-labelledby={id}>
      <div className="grid-12 gap-y-6">
        <p className="label col-span-12 flex items-center gap-3 self-start text-mute md:col-span-3 md:pt-3">
          <span className="tabular text-ink/85">({index})</span>
          <span aria-hidden="true" className="h-px w-6 bg-line" />
          <span id={id}>{label}</span>
        </p>
        <div className="col-span-12 md:col-span-9">
          {title && (
            <SplitReveal as="h2" className="mb-8 font-display text-[clamp(30px,3.6vw,56px)] font-medium leading-[1.02] tracking-[-0.02em]">
              {title}
            </SplitReveal>
          )}
          {children}
        </div>
      </div>
    </section>
  )
}

function Paragraphs({ items, lead }: { items: string[]; lead?: boolean }) {
  return (
    <div className="space-y-5">
      {items.map((t, i) => (
        <FadeUp
          as="p"
          key={i}
          delay={i * 0.06}
          className={
            lead && i === 0
              ? 'max-w-[40ch] font-display text-[clamp(24px,2.4vw,36px)] font-medium leading-[1.2] tracking-[-0.01em]'
              : 'max-w-[62ch] text-[17px] leading-relaxed text-mute md:text-[18px]'
          }
        >
          {t}
        </FadeUp>
      ))}
    </div>
  )
}

function Study({ p, cs }: { p: Project; cs: CaseStudy }) {
  const wide = cs.features.filter((f) => f.shape === 'wide')
  const tall = cs.features.filter((f) => f.shape === 'tall')
  return (
    <>
      <Chapter index="01" label="The problem" id="ch-problem">
        <Paragraphs items={cs.problem} lead />
      </Chapter>

      <Chapter index="02" label="What I built" id="ch-built">
        <Paragraphs items={cs.built} lead />
        {cs.builtList && (
          <FadeUp as="ul" className="mt-10 grid gap-x-8 gap-y-3 border-t border-line pt-8 md:grid-cols-2">
            {cs.builtList.map((b) => (
              <li key={b} className="flex gap-3 text-[16px] leading-relaxed">
                <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: p.accent }} aria-hidden="true" />
                {b}
              </li>
            ))}
          </FadeUp>
        )}
      </Chapter>

      <section className="container-x py-20 md:py-28" aria-labelledby="ch-how">
        <div className="grid-12 gap-y-6">
          <p className="label col-span-12 flex items-center gap-3 self-start text-mute md:col-span-3 md:pt-3">
            <span className="tabular text-ink/85">(03)</span>
            <span aria-hidden="true" className="h-px w-6 bg-line" />
            <span id="ch-how">How it works</span>
          </p>
          <SplitReveal
            as="h2"
            className="col-span-12 font-display text-[clamp(30px,3.6vw,56px)] font-medium leading-[1.02] tracking-[-0.02em] md:col-span-9"
          >
            The architecture, from the real code.
          </SplitReveal>
        </div>
        <div className="mt-12 rounded-[24px] border border-line bg-surface/50 p-4 md:mt-16 md:p-8">
          <ArchDiagram diagram={cs.diagram} accent={p.accent} label={`${p.name} architecture: ${cs.how.map((h) => h.title).join(', then ')}.`} />
          <p className="mt-3 text-[13px] text-mute md:hidden">Scroll the diagram sideways →</p>
        </div>
        <ol className="grid-12 mt-12 gap-y-8 md:mt-16">
          {cs.how.map((h, i) => (
            <FadeUp as="li" key={h.title} delay={(i % 3) * 0.06} className="col-span-12 border-t border-line pt-5 sm:col-span-6 lg:col-span-4">
              <p className="label tabular text-mute">Step {i + 1}</p>
              <h3 className="mt-3 text-[19px] font-semibold">{h.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-mute">{h.body}</p>
            </FadeUp>
          ))}
        </ol>
      </section>

      <Chapter index="04" label="Key features" id="ch-features" title="What it does well.">
        <div className="space-y-16 md:space-y-24">
          {wide.map((f) => (
            <figure key={f.title}>
              <Zoomable src={f.image} alt={f.alt}>
                <Parallax
                  className="rounded-[18px] border border-line bg-surface"
                  style={{ aspectRatio: f.size ? `${f.size[0]} / ${f.size[1]}` : '16 / 10' }}
                  amount={f.still ? 0 : 6}
                >
                  <Picture src={f.image} alt={f.alt} width={f.size?.[0] ?? 1600} height={f.size?.[1] ?? 1000} />
                </Parallax>
              </Zoomable>
              <figcaption className="mt-6 grid gap-2 md:grid-cols-[1fr_1.4fr] md:gap-10">
                <h3 className="font-display text-[clamp(22px,2vw,30px)] font-medium leading-tight">{f.title}</h3>
                <p className="text-[16px] leading-relaxed text-mute">{f.body}</p>
              </figcaption>
            </figure>
          ))}
          {tall.length > 0 && (
            <div className="grid gap-12 md:grid-cols-2 md:gap-[var(--col-gap)]">
              {tall.map((f) => (
                <figure key={f.title}>
                  <Zoomable src={f.image} alt={f.alt}>
                    <div className="grid aspect-[4/5] place-items-center overflow-hidden rounded-[18px] border border-line bg-surface p-6 md:p-10">
                      <Picture src={f.image} alt={f.alt} fit="contain" className="rounded-lg" />
                    </div>
                  </Zoomable>
                  <figcaption className="mt-6">
                    <h3 className="font-display text-[clamp(22px,2vw,30px)] font-medium leading-tight">{f.title}</h3>
                    <p className="mt-3 text-[16px] leading-relaxed text-mute">{f.body}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </Chapter>

      <Chapter index="05" label="The hardest part" id="ch-hardest">
        <FadeUp
          as="p"
          className="max-w-[40ch] font-display text-[clamp(24px,2.4vw,36px)] font-medium leading-[1.2] tracking-[-0.01em]"
        >
          {cs.hardest.problem}
        </FadeUp>
        <div className="mt-8">
          <Paragraphs items={cs.hardest.solution} />
        </div>
        {cs.hardest.code && (
          <FadeUp className="mt-10 overflow-hidden rounded-[18px] border border-line bg-[#0f0f14]">
            <p className="flex items-center justify-between border-b border-line px-5 py-3 text-[13px] text-mute">
              <span className="font-mono">{cs.hardest.code.file}</span>
              <span className="label">From the repo</span>
            </p>
            <pre className="overflow-x-auto p-5 text-[13px] leading-[1.7] text-ink/90" data-lenis-prevent tabIndex={0}>
              <code className="font-mono">{cs.hardest.code.source}</code>
            </pre>
          </FadeUp>
        )}
      </Chapter>

      <Chapter index="06" label="What I’d do next" id="ch-next">
        <ul className="divide-y divide-line border-y border-line">
          {cs.next.map((n, i) => (
            <FadeUp as="li" key={n} delay={i * 0.05} className="flex gap-6 py-5 text-[17px] leading-relaxed md:text-[19px]">
              <span className="tabular text-mute">{pad(i)}</span>
              {n}
            </FadeUp>
          ))}
        </ul>
      </Chapter>
    </>
  )
}

function ProjectView({ p }: { p: Project }) {
  const { land } = useFlight()
  const root = useRef<HTMLElement>(null)
  const coverRef = useRef<HTMLDivElement>(null)
  const [coverHidden, setCoverHidden] = useState(false)
  const index = projects.findIndex((x) => x.slug === p.slug)
  const cs = p.caseStudy

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
    getLenis()?.scrollTo(0, { immediate: true, force: true })
    setMeta(`${p.name}, a case study — Jagdish Patil`, cs?.summary ?? p.pitch)

    const landing = land(p.slug, coverRef.current!, () => setCoverHidden(false))
    setCoverHidden(landing)

    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from('[data-detail-line]', { yPercent: 110, duration: DUR.slow, stagger: STAGGER, ease: EASE, delay: landing ? 0.25 : 0.1 })
      gsap.from('[data-detail-fade]', { opacity: 0, y: 20, duration: DUR.slow, stagger: STAGGER, ease: EASE, delay: landing ? 0.45 : 0.25 })
    }, root)
    return () => ctx.revert()
  }, [p.slug, p.name, p.pitch, cs?.summary, land])

  return (
    <article ref={root} style={{ ['--accent' as string]: p.accent }} aria-labelledby="project-title">
      <header className="container-x pt-32 md:pt-40">
        <div className="grid-12 gap-y-6">
          <p data-detail-fade className="label col-span-12 flex items-center gap-3 text-mute md:col-span-3 md:pt-4">
            <TransitionLink to="/" state={{ scrollTo: '#work' }} className="hover:text-ink">
              ← All work
            </TransitionLink>
            <span aria-hidden="true" className="h-px w-6 bg-line" />
            <span className="tabular text-ink/85">
              {pad(index)} / {pad(projects.length - 1)}
            </span>
          </p>
          <div className="col-span-12 md:col-span-9">
            <h1 id="project-title" className="font-display text-[clamp(52px,9vw,168px)] font-medium leading-[0.9] tracking-[-0.03em]">
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
                fetchPriority="high"
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

      {cs ? (
        <Study p={p} cs={cs} />
      ) : (
        <section className="container-x my-24 md:my-32" aria-label="Case study">
          <p className="grid-12 text-[15px] text-mute">
            <span className="col-span-12 md:col-span-6 md:col-start-4">The full case study for {p.name} is on its way.</span>
          </p>
        </section>
      )}

      <ProjectNav slug={p.slug} />
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
          <TransitionLink to="/" className="mt-6 inline-block text-mute underline underline-offset-4 hover:text-ink">
            Back to the home page
          </TransitionLink>
        </div>
      </section>
    )
  }
  return <ProjectView key={p.slug} p={p} />
}
