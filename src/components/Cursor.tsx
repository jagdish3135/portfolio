import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { isTouch, prefersReducedMotion } from '../lib/device'

/**
 * Custom cursor: a dot that sits exactly on the pointer and a ring that follows it with lag.
 *
 * The ring changes with what is under it:
 *   [data-cursor="view"]  → accent pill with a label ("View →" by default)
 *   [data-cursor="drag"]  → bigger ring with "Drag"
 *   links and buttons     → ring grows, dot hides
 *   text blocks           → thin caret sized to the text
 *   inputs                → hidden, so the native I-beam shows
 * Set data-cursor-label="…" to change the label text.
 *
 * Off on touch devices. With reduced motion it follows without lag.
 */

type Mode = 'default' | 'link' | 'view' | 'drag' | 'text' | 'native'

const INTERACTIVE = 'a, button, [role="button"], label, select, summary'
const NATIVE = 'input, textarea, [contenteditable="true"]'
const TEXT = 'p, h1, h2, h3, h4, h5, h6, li, blockquote, figcaption, dt, dd, [data-cursor-text]'
const LABELS: Partial<Record<Mode, string>> = { view: 'View →', drag: '← Drag →' }

function resolve(target: Element | null): { mode: Mode; label?: string; el?: Element } {
  if (!target) return { mode: 'default' }
  if (target.closest(NATIVE)) return { mode: 'native' }

  const explicit = target.closest<HTMLElement>('[data-cursor]')
  const interactive = target.closest(INTERACTIVE)

  // A button inside a drag area is still a button. A card that is itself a link keeps its label.
  if (explicit && (!interactive || interactive.contains(explicit))) {
    const mode = explicit.dataset.cursor as Mode
    return { mode, label: explicit.dataset.cursorLabel ?? LABELS[mode], el: explicit }
  }
  if (interactive) return { mode: 'link' }

  const text = target.closest(TEXT)
  if (text) return { mode: 'text', el: text }
  return { mode: 'default' }
}

/** Re-reads what is under the pointer (after a route change, nothing fires pointerover). */
export function refreshCursor() {
  window.dispatchEvent(new Event('cursor:refresh'))
}

export function Cursor() {
  const [enabled] = useState(() => typeof window !== 'undefined' && !isTouch())
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!enabled) return
    const dot = dotRef.current!
    const ring = ringRef.current!
    const label = labelRef.current!
    const root = document.documentElement
    root.classList.add('has-custom-cursor')

    const reduced = prefersReducedMotion()
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const pos = { ...mouse }
    let seen = false
    let raf = 0
    let last = performance.now()
    let mode: Mode = 'default'

    const setHidden = (hidden: boolean) => {
      dot.dataset.hidden = String(hidden)
      ring.dataset.hidden = String(hidden)
    }
    setHidden(true)

    const setMode = (target: Element | null) => {
      const next = resolve(target)
      if (next.mode === 'text' && next.el) {
        const size = parseFloat(getComputedStyle(next.el).fontSize) || 16
        ring.style.setProperty('--caret', `${Math.min(Math.max(size * 1.1, 16), 150)}px`)
      }
      if (next.mode === mode && !next.label) return
      mode = next.mode
      dot.dataset.mode = mode
      ring.dataset.mode = mode
      if (next.label) label.textContent = next.label
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      mouse.x = e.clientX
      mouse.y = e.clientY
      if (!seen) {
        seen = true
        pos.x = mouse.x
        pos.y = mouse.y
        setHidden(false)
      }
    }
    const onOver = (e: PointerEvent) => setMode(e.target as Element)
    const onRefresh = () => setMode(document.elementFromPoint(mouse.x, mouse.y))
    const onDown = () => (ring.dataset.pressed = 'true')
    const onUp = () => (ring.dataset.pressed = 'false')
    const onLeave = () => setHidden(true)
    const onEnter = () => seen && setHidden(false)

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      // Frame-rate independent lerp: about 0.18 per frame at 60 fps.
      const k = reduced ? 1 : 1 - Math.pow(1 - 0.18, dt * 60)
      pos.x += (mouse.x - pos.x) * k
      pos.y += (mouse.y - pos.y) * k
      dot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`
      ring.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver, { passive: true })
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('cursor:refresh', onRefresh)
    window.addEventListener('pointerup', onUp)
    document.documentElement.addEventListener('mouseleave', onLeave)
    document.documentElement.addEventListener('mouseenter', onEnter)

    return () => {
      cancelAnimationFrame(raf)
      root.classList.remove('has-custom-cursor')
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('cursor:refresh', onRefresh)
      window.removeEventListener('pointerup', onUp)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      document.documentElement.removeEventListener('mouseenter', onEnter)
    }
  }, [enabled])

  if (!enabled) return null

  // Two separate fixed layers at body level, so mix-blend-mode blends with the page.
  return createPortal(
    <>
      <div ref={ringRef} className="cursor-pos" data-mode="default" aria-hidden="true">
        <div className="cursor-ring">
          <span ref={labelRef} className="cursor-label" />
        </div>
      </div>
      <div ref={dotRef} className="cursor-pos" data-mode="default" aria-hidden="true">
        <div className="cursor-dot" />
      </div>
    </>,
    document.body,
  )
}
