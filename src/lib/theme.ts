import { useSyncExternalStore } from 'react'
import { prefersReducedMotion } from './device'

/*
 * Dark by default; light when <html data-theme="light">. The choice is remembered.
 * A tiny script in index.html applies the saved theme before first paint, so there is no flash.
 */

export type Theme = 'dark' | 'light'
const KEY = 'theme'
const META_COLOR: Record<Theme, string> = { dark: '#0b0b0f', light: '#f3f2ee' }

export const getTheme = (): Theme =>
  typeof document !== 'undefined' && document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'

function apply(theme: Theme) {
  const root = document.documentElement
  if (theme === 'light') root.dataset.theme = 'light'
  else delete root.dataset.theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META_COLOR[theme])
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    /* private mode: the choice just isn't remembered */
  }
}

/** Switches theme. With a click position, the new theme grows out of it in a circle. */
export function setTheme(theme: Theme, from?: { x: number; y: number }) {
  type VT = { ready: Promise<void> }
  const doc = document as Document & { startViewTransition?: (cb: () => void) => VT }
  if (!doc.startViewTransition || prefersReducedMotion() || !from) {
    apply(theme)
    return
  }
  const t = doc.startViewTransition(() => apply(theme))
  const r = Math.hypot(Math.max(from.x, innerWidth - from.x), Math.max(from.y, innerHeight - from.y))
  void t.ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${from.x}px ${from.y}px)`, `circle(${r}px at ${from.x}px ${from.y}px)`] },
      { duration: 650, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)' },
    )
  })
}

function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb)
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => mo.disconnect()
}

/** The current theme, re-rendering when it changes. */
export const useTheme = () => useSyncExternalStore(subscribe, getTheme, () => 'dark' as Theme)

/** Relative luminance (0–1) of a #rrggbb colour. */
function luminance(hex: string) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}

/**
 * A project's brand colour, adjusted so it stays visible on the current background:
 * near-white colours (LexAgent's paper) become ink on the light theme.
 */
export function accentFor(accent: string, theme: Theme) {
  return theme === 'light' && luminance(accent) > 0.8 ? '#111115' : accent
}
