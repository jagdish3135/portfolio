import { useEffect, useRef, useState, type MouseEvent, type PointerEvent, type FocusEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { pad, type Project } from '../data/projects'
import { useFlight } from '../lib/flight'
import { accentFor, useTheme } from '../lib/theme'
import { isTouch, prefersReducedMotion } from '../lib/device'

/** Desktop stack: about 62vw wide. Grid on tablets: half the width. Phones: full width. */
const COVER_SIZES = '(min-width: 1024px) 62vw, (min-width: 768px) 46vw, 92vw'

type Props = {
  project: Project
  index: number
  variant: 'stack' | 'list'
  /** Load the cover right away (first cards). */
  eager?: boolean
  onFocus?: (e: FocusEvent) => void
}

/**
 * A project as a glass panel: cover (with a hover preview video), number, name, pitch, tags and year.
 * Clicking flies the cover into the detail page hero.
 */
export function ProjectCard({ project: p, index, variant, eager, onFocus }: Props) {
  const navigate = useNavigate()
  const brand = accentFor(p.accent, useTheme())
  const { takeOff } = useFlight()
  const cardRef = useRef<HTMLAnchorElement>(null)
  const mediaRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [interactive] = useState(() => !isTouch() && !prefersReducedMotion())
  const [wantVideo, setWantVideo] = useState(false)
  const [playing, setPlaying] = useState(false)

  const hovering = useRef(false)

  // React doesn't set the muted attribute, so start playback by hand once the video exists.
  const play = () => {
    const v = videoRef.current
    if (!v || !hovering.current) return
    v.muted = true
    void v.play().catch(() => {})
  }
  useEffect(play, [wantVideo])

  const onEnter = () => {
    if (!interactive) return
    hovering.current = true
    if (wantVideo) play()
    else setWantVideo(true)
  }
  const onLeave = () => {
    hovering.current = false
    cardRef.current?.style.setProperty('--rx', '0deg')
    cardRef.current?.style.setProperty('--ry', '0deg')
    videoRef.current?.pause()
    setPlaying(false)
  }
  const onMove = (e: PointerEvent) => {
    if (!interactive || !cardRef.current) return
    const r = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    cardRef.current.style.setProperty('--rx', `${-y * 6}deg`)
    cardRef.current.style.setProperty('--ry', `${x * 8}deg`)
  }

  const onClick = (e: MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    const media = mediaRef.current
    const img = imgRef.current
    if (media && img) {
      takeOff({
        slug: p.slug,
        src: img.currentSrc || img.src,
        from: media.getBoundingClientRect(),
        radius: parseFloat(getComputedStyle(media).borderRadius) || 0,
      })
    }
    sessionStorage.setItem('home-scroll', String(window.scrollY))
    navigate(`/work/${p.slug}`)
  }

  const stack = variant === 'stack'

  return (
    <Link
      ref={cardRef}
      to={`/work/${p.slug}`}
      onClick={onClick}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onPointerMove={onMove}
      onFocus={onFocus}
      data-cursor="view"
      data-card={p.slug}
      className="project-card group block"
      style={{ ['--brand' as string]: brand }}
      aria-label={`${p.name}: ${p.pitch}`}
    >
      <article className="project-card__panel">
        <div ref={mediaRef} className="project-card__media" data-cover={p.slug}>
          <picture>
            <source
              srcSet={`${p.media.desktop}-800.avif 800w, ${p.media.desktop}.avif 1440w`}
              sizes={COVER_SIZES}
              type="image/avif"
            />
            <img
              ref={imgRef}
              src={`${p.media.desktop}.webp`}
              srcSet={`${p.media.desktop}-800.webp 800w, ${p.media.desktop}.webp 1440w`}
              sizes={COVER_SIZES}
              alt={`${p.name} home page`}
              width={1440}
              height={900}
              loading={eager ? 'eager' : 'lazy'}
              decoding="async"
              className="h-full w-full object-cover object-top"
            />
          </picture>
          {wantVideo && (
            <video
              ref={videoRef}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${playing ? 'opacity-100' : 'opacity-0'}`}
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden="true"
              onPlaying={() => setPlaying(true)}
            >
              <source src={`${p.media.preview}.webm`} type="video/webm" />
              <source src={`${p.media.preview}.mp4`} type="video/mp4" />
            </video>
          )}
          <span className="project-card__shade" aria-hidden="true" />
        </div>

        <div className={`grid gap-x-6 gap-y-3 px-2 pt-5 pb-2 md:px-3 ${stack ? 'grid-cols-[1fr_auto]' : ''}`}>
          <div className="min-w-0">
            <p className="label flex items-center gap-2.5 text-mute">
              <span className="tabular text-ink/85">{pad(index)}</span>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: brand }} aria-hidden="true" />
              {p.year}
            </p>
            <h3 className="mt-2 font-display text-[clamp(26px,2.6vw,40px)] font-medium leading-none tracking-[-0.02em]">
              {p.name}
            </h3>
            <p className={`mt-3 max-w-[62ch] text-[15px] leading-relaxed text-mute ${stack ? 'line-clamp-1' : ''}`}>{p.pitch}</p>
          </div>
          <ul className={`flex flex-wrap gap-2 ${stack ? 'items-end justify-end self-end' : ''}`} aria-label="Tags">
            {p.tags.map((t) => (
              <li key={t} className="rounded-full border border-line px-3 py-1.5 text-[13px] text-ink/80">
                {t}
              </li>
            ))}
          </ul>
        </div>
      </article>
    </Link>
  )
}
