import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { isTouch, prefersReducedMotion } from '../lib/device'

/**
 * The "studio HUD" cursor: thin crosshair lines across the screen that meet at the pointer,
 * a small ring, and a live x · y readout in mono, like the coordinates in the hero bar.
 *
 * It changes with what is under the pointer:
 *   [data-cursor="view"]  → a lime "VIEW →" badge (or data-cursor-label)
 *   [data-cursor="drag"]  → a lime "← DRAG →" badge
 *   links and buttons     → the ring grows, the readout says "→ open"
 *   text blocks           → the ring becomes a caret sized to the text
 *   inputs                → hidden, so the native I-beam shows
 *
 * Off on touch devices. With reduced motion the ring follows without lag.
 */

type Mode = 'default' | 'link' | 'view' | 'drag' | 'text' | 'native'

const INTERACTIVE = 'a, button, [role="button"], label, select, summary'
const NATIVE = 'input, textarea, [contenteditable="true"]'
const TEXT = 'p, h1, h2, h3, h4, h5, h6, li, blockquote, figcaption, dt, dd, [data-cursor-text]'
const READOUT: Partial<Record<Mode, string>> = { link: '→ open', view: 'View →', drag: '← Drag →', text: 'text' }

function resolve(target: Element | null): { mode: Mode; label?: string; el?: Element } {
  if (!target) return { mode: 'default' }
  if (target.closest(NATIVE)) return { mode: 'native' }

  const explicit = target.closest<HTMLElement>('[data-cursor]')
  const interactive = target.closest(INTERACTIVE)

  // A button inside a drag area is still a button. A card that is itself a link keeps its label.
  if (explicit && (!interactive || interactive.contains(explicit))) {
    const mode = explicit.dataset.cursor as Mode
    return { mode, label: explicit.dataset.cursorLabel, el: explicit }
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
  const rootRef = useRef<HTMLDivElement>(null)
  const hRef = useRef<HTMLDivElement>(null)
  const vRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const readRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!enabled) return
    const root = rootRef.current!
    const hLine = hRef.current!
    const vLine = vRef.current!
    const ring = ringRef.current!
    const read = readRef.current!
    const html = document.documentElement
    html.classList.add('has-custom-cursor')

    const reduced = prefersReducedMotion()
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const pos = { ...mouse }
    let seen = false
    let raf = 0
    let last = performance.now()
    let fixedText: string | null = null // a label instead of coordinates
    let shown = ''

    const setHidden = (hidden: boolean) => (root.dataset.hidden = String(hidden))
    setHidden(true)

    const setMode = (target: Element | null) => {
      const next = resolve(target)
      if (next.mode === 'text' && next.el) {
        const size = parseFloat(getComputedStyle(next.el).fontSize) || 16
        root.style.setProperty('--caret', `${Math.min(Math.max(size * 1.05, 16), 140)}px`)
      }
      root.dataset.mode = next.mode
      fixedText = next.label ?? READOUT[next.mode] ?? null
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
    const onDown = () => (root.dataset.pressed = 'true')
    const onUp = () => (root.dataset.pressed = 'false')
    const onLeave = () => setHidden(true)
    const onEnter = () => seen && setHidden(false)

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      // The lines sit exactly on the pointer; the ring and readout glide a little behind.
      const k = reduced ? 1 : 1 - Math.pow(1 - 0.32, dt * 60)
      pos.x += (mouse.x - pos.x) * k
      pos.y += (mouse.y - pos.y) * k
      hLine.style.transform = `translate3d(0, ${mouse.y}px, 0)`
      vLine.style.transform = `translate3d(${mouse.x}px, 0, 0)`
      ring.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`
      read.style.transform = `translate3d(${pos.x + 18}px, ${pos.y + 16}px, 0)`
      const text = fixedText ?? `x ${Math.round(mouse.x)} · y ${Math.round(mouse.y)}`
      if (text !== shown) {
        shown = text
        read.textContent = text
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver, { passive: true })
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('cursor:refresh', onRefresh)
    window.addEventListener('pointerup', onUp)
    html.addEventListener('mouseleave', onLeave)
    html.addEventListener('mouseenter', onEnter)

    return () => {
      cancelAnimationFrame(raf)
      html.classList.remove('has-custom-cursor')
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('cursor:refresh', onRefresh)
      window.removeEventListener('pointerup', onUp)
      html.removeEventListener('mouseleave', onLeave)
      html.removeEventListener('mouseenter', onEnter)
    }
  }, [enabled])

  if (!enabled) return null

  return createPortal(
    <div ref={rootRef} className="hud" data-mode="default" aria-hidden="true">
      <div ref={hRef} className="hud-h" />
      <div ref={vRef} className="hud-v" />
      <div ref={ringRef} className="hud-pos">
        <div className="hud-ring" />
      </div>
      <span ref={readRef} className="hud-read" />
    </div>,
    document.body,
  )
}
