import { useEffect, useState, type MouseEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { usePageTransition } from '../lib/transition'
import { motion, AnimatePresence } from 'framer-motion'
import { MagneticButton } from './MagneticButton'
import { useIntro } from '../lib/intro'
import { scrollTo } from '../lib/smooth'
import { DUR, EASE_BEZIER } from '../lib/motion'

const LINKS = [
  { label: 'Work', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Toolkit', href: '#toolkit' },
  { label: 'Contact', href: '#contact' },
]

/** Sticky nav. Hides while scrolling down, comes back on the way up. */
export function Nav() {
  const { ready, done } = useIntro()
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const go = usePageTransition()

  useEffect(() => {
    let lastY = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      const delta = y - lastY
      if (Math.abs(delta) > 6) {
        setHidden(delta > 0 && y > 120)
        lastY = y
      }
      setScrolled(y > 40)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const goTo = (href: string) => (e: MouseEvent) => {
    e.preventDefault()
    setOpen(false)
    if (location.pathname === '/') scrollTo(href, -40)
    else go('/', { scrollTo: href })
  }

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50"
        initial={false}
        animate={{ y: hidden && !open ? '-110%' : '0%' }}
        transition={{ duration: DUR.base * 0.6, ease: EASE_BEZIER }}
      >
        <div
          className={`absolute inset-0 -z-10 transition-opacity duration-500 ${scrolled ? 'opacity-100' : 'opacity-0'}`}
          style={{
            background: 'linear-gradient(to bottom, rgb(11 11 15 / 0.85), rgb(11 11 15 / 0))',
            backdropFilter: 'blur(6px)',
            maskImage: 'linear-gradient(to bottom, black 55%, transparent)',
          }}
        />
        <nav aria-label="Main" className="container-x grid-12 h-[76px] items-center">
          <a
            href="/"
            data-logo
            className="col-span-6 md:col-span-3 justify-self-start font-display text-[22px] font-semibold leading-none tracking-tight"
            style={{ opacity: done ? 1 : 0 }}
            aria-label="Jagdish Patil, home"
            onClick={goTo('#top')}
          >
            JP
          </a>

          <motion.ul
            className="col-span-6 hidden items-center justify-center gap-8 md:flex"
            initial={{ opacity: 0, y: -8 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: DUR.base, delay: 0.25, ease: EASE_BEZIER }}
          >
            {LINKS.map((l) => (
              <li key={l.href}>
                <MagneticButton
                  href={l.href}
                  variant="plain"
                  strength={0.4}
                  onClick={goTo(l.href)}
                  className="text-[14px] text-ink/80 hover:text-ink"
                >
                  {l.label}
                </MagneticButton>
              </li>
            ))}
          </motion.ul>

          <motion.div
            className="col-span-6 flex items-center justify-end gap-3 md:col-span-3"
            initial={{ opacity: 0, y: -8 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: DUR.base, delay: 0.35, ease: EASE_BEZIER }}
          >
            <span className="hidden items-center gap-2.5 rounded-full border border-line px-3.5 py-2 text-[13px] text-ink/85 sm:inline-flex">
              <span className="pulse-dot" aria-hidden="true" />
              Available for work
            </span>
            <button
              type="button"
              className="inline-flex h-10 items-center rounded-full border border-line px-4 text-[14px] md:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? 'Close' : 'Menu'}
            </button>
          </motion.div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 flex flex-col justify-end bg-bg px-[var(--gutter)] pb-10 pt-24 md:hidden"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: DUR.page, ease: EASE_BEZIER }}
          >
            <ul className="space-y-2">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} onClick={goTo(l.href)} className="font-display text-[44px] font-medium leading-tight">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-10 inline-flex items-center gap-2.5 text-[14px] text-mute">
              <span className="pulse-dot" aria-hidden="true" /> Available for work
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
