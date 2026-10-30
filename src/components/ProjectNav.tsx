import { useEffect, useRef, useState } from 'react'
import { neighbours, type Project } from '../data/projects'
import { TransitionLink } from '../lib/transition'
import { accentFor, useTheme } from '../lib/theme'
import { isTouch, prefersReducedMotion } from '../lib/device'

/**
 * Previous / next project. Hovering a name shows a large preview of that project's
 * cover that follows the pointer with a little lag.
 */
export function ProjectNav({ slug }: { slug: string }) {
  const { prev, next } = neighbours(slug)
  const theme = useTheme()
  const [hovered, setHovered] = useState<Project | null>(null)
  // Which side the preview sits on, so it never covers the name being hovered.
  const side = useRef<'left' | 'right'>('left')
  const preview = useRef<HTMLDivElement>(null)
  const [enabled] = useState(() => !isTouch())

  useEffect(() => {
    if (!enabled) return
    const el = preview.current!
    const reduced = prefersReducedMotion()
    const target = { x: innerWidth / 2, y: innerHeight / 2 }
    const pos = { ...target }
    let raf = 0
    const move = (e: PointerEvent) => {
      target.x = e.clientX
      target.y = e.clientY
    }
    const tick = () => {
      const k = reduced ? 1 : 0.12
      pos.x += (target.x - pos.x) * k
      pos.y += (target.y - pos.y) * k
      const tilt = reduced ? 0 : Math.max(Math.min((target.x - pos.x) * 0.05, 6), -6)
      const shift = side.current === 'left' ? 'calc(-100% - 48px)' : '48px'
      el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(${shift}, -50%) rotate(${tilt}deg)`
      raf = requestAnimationFrame(tick)
    }
    window.addEventListener('pointermove', move, { passive: true })
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', move)
    }
  }, [enabled])

  const link = (p: Project, dir: 'prev' | 'next') => (
    <TransitionLink
      to={`/work/${p.slug}`}
      onPointerEnter={() => {
        side.current = dir === 'next' ? 'left' : 'right'
        setHovered(p)
      }}
      onPointerLeave={() => setHovered(null)}
      onFocus={() => setHovered(p)}
      onBlur={() => setHovered(null)}
      data-cursor="view"
      data-cursor-label={dir === 'next' ? 'Next →' : '← Prev'}
      className={`group block py-10 md:py-16 ${dir === 'next' ? 'text-right' : ''}`}
    >
      <span className="label text-mute">{dir === 'next' ? 'Next project →' : '← Previous project'}</span>
      <span
        className={`mt-4 block font-display font-medium leading-[0.9] tracking-[-0.03em] transition-colors duration-500 group-hover:text-[var(--hover)] ${
          dir === 'next' ? 'text-[clamp(48px,9vw,150px)]' : 'text-[clamp(32px,4.4vw,72px)] text-ink/80'
        }`}
        style={{ ['--hover' as string]: accentFor(p.accent, theme) }}
      >
        {p.name}
      </span>
      <span className={`mt-4 block max-w-[46ch] text-[15px] text-mute ${dir === 'next' ? 'ml-auto' : ''}`}>{p.pitch}</span>
    </TransitionLink>
  )

  return (
    <nav className="container-x border-t border-line" aria-label="More projects">
      <div className="grid-12 items-end gap-y-2">
        <div className="col-span-12 md:col-span-5">{link(prev, 'prev')}</div>
        <div className="col-span-12 border-t border-line md:col-span-7 md:border-t-0">{link(next, 'next')}</div>
      </div>

      {enabled && (
        <div
          ref={preview}
          aria-hidden="true"
          className="pointer-events-none fixed left-0 top-0 z-[60] w-[min(36vw,520px)] transition-[opacity,scale] duration-500"
          style={{ opacity: hovered ? 1 : 0, scale: hovered ? '1' : '0.9' }}
        >
          {[prev, next].map((p) => (
            <div
              key={p.slug}
              className="absolute inset-x-0 top-0 aspect-[16/10] overflow-hidden rounded-2xl border border-line shadow-[0_40px_80px_-30px_var(--shadow)] transition-opacity duration-300"
              style={{ opacity: hovered?.slug === p.slug ? 1 : 0, outline: `1px solid ${accentFor(p.accent, theme)}`, outlineOffset: 6 }}
            >
              <picture>
                <source srcSet={`${p.media.desktop}.avif`} type="image/avif" />
                <img src={`${p.media.desktop}.webp`} alt="" className="h-full w-full object-cover object-top" loading="lazy" />
              </picture>
            </div>
          ))}
        </div>
      )}
    </nav>
  )
}
