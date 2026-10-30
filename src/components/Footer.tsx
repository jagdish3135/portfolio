import { MagneticButton } from './MagneticButton'
import { site } from '../data/site'
import { scrollTo } from '../lib/smooth'

/** Credits, a few links and a magnetic "back to top". */
export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="container-x border-t border-line py-10 md:py-12">
      <div className="grid-12 items-center gap-y-8">
        <div className="col-span-12 md:col-span-4">
          <p className="font-display text-[22px] font-semibold leading-none">JP</p>
          <p className="mt-3 text-[14px] text-mute">
            © {year} {site.name}. Every project here is my own work, built with AI as a co-pilot.
          </p>
        </div>
        <p className="col-span-12 text-[14px] leading-relaxed text-mute md:col-span-5">
          Built with React, React Three Fiber, GSAP, Lenis and Framer Motion, written with Claude Code, and hosted on
          Vercel. Type: Clash Display and Inter.
        </p>
        <div className="col-span-12 flex items-center justify-between gap-6 md:col-span-3 md:justify-end">
          <ul className="flex gap-5 text-[14px]" aria-label="Elsewhere">
            <li>
              <a href={site.links.github} target="_blank" rel="noopener noreferrer" className="text-mute hover:text-ink">
                GitHub
              </a>
            </li>
            <li>
              <a href={site.links.linkedin} target="_blank" rel="noopener noreferrer" className="text-mute hover:text-ink">
                LinkedIn
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="text-mute hover:text-ink">
                Email
              </a>
            </li>
          </ul>
          <MagneticButton
            onClick={() => {
              scrollTo(0)
              // Keyboard users land back at the top of the page too.
              document.getElementById('main')?.focus({ preventScroll: true })
            }}
            variant="ghost"
            strength={0.5}
            className="!h-14 !w-14 !px-0"
            aria-label="Back to top"
          >
            <span aria-hidden="true" className="text-[18px]">
              ↑
            </span>
          </MagneticButton>
        </div>
      </div>
    </footer>
  )
}
