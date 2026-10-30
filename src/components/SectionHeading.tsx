import type { ReactNode } from 'react'
import { SplitReveal } from './Reveal'

type Props = {
  index: string
  label: string
  /** The big heading. Optional: some sections lead with body copy instead. */
  title?: ReactNode
  id?: string
  className?: string
}

/** "(01) About" on the left three columns, an optional big heading on the right nine. */
export function SectionHeading({ index, label, title, id, className = '' }: Props) {
  return (
    <div className={`grid-12 gap-y-6 ${className}`}>
      <p className="label col-span-12 flex items-center gap-3 text-mute md:col-span-3 md:pt-3">
        <span className="tabular text-ink/85">({index})</span>
        <span aria-hidden="true" className="h-px w-6 bg-line" />
        {label}
      </p>
      {title && (
        <SplitReveal
          as="h2"
          id={id}
          className="col-span-12 font-display text-[clamp(34px,5vw,84px)] font-medium leading-[0.98] tracking-[-0.025em] md:col-span-9"
        >
          {title}
        </SplitReveal>
      )}
    </div>
  )
}
