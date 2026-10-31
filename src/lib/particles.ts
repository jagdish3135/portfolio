/*
 * The particle name: "JAGDISH PATIL" sampled from text into a few thousand dots on a 2D canvas.
 *
 * - Before `assemble()`, the dots drift scattered across the stage.
 * - `assemble()` springs them into the letters, in a left-to-right sweep.
 * - `setSplit(q)` (0–1, from scroll) cuts the name at the gap between the two words: the halves part
 *   (sideways on wide screens, up and down on narrow ones), scatter a little and fade out,
 *   handing over to the hero below.
 * - The pointer pushes dots away; they spring back.
 *
 * Plain canvas, no WebGL: cheap enough for phones, and it works without a GPU.
 */

type Dot = {
  x: number
  y: number
  vx: number
  vy: number
  hx: number // home, in the assembled name
  hy: number
  sx: number // scattered start
  sy: number
  side: -1 | 1 // which half of the name
  delay: number // seconds after assemble() before this dot moves in
  colour: number // index into the palette
  size: number
  seed: number
}


const SPRING = 0.075
const DAMPING = 0.8
const REPEL_RADIUS = 90

export class ParticleName {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private dots: Dot[] = []
  private w = 0
  private h = 0
  private dpr = 1
  private vertical = false
  private split = { x: 0, y: 0 } // the cut, in CSS pixels
  private alpha = 1
  private colours: string[] = []
  private assembledAt = -1
  private q = 0 // smoothed split progress
  private target = 0
  private pointer = { x: -9999, y: -9999 }
  private raf = 0
  private running = false
  private start = performance.now()

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
  }

  /** Reads the theme colours from CSS: mostly ink, some muted, a few lime. */
  setColours(ink: string, mute: string, accent: string) {
    this.colours = [ink, mute, accent]
  }

  /** (Re)builds the dots for the canvas's current size. Call after fonts load and on resize. */
  build() {
    const rect = this.canvas.getBoundingClientRect()
    this.w = rect.width
    this.h = rect.height
    this.dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.canvas.width = Math.round(this.w * this.dpr)
    this.canvas.height = Math.round(this.h * this.dpr)
    this.vertical = this.w < 768

    // Draw the name off screen and sample its pixels.
    const off = document.createElement('canvas')
    off.width = Math.round(this.w)
    off.height = Math.round(this.h)
    const o = off.getContext('2d', { willReadFrequently: true })!
    const font = (px: number) => `600 ${px}px "Clash Display", "Inter Variable", sans-serif`
    o.textBaseline = 'middle'
    o.fillStyle = '#fff'

    const words = ['JAGDISH', 'PATIL']
    let fontSize: number
    if (this.vertical) {
      o.font = font(100)
      const widest = Math.max(...words.map((t) => o.measureText(t).width))
      fontSize = Math.min((this.w * 0.86 * 100) / widest, this.h * 0.2)
      o.font = font(fontSize)
      const lineH = fontSize * 0.98
      const cy = this.h * 0.47
      words.forEach((t, i) => {
        const tw = o.measureText(t).width
        o.fillText(t, (this.w - tw) / 2, cy + (i === 0 ? -lineH / 2 : lineH / 2))
      })
      this.split = { x: this.w / 2, y: cy }
    } else {
      o.font = font(100)
      const full = o.measureText('JAGDISH PATIL').width
      fontSize = Math.min((this.w * 0.86 * 100) / full, this.h * 0.3)
      o.font = font(fontSize)
      const total = o.measureText('JAGDISH PATIL').width
      const first = o.measureText('JAGDISH').width
      const space = o.measureText('JAGDISH ').width - first
      const x0 = (this.w - total) / 2
      const cy = this.h * 0.47
      o.fillText('JAGDISH PATIL', x0, cy)
      this.split = { x: x0 + first + space / 2, y: cy }
    }

    const data = o.getImageData(0, 0, off.width, off.height).data
    const step = Math.max(3, Math.min(6, Math.round(fontSize / 34)))
    const dots: Dot[] = []
    for (let y = 0; y < off.height; y += step) {
      for (let x = 0; x < off.width; x += step) {
        if (data[(y * off.width + x) * 4 + 3] < 128) continue
        const side: -1 | 1 = this.vertical ? (y < this.split.y ? -1 : 1) : x < this.split.x ? -1 : 1
        const r = Math.random()
        const old = this.dots[dots.length]
        dots.push({
          x: old?.x ?? Math.random() * this.w,
          y: old?.y ?? Math.random() * this.h,
          vx: 0,
          vy: 0,
          hx: x,
          hy: y,
          sx: Math.random() * this.w,
          sy: Math.random() * this.h,
          side,
          delay: (x / this.w) * 0.55 + Math.random() * 0.25,
          colour: r < 0.06 ? 2 : r < 0.18 ? 1 : 0,
          size: step * (0.42 + Math.random() * 0.22),
          seed: Math.random() * Math.PI * 2,
        })
      }
    }
    // Draw by colour, so the canvas changes fill style only three times a frame.
    this.dots = dots.sort((a, b) => a.colour - b.colour)
  }

  assemble() {
    if (this.assembledAt < 0) this.assembledAt = performance.now()
  }

  /** Shows the finished name at once (reduced motion, or coming back to the page). */
  settle() {
    this.assembledAt = performance.now() - 5000
    for (const d of this.dots) {
      d.x = d.hx
      d.y = d.hy
    }
  }

  setSplit(q: number) {
    this.target = Math.min(Math.max(q, 0), 1)
  }

  setPointer(x: number, y: number) {
    this.pointer.x = x
    this.pointer.y = y
  }

  play() {
    if (this.running) return
    this.running = true
    let last = performance.now()
    const frame = (now: number) => {
      if (!this.running) return
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      this.step(now, dt)
      this.draw()
      this.raf = requestAnimationFrame(frame)
    }
    this.raf = requestAnimationFrame(frame)
  }

  pause() {
    this.running = false
    cancelAnimationFrame(this.raf)
  }

  private step(now: number, dt: number) {
    const k = 1 - Math.pow(1 - 0.14, dt * 60)
    this.q += (this.target - this.q) * k
    const q = this.q
    const ease = q < 0.5 ? 2 * q * q : 1 - (-2 * q + 2) ** 2 / 2
    // The name fades out over the second half of the cut.
    this.alpha = 1 - Math.min(Math.max((ease - 0.55) / 0.45, 0), 1)
    const spread = ease * ease * 160
    const t = (now - this.start) / 1000
    const since = this.assembledAt < 0 ? -1 : (now - this.assembledAt) / 1000
    const { x: px, y: py } = this.pointer
    const f = dt * 60

    for (const d of this.dots) {
      let tx: number
      let ty: number
      if (since < d.delay) {
        // Waiting: drift slowly where it is.
        tx = d.sx + Math.sin(t * 0.4 + d.seed) * 14
        ty = d.sy + Math.cos(t * 0.35 + d.seed) * 14
      } else if (this.vertical) {
        // Halves part up and down from the cut, then scatter.
        tx = d.hx + Math.cos(d.seed) * spread * 0.6
        ty = d.hy + d.side * ease * this.h * 0.42 + Math.sin(d.seed) * spread
      } else {
        // Halves part sideways from the cut, then scatter.
        tx = d.hx + d.side * ease * this.w * 0.5 + Math.cos(d.seed) * spread
        ty = d.hy + Math.sin(d.seed) * spread * 0.8
      }
      // A slow shimmer, so the name feels alive.
      tx += Math.sin(t * 1.3 + d.seed) * 0.6
      ty += Math.cos(t * 1.1 + d.seed) * 0.6

      d.vx += (tx - d.x) * SPRING * f
      d.vy += (ty - d.y) * SPRING * f

      const dx = d.x - px
      const dy = d.y - py
      const dist2 = dx * dx + dy * dy
      if (dist2 < REPEL_RADIUS * REPEL_RADIUS) {
        const dist = Math.sqrt(dist2) || 1
        const push = (1 - dist / REPEL_RADIUS) * 3.2 * f
        d.vx += (dx / dist) * push
        d.vy += (dy / dist) * push
      }

      const damp = Math.pow(DAMPING, f)
      d.vx *= damp
      d.vy *= damp
      d.x += d.vx * f
      d.y += d.vy * f
    }
  }

  private draw() {
    const { ctx, dpr } = this
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, this.w, this.h)
    if (this.alpha <= 0.01) return
    ctx.globalAlpha = this.alpha
    let current = -1
    for (const d of this.dots) {
      if (d.colour !== current) {
        current = d.colour
        ctx.fillStyle = this.colours[current] ?? '#fff'
      }
      ctx.fillRect(d.x - d.size / 2, d.y - d.size / 2, d.size, d.size)
    }
  }
}
