import type { MouseEvent } from 'react'
import { setTheme, useTheme } from '../lib/theme'

/** Sun / moon button. The new theme grows out of the button in a circle. */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const theme = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'
  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setTheme(next, { x: r.left + r.width / 2, y: r.top + r.height / 2 })
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={`relative grid h-10 w-10 place-items-center rounded-full border border-line text-ink transition-colors duration-300 hover:border-ink/40 ${className}`}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
        {theme === 'dark' ? (
          // Sun: switch to light
          <>
            <circle cx="12" cy="12" r="4.2" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
              <path key={a} d="M12 2.6v2.2" transform={`rotate(${a} 12 12)`} />
            ))}
          </>
        ) : (
          // Moon: switch to dark
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
        )}
      </svg>
    </button>
  )
}
