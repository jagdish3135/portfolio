import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { gsap, ScrollTrigger } from '../lib/motion'
import { prefersReducedMotion } from '../lib/device'
import { getLenis } from '../lib/smooth'

type Img = { src: string; alt: string; width?: number; height?: number; className?: string; fit?: 'cover' | 'contain' }

/** <picture> with AVIF and WebP for a path without extension. */
export function Picture({ src, alt, width, height, className = '', fit = 'cover' }: Img) {
  return (
    <picture className="block h-full w-full">
      <source srcSet={`${src}.avif`} type="image/avif" />
      <img
        src={`${src}.webp`}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className={`h-full w-full ${fit === 'cover' ? 'object-cover object-top' : 'object-contain'} ${className}`}
      />
    </picture>
  )
}

/** Moves its image a little slower than the page. Off with reduced motion. */
export function Parallax({ children, amount = 8, className = '' }: { children: React.ReactNode; amount?: number; className?: string }) {
  const outer = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        inner.current,
        { yPercent: -amount / 2 },
        {
          yPercent: amount / 2,
          ease: 'none',
          scrollTrigger: { trigger: outer.current, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
    }, outer)
    return () => ctx.revert()
  }, [amount])
  return (
    <div ref={outer} className={`overflow-hidden ${className}`}>
      <div ref={inner} className="h-full w-full" style={{ scale: prefersReducedMotion() ? undefined : `${1 + amount / 100}` }}>
        {children}
      </div>
    </div>
  )
}

/** A screenshot you can click to see full size. Esc, the close button or a click outside closes it. */
export function Zoomable({ src, alt, children, className = '' }: { src: string; alt: string; children: React.ReactNode; className?: string }) {
  const [open, setOpen] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = dialog.current
    if (!d) return
    if (open) {
      d.showModal()
      getLenis()?.stop()
      if (!prefersReducedMotion()) gsap.fromTo(d.querySelector('img'), { scale: 0.94, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5 })
    } else if (d.open) {
      d.close()
    }
    return () => void getLenis()?.start()
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`block w-full text-left ${className}`}
        data-cursor="view"
        data-cursor-label="Expand ↗"
        aria-label={`Show full size: ${alt}`}
      >
        {children}
      </button>
      {open &&
        createPortal(
          <dialog
            ref={dialog}
            onClose={() => setOpen(false)}
            onClick={(e) => e.target === e.currentTarget && setOpen(false)}
            className="m-0 h-[100svh] max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-[rgb(5_5_8/0.92)] backdrop:backdrop-blur-sm"
            aria-label={alt}
          >
            <div className="grid h-full w-full place-items-center p-4 md:p-10" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
              <picture className="contents">
                <source srcSet={`${src}.avif`} type="image/avif" />
                <img src={`${src}.webp`} alt={alt} className="max-h-full max-w-full rounded-xl object-contain shadow-2xl" />
              </picture>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="fixed right-4 top-4 h-11 rounded-full border border-line bg-bg px-5 text-[14px] text-ink md:right-8 md:top-8"
              autoFocus
            >
              Close
            </button>
          </dialog>,
          document.body,
        )}
    </>
  )
}

// Images change layout as they load; keep pinned sections measured correctly.
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => ScrollTrigger.refresh())
}
