import { useRef, useState, type PointerEvent } from 'react'
import { SectionHeading } from '../components/SectionHeading'
import { FadeUp } from '../components/Reveal'
import { toolkit, usedInLabel, type ToolGroup } from '../data/toolkit'
import { projects } from '../data/projects'
import { isTouch, prefersReducedMotion } from '../lib/device'

const nameOf = (id: string) => projects.find((p) => p.slug === id)?.name ?? usedInLabel[id] ?? id
const colourOf = (id: string) => projects.find((p) => p.slug === id)?.accent ?? (id === 'site' ? '#c6ff3d' : '#8e8e97')

/** One glass panel per group. It leans toward the pointer; hovering a tool names where it's used. */
function Panel({ group, index }: { group: ToolGroup; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt] = useState(() => !isTouch() && !prefersReducedMotion())
  const [active, setActive] = useState<string | null>(null)
  const current = group.tools.find((t) => t.name === active)

  const onMove = (e: PointerEvent) => {
    if (!tilt || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    ref.current.style.setProperty('--rx', `${-((e.clientY - r.top) / r.height - 0.5) * 6}deg`)
    ref.current.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 8}deg`)
  }
  const onLeave = () => {
    ref.current?.style.setProperty('--rx', '0deg')
    ref.current?.style.setProperty('--ry', '0deg')
    setActive(null)
  }

  return (
    <div className="h-full [perspective:1200px]" onPointerMove={onMove} onPointerLeave={onLeave}>
      <div ref={ref} className="tool-panel flex h-full flex-col">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-display text-[clamp(22px,1.8vw,28px)] font-medium leading-tight">{group.title}</h3>
          <span className="label tabular text-mute">0{index + 1}</span>
        </div>
        <p className="mt-1 text-[14px] text-mute">{group.note}</p>

        <ul className="mt-6 divide-y divide-line border-t border-line">
          {group.tools.map((t) => (
            <li
              key={t.name}
              onPointerEnter={() => setActive(t.name)}
              className={`flex items-center justify-between gap-4 py-2.5 transition-colors duration-300 ${
                active && active !== t.name ? 'text-ink/45' : 'text-ink'
              }`}
              aria-label={`${t.name}: used in ${t.usedIn.map(nameOf).join(', ')}`}
            >
              <span className="text-[15px]">{t.name}</span>
              <span className="flex shrink-0 items-center gap-1" aria-hidden="true">
                {t.usedIn.map((id) => (
                  <span key={id} className="h-1.5 w-1.5 rounded-full" style={{ background: colourOf(id) }} />
                ))}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-auto min-h-[2.8em] pt-4 text-[13px] leading-snug text-mute" aria-hidden="true">
          {current ? (
            <>
              <span className="text-ink/85">{current.name}</span> in {current.usedIn.map(nameOf).join(', ')}
            </>
          ) : (
            tilt ? 'Hover a tool to see where I used it.' : 'Each dot is one project, in its own colour.'
          )}
        </p>
      </div>
    </div>
  )
}

export function Toolkit() {
  return (
    <section id="toolkit" className="container-x pb-28 md:pb-40" aria-labelledby="toolkit-title">
      <SectionHeading index="04" label="Toolkit" id="toolkit-title" title="The tools I actually use." />
      <p className="mt-6 grid-12 text-[17px] leading-relaxed text-mute md:mt-8">
        <span className="col-span-12 max-w-[56ch] md:col-span-6 md:col-start-4">
          No skill bars. Each dot is a project the tool is in, in that project’s colour, so you can check it against
          the work above.
        </span>
      </p>
      <p className="mt-6 text-[13px] text-mute sm:hidden" aria-hidden="true">
        Swipe for more →
      </p>
      {/* Phones: a shelf you swipe sideways. Larger screens: a grid. */}
      <div className="-mx-[var(--gutter)] mt-14 flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--gutter)] pb-4 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-[var(--col-gap)] sm:overflow-visible sm:px-0 sm:pb-0 md:mt-20 lg:grid-cols-3">
        {toolkit.map((g, i) => (
          <FadeUp key={g.title} delay={(i % 3) * 0.06} className="h-full w-[84%] shrink-0 snap-start sm:w-auto">
            <Panel group={g} index={i} />
          </FadeUp>
        ))}
      </div>
    </section>
  )
}
