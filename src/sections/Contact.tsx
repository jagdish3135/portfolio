import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, m } from 'framer-motion'
import { SectionHeading } from '../components/SectionHeading'
import { SplitReveal, FadeUp } from '../components/Reveal'
import { MagneticButton } from '../components/MagneticButton'
import { GlassStack } from '../components/GlassStack'
import { site } from '../data/site'
import { useISTTime } from '../lib/useLocalTime'
import { DUR, EASE_BEZIER } from '../lib/motion'

/** Morning, afternoon, evening or night in Surat right now. */
function partOfDay() {
  const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: site.timeZone, hour: 'numeric', hour12: false }).format(new Date()))
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'night'
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Older browsers or no permission: fall back to a hidden textarea.
    const t = document.createElement('textarea')
    t.value = text
    t.setAttribute('readonly', '')
    t.style.position = 'fixed'
    t.style.opacity = '0'
    document.body.append(t)
    t.select()
    const ok = document.execCommand('copy')
    t.remove()
    return ok
  }
}

const envelope = [
  <g key="grid" opacity="0.6">
    {[25, 50, 75].map((v) => (
      <path key={v} d={`M14 ${v} H86 M${v} 14 V86`} />
    ))}
  </g>,
  <g key="mail">
    <rect x="16" y="26" width="68" height="48" rx="6" />
    <path d="M16 30 L50 54 L84 30" />
  </g>,
  <g key="send">
    <path d="M22 52 L80 26 L62 78 L50 58 Z" className="accent" strokeWidth="2" />
    <path d="M50 58 L80 26" className="accent" strokeWidth="2" />
  </g>,
]

export function Contact() {
  const time = useISTTime()
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  const [period, setPeriod] = useState(partOfDay)

  useEffect(() => {
    const id = window.setInterval(() => setPeriod(partOfDay()), 60_000)
    return () => {
      window.clearInterval(id)
      window.clearTimeout(timer.current)
    }
  }, [])

  const onCopy = async () => {
    const ok = await copyText(site.email)
    if (!ok) {
      window.location.href = `mailto:${site.email}`
      return
    }
    setCopied(true)
    setToast(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setCopied(false)
      setToast(false)
    }, 2400)
  }

  return (
    <section id="contact" className="relative overflow-hidden pb-24 md:pb-32" aria-labelledby="contact-title">
      <div className="container-x">
        <SectionHeading index="05" label="Contact" />

        <div className="relative mt-8 md:mt-10">
          <SplitReveal
            as="h2"
            id="contact-title"
            by="words"
            className="relative z-10 font-display text-[clamp(56px,11.5vw,210px)] font-medium leading-[0.88] tracking-[-0.035em]"
          >
            Let’s build <br className="hidden sm:block" />
            something.
          </SplitReveal>
          <div className="pointer-events-none absolute right-0 top-1/2 hidden origin-right -translate-y-1/2 scale-[1.3] opacity-80 lg:block xl:scale-[1.45]">
            <GlassStack layers={envelope} />
          </div>
        </div>

        <div className="grid-12 mt-14 gap-y-12 md:mt-20">
          <FadeUp className="col-span-12 lg:col-span-7">
            <p className="max-w-[44ch] text-[18px] leading-relaxed text-mute">
              Open to Forward Deployed Engineer roles and remote AI work. Tell me what you’re building, and I’ll reply
              from Surat.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <MagneticButton
                onClick={onCopy}
                variant="primary"
                strength={0.25}
                className="!h-14 !px-7 !text-[16px]"
                aria-label={copied ? 'Email address copied' : `Copy email address ${site.email}`}
              >
                <span className="tabular">{site.email}</span>
                <span className="rounded-full bg-on-accent/90 px-2.5 py-0.5 text-[12px] font-semibold text-[#c6ff3d]">
                  {copied ? 'Copied ✓' : 'Copy'}
                </span>
              </MagneticButton>
              <a
                href={`mailto:${site.email}`}
                className="px-2 text-[15px] text-mute underline decoration-line underline-offset-4 transition-colors hover:text-ink"
              >
                or open your mail app
              </a>
            </div>
            <ul className="mt-6 flex flex-wrap gap-3" aria-label="Elsewhere">
              <li>
                <MagneticButton href={site.links.linkedin} external variant="ghost">
                  LinkedIn <span aria-hidden="true">↗</span>
                </MagneticButton>
              </li>
              <li>
                <MagneticButton href={site.links.github} external variant="ghost">
                  GitHub <span aria-hidden="true">↗</span>
                </MagneticButton>
              </li>
              {site.resume && (
                <li>
                  <MagneticButton href={site.resume} external variant="ghost">
                    Résumé (PDF) <span aria-hidden="true">↗</span>
                  </MagneticButton>
                </li>
              )}
            </ul>
          </FadeUp>

          <FadeUp delay={0.1} className="col-span-12 lg:col-span-4 lg:col-start-9">
            <div className="rounded-[22px] border border-line bg-surface/60 p-6 md:p-7">
              <p className="label flex items-center gap-2.5 text-mute">
                <span className="pulse-dot" aria-hidden="true" />
                Local time
              </p>
              <p className="mt-4 font-display text-[clamp(44px,4.4vw,64px)] font-medium leading-none tabular" aria-live="off">
                {time}
              </p>
              <p className="mt-3 text-[15px] text-mute">
                Surat, IST (UTC+5:30). It’s {period} here.
              </p>
            </div>
          </FadeUp>
        </div>
      </div>

      {createPortal(
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex justify-center px-4" role="status" aria-live="polite">
          <AnimatePresence>
            {toast && (
              <m.p
                initial={{ y: 24, opacity: 0, scale: 0.96 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 16, opacity: 0 }}
                transition={{ duration: DUR.fast * 1.4, ease: EASE_BEZIER }}
                className="flex items-center gap-2.5 rounded-full border border-line bg-bg/95 px-5 py-3 text-[14px] text-ink shadow-[0_20px_40px_-20px_var(--shadow)] backdrop-blur"
              >
                <span className="grid h-5 w-5 place-items-center rounded-full bg-accent text-[11px] font-bold text-on-accent" aria-hidden="true">
                  ✓
                </span>
                Email copied. Paste it anywhere.
              </m.p>
            )}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </section>
  )
}
