import { useEffect, useState, type MouseEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { usePageTransition } from '../lib/transition'
import { m, AnimatePresence } from 'framer-motion'
import { MagneticButton } from './MagneticButton'
import { ThemeToggle } from './ThemeToggle'
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
      <m.header
        className="fixed inset-x-0 top-0 z-50 pt-3 md:pt-5"
        initial={false}
        animate={{ y: hidden && !open ? '-130%' : '0%' }}
        transition={{ duration: DUR.base * 0.6, ease: EASE_BEZIER }}
      >
        {/* Two floating pills: logo and links on the left, status and actions on the right. */}
        <nav aria-label="Main" className="container-x flex items-center justify-between gap-3">
          <div className="nav-pill flex h-14 items-center gap-2 pl-5 pr-2 md:gap-1 md:pr-3">
            <a
              href="/"
              data-logo
              className="mr-1 font-display text-[22px] font-semibold leading-none tracking-tight md:mr-5"
              style={{ opacity: done ? 1 : 0 }}
              aria-label="Jagdish Patil, home"
              onClick={goTo('#top')}
            >
              JP
            </a>
            <m.ul
              className="hidden items-center md:flex"
              initial={{ opacity: 0 }}
              animate={ready ? { opacity: 1 } : {}}
              transition={{ duration: DUR.base, delay: 0.25, ease: EASE_BEZIER }}
            >
              {LINKS.map((l) => (
                <li key={l.href}>
                  <MagneticButton
                    href={l.href}
                    variant="plain"
                    strength={0.3}
                    onClick={goTo(l.href)}
                    className="h-10 rounded-xl !px-3.5 !py-0 text-[15px] text-ink/85 hover:bg-ink/[0.06] hover:text-ink"
                  >
                    {l.label}
                  </MagneticButton>
                </li>
              ))}
            </m.ul>
          </div>

          <m.div
            className="nav-pill flex h-14 items-center gap-1.5 px-2"
            initial={{ opacity: 0 }}
            animate={ready ? { opacity: 1 } : {}}
            transition={{ duration: DUR.base, delay: 0.35, ease: EASE_BEZIER }}
          >
            <span className="hidden items-center gap-2 px-3 text-[14px] text-ink/80 lg:inline-flex">
              <span className="pulse-dot" aria-hidden="true" />
              Available for work
            </span>
            <ThemeToggle className="!border-transparent hover:!bg-ink/[0.06]" />
            <a
              href="#contact"
              onClick={goTo('#contact')}
              className="hidden h-10 items-center rounded-xl bg-ink px-4 text-[15px] font-medium text-bg transition-colors duration-300 hover:bg-accent hover:text-on-accent sm:inline-flex"
            >
              Let’s talk
            </a>
            <button
              type="button"
              className="inline-flex h-10 items-center rounded-xl px-3 text-[15px] hover:bg-ink/[0.06] md:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? 'Close' : 'Menu'}
            </button>
          </m.div>
        </nav>
      </m.header>

      <AnimatePresence>
        {open && (
          <m.div
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
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
}
