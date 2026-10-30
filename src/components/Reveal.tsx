import { useLayoutEffect, useRef, type ElementType, type ReactNode, type HTMLAttributes } from 'react'
import { gsap, SplitText, DUR, EASE, STAGGER, REVEAL_START } from '../lib/motion'
import { prefersReducedMotion } from '../lib/device'

type SplitProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType
  children: ReactNode
  /** Reveal by line (default) or word by word inside each line. */
  by?: 'lines' | 'words'
  delay?: number
}

/**
 * Text that slides up line by line out of a mask when it scrolls into view (GSAP SplitText).
 * Re-splits on resize and after fonts load. With reduced motion it just shows the text.
 */
export function SplitReveal({ as: Tag = 'p', children, by = 'lines', delay = 0, ...rest }: SplitProps) {
  const ref = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      SplitText.create(el, {
        type: by === 'words' ? 'lines,words' : 'lines',
        mask: 'lines',
        autoSplit: true,
        onSplit(self) {
          return gsap.from(by === 'words' ? self.words : self.lines, {
            yPercent: 110,
            duration: DUR.slow,
            stagger: by === 'words' ? STAGGER / 3 : STAGGER,
            ease: EASE,
            delay,
            scrollTrigger: { trigger: el, start: REVEAL_START, once: true },
          })
        },
      })
    }, el)
    return () => ctx.revert()
  }, [by, delay])

  return (
    <Tag ref={ref} {...rest}>
      {children}
    </Tag>
  )
}

type FadeProps = HTMLAttributes<HTMLElement> & { as?: ElementType; children: ReactNode; delay?: number; y?: number }

/** A block that fades and rises into place on scroll. */
export function FadeUp({ as: Tag = 'div', children, delay = 0, y = 28, ...rest }: FadeProps) {
  const ref = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from(el, {
        opacity: 0,
        y,
        duration: DUR.slow,
        delay,
        ease: EASE,
        scrollTrigger: { trigger: el, start: REVEAL_START, once: true },
      })
    }, el)
    return () => ctx.revert()
  }, [delay, y])
  return (
    <Tag ref={ref} {...rest}>
      {children}
    </Tag>
  )
}
