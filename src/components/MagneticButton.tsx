import { useRef, useState, type ReactNode, type PointerEvent, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { m, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { isTouch, prefersReducedMotion } from '../lib/device'
import { SPRING } from '../lib/motion'

const MotionLink = m.create(Link)

type Variant = 'primary' | 'ghost' | 'plain'

type Props = {
  children: ReactNode
  /** Internal route (react-router) */
  to?: string
  /** External link or in-page anchor */
  href?: string
  onClick?: (e: MouseEvent) => void
  variant?: Variant
  /** How far the button follows the pointer (0–1). */
  strength?: number
  className?: string
  external?: boolean
  'aria-label'?: string
  type?: 'button' | 'submit'
}

const base =
  'relative inline-flex items-center justify-center gap-2 rounded-full select-none whitespace-nowrap transition-colors duration-300'
const variants: Record<Variant, string> = {
  primary: 'h-12 px-6 bg-accent text-bg font-semibold text-[15px] hover:bg-ink',
  ghost: 'h-12 px-6 border border-line text-ink font-medium text-[15px] hover:border-ink/60 hover:bg-ink/5',
  plain: 'px-1 py-1 text-ink',
}

/** A button or link that leans toward the pointer. Its label leans a little further. */
export function MagneticButton({
  children,
  to,
  href,
  onClick,
  variant = 'primary',
  strength = 0.35,
  className = '',
  external,
  type = 'button',
  ...rest
}: Props) {
  const [active] = useState(() => !isTouch() && !prefersReducedMotion())
  const ref = useRef<HTMLElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, SPRING)
  const sy = useSpring(y, SPRING)
  const ix = useTransform(sx, (v) => v * 0.45)
  const iy = useTransform(sy, (v) => v * 0.45)

  const onMove = (e: PointerEvent) => {
    if (!active || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }

  const shared = {
    ref: ref as never,
    className: `${base} ${variants[variant]} ${className}`,
    style: active ? { x: sx, y: sy } : undefined,
    onPointerMove: onMove,
    onPointerLeave: reset,
    onClick,
    'aria-label': rest['aria-label'],
  }
  const inner = (
    <m.span className="relative inline-flex items-center gap-2" style={active ? { x: ix, y: iy } : undefined}>
      {children}
    </m.span>
  )

  if (to) return <MotionLink to={to} {...shared}>{inner}</MotionLink>
  if (href)
    return (
      <m.a href={href} {...shared} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {inner}
      </m.a>
    )
  return (
    <m.button type={type} {...shared}>
      {inner}
    </m.button>
  )
}
