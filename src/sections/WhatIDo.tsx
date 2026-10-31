import { useRef, type PointerEvent, type ReactNode } from 'react'
import { SectionHeading } from '../components/SectionHeading'
import { FadeUp } from '../components/Reveal'
import { GlassStack } from '../components/GlassStack'
import { isTouch, prefersReducedMotion } from '../lib/device'

type Capability = {
  title: string
  body: string
  proof: string[]
  /** Glass layers, bottom to top, drawn in a 100×100 SVG box. */
  layers: ReactNode[]
}

const dots = (
  <g strokeWidth="0" fill="currentColor" opacity="0.6">
    {Array.from({ length: 25 }, (_, i) => (
      <circle key={i} cx={14 + (i % 5) * 18} cy={14 + Math.floor(i / 5) * 18} r="1.1" />
    ))}
  </g>
)

const CAPABILITIES: Capability[] = [
  {
    title: 'AI agents & multi-agent systems',
    body: 'Small teams of AI agents that plan, check each other’s work and hand you something usable. Plus MCP servers that let agents use real tools safely.',
    proof: ['Knit', 'LexAgent', 'Glim'],
    layers: [
      dots,
      <g key="net">
        <path d="M25 30 L50 50 L75 28 M50 50 L30 74 M50 50 L72 72" opacity="0.7" />
        <circle cx="25" cy="30" r="6" />
        <circle cx="75" cy="28" r="6" />
        <circle cx="30" cy="74" r="6" />
        <circle cx="72" cy="72" r="6" />
      </g>,
      <g key="top">
        <circle cx="50" cy="50" r="15" className="accent" />
        <path d="M43 50 L48 55 L58 45" className="accent" strokeWidth="2.2" />
      </g>,
    ],
  },
  {
    title: 'Full-stack web apps',
    body: 'Apps people can use on day one: React or Next.js front ends, serverless APIs, and data that stays where it should, sometimes right in the browser.',
    proof: ['JanDrishti', 'SQL Buddy', 'Habit Tracker'],
    layers: [
      <g key="db">
        <ellipse cx="50" cy="28" rx="24" ry="8" />
        <path d="M26 28 V70 C26 75 37 79 50 79 C63 79 74 75 74 70 V28" />
        <path d="M26 49 C26 54 37 58 50 58 C63 58 74 54 74 49" opacity="0.6" />
      </g>,
      <g key="api" strokeWidth="2">
        <path d="M36 30 C28 30 30 44 24 50 C30 56 28 70 36 70" />
        <path d="M64 30 C72 30 70 44 76 50 C70 56 72 70 64 70" />
        <path d="M44 50 H56" opacity="0.6" />
      </g>,
      <g key="ui">
        <rect x="16" y="20" width="68" height="60" rx="6" />
        <path d="M16 32 H84" opacity="0.6" />
        <path d="M26 46 H62 M26 54 H52" opacity="0.7" />
        <rect x="26" y="63" width="22" height="8" rx="4" className="accent-fill" />
      </g>,
    ],
  },
  {
    title: '3D & interactive frontends',
    body: 'Scroll stories, live globes, custom cursors and models made in Blender, kept fast and respectful of reduced-motion settings.',
    proof: ['Sanjaya', 'GlassBoxAPK', 'This portfolio'],
    layers: [
      <g key="grid" opacity="0.7">
        {[20, 35, 50, 65, 80].map((v) => (
          <path key={`h${v}`} d={`M14 ${v} H86`} />
        ))}
        {[20, 35, 50, 65, 80].map((v) => (
          <path key={`v${v}`} d={`M${v} 14 V86`} />
        ))}
      </g>,
      <g key="cube">
        <path d="M50 18 L78 33 L78 66 L50 82 L22 66 L22 33 Z" />
        <path d="M22 33 L50 49 L78 33 M50 49 V82" opacity="0.7" />
      </g>,
      <g key="cursor">
        <circle cx="50" cy="50" r="16" className="accent" />
        <circle cx="50" cy="50" r="3" className="accent-fill" />
      </g>,
    ],
  },
  {
    title: 'Shipping to production',
    body: 'I don’t stop at a demo: tests, a review pass, a README with real screenshots, and a live deploy on Vercel.',
    proof: ['Playwright', 'Vitest', 'Vercel'],
    layers: [
      <g key="term">
        <rect x="14" y="20" width="72" height="60" rx="6" />
        <path d="M24 36 L32 42 L24 48 M38 48 H52" />
        <path d="M24 60 H70 M24 68 H56" opacity="0.5" />
      </g>,
      <g key="pipe">
        <path d="M22 50 H78" opacity="0.6" />
        {[22, 50, 78].map((x) => (
          <g key={x}>
            <circle cx={x} cy="50" r="8" />
            <path d={`M${x - 3.5} 50 L${x - 1} 52.5 L${x + 4} 47.5`} />
          </g>
        ))}
      </g>,
      <g key="live">
        <circle cx="50" cy="50" r="7" className="accent-fill" />
        <circle cx="50" cy="50" r="17" className="accent" opacity="0.7" />
        <path d="M50 26 V14 M44 19 L50 13 L56 19" className="accent" strokeWidth="2" />
      </g>,
    ],
  },
]

function CapabilityCard({ c, index }: { c: Capability; index: number }) {
  const ref = useRef<HTMLElement>(null)
  const tilt = !isTouch() && !prefersReducedMotion()

  const onMove = (e: PointerEvent) => {
    if (!tilt || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    ref.current.style.setProperty('--tilt-x', `${x * 24}deg`)
    ref.current.style.setProperty('--tilt-y', `${-y * 18}deg`)
  }
  const onLeave = () => {
    ref.current?.style.setProperty('--tilt-x', '0deg')
    ref.current?.style.setProperty('--tilt-y', '0deg')
  }

  return (
    <article
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface/60 p-6 transition-colors duration-500 hover:border-ink/25 md:p-8"
      aria-labelledby={`cap-${index}`}
    >
      <div className="flex items-start justify-between gap-6">
        <span className="label tabular text-mute">0{index + 1}</span>
        <GlassStack layers={c.layers} className="-mr-4 mt-3 shrink-0 md:-mr-6" />
      </div>
      <h3 id={`cap-${index}`} className="mt-2 font-display text-[clamp(24px,2.2vw,34px)] font-medium leading-[1.05] tracking-[-0.015em]">
        {c.title}
      </h3>
      <p className="mt-4 max-w-[46ch] text-[16px] leading-relaxed text-mute">{c.body}</p>
      <ul className="mt-auto flex flex-wrap gap-2 pt-8" aria-label="Examples">
        {c.proof.map((p) => (
          <li key={p} className="rounded-full border border-line px-3 py-1.5 text-[13px] text-ink/80">
            {p}
          </li>
        ))}
      </ul>
    </article>
  )
}

export function WhatIDo() {
  return (
    <section id="services" className="container-x pb-28 md:pb-40" aria-labelledby="services-title">
      <SectionHeading index="02" label="What I do" id="services-title" title="From an idea to a live link, end to end." />
      <ul className="grid-12 mt-14 gap-y-[var(--col-gap)] md:mt-20">
        {CAPABILITIES.map((c, i) => (
          <FadeUp as="li" key={c.title} delay={(i % 2) * 0.08} className="col-span-12 md:col-span-6">
            <CapabilityCard c={c} index={i} />
          </FadeUp>
        ))}
      </ul>
    </section>
  )
}
