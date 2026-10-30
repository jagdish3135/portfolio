// README media: raw screenshots, designed cards, a banner and a framed demo video.
// Run against the production build:  npm run build && npx vite preview --port 4173
// then:  node docs/readme/make-media.mjs [shots] [cards] [demo]   (all three by default; needs ffmpeg)
// Output in docs/readme/: banner.webp, card-*.webp, demo.mp4, demo.webp, demo.gif
import { chromium } from 'playwright'
import sharp from 'sharp'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { tmpdir } from 'node:os'

const here = dirname(fileURLToPath(import.meta.url))
const raw = join(here, 'raw')
const BASE = process.env.URL ?? 'http://localhost:4173'
const steps = process.argv.slice(2)
const run = (s) => !steps.length || steps.includes(s)
const GPU = ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11']
const HIDE = '.grain,.skip-link,.cursor-pos{display:none!important}'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const ff = (...args) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' })
mkdirSync(raw, { recursive: true })

async function ready(page, path = '/') {
  await page.goto(`${BASE}${path}${path.includes('?') ? '&' : '?'}scene=full`, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-loader]', { state: 'detached', timeout: 20000 }).catch(() => {})
}
async function walkTo(page, y) {
  for (let v = await page.evaluate(() => scrollY); v < y; v += 350) {
    await page.evaluate((t) => scrollTo(0, t), v)
    await sleep(50)
  }
  await page.evaluate((t) => scrollTo(0, t), y)
  await sleep(1500)
}
const topOf = (page, sel) => page.evaluate((s) => document.querySelector(s).getBoundingClientRect().top + scrollY, sel)

/* ---------- 1. raw screenshots ---------- */
if (run('shots')) {
  const browser = await chromium.launch({ args: GPU })
  const d = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await ready(d)
  await d.addStyleTag({ content: HIDE })
  await sleep(2500)
  await d.screenshot({ path: join(raw, 'hero.png') })
  await walkTo(d, (await topOf(d, '.work-stage')) + 675)
  await sleep(1500)
  await d.screenshot({ path: join(raw, 'work.png') })
  await walkTo(d, (await topOf(d, '#toolkit')) + 160)
  await d.screenshot({ path: join(raw, 'toolkit.png') })
  await ready(d, '/work/lexagent')
  await d.addStyleTag({ content: HIDE })
  await sleep(1800)
  await d.screenshot({ path: join(raw, 'detail.png') })
  await walkTo(d, (await topOf(d, 'svg[role=img]')) - 260)
  await d.screenshot({ path: join(raw, 'diagram.png') })
  const m = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
  await ready(m)
  await m.addStyleTag({ content: HIDE })
  await sleep(2500)
  await m.screenshot({ path: join(raw, 'mobile-hero.png') })
  await ready(m, '/work/jandrishti')
  await m.addStyleTag({ content: HIDE })
  await sleep(1500)
  await m.screenshot({ path: join(raw, 'mobile-detail.png') })
  await browser.close()
  console.log('raw screenshots saved')
}

/* ---------- 2. cards and banner ---------- */
const fontFile = (p) => pathToFileURL(resolve(p)).href
const css = `
@font-face{font-family:Clash;src:url(${fontFile('public/fonts/clash-display-500.woff2')});font-weight:500}
@font-face{font-family:Inter;src:url(${fontFile('node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')});font-weight:100 900}
*{margin:0;box-sizing:border-box} html,body{background:transparent}
.card{position:relative;width:1400px;padding:56px 64px 64px;border-radius:36px;border:1px solid rgb(237 237 237/.14);
  background:radial-gradient(70% 60% at 80% 0%,#1b1b22 0%,transparent 70%),linear-gradient(160deg,#15151b,#0b0b0f);color:#ededed;font-family:Inter;overflow:hidden}
.kicker{display:flex;gap:12px;align-items:center;font-size:17px;letter-spacing:.1em;text-transform:uppercase;color:#8e8e97;font-weight:500}
.kicker i{width:9px;height:9px;border-radius:50%;background:#c6ff3d;display:block}
h2{font-family:Clash;font-weight:500;font-size:62px;letter-spacing:-.03em;line-height:1;margin-top:18px}
p{font-size:23px;color:#a3a3ab;margin-top:14px;max-width:1000px;line-height:1.4}
.browser{margin-top:40px;border-radius:18px;border:1px solid rgb(237 237 237/.16);background:#16161c;overflow:hidden;box-shadow:0 50px 90px -40px #000}
.bar{height:44px;display:flex;align-items:center;gap:8px;padding:0 18px;border-bottom:1px solid rgb(237 237 237/.1)}
.bar i{width:12px;height:12px;border-radius:50%;background:#2c2c34;display:block}
.bar span{margin-left:16px;font-size:14px;color:#8e8e97;background:#0f0f14;border-radius:8px;padding:5px 14px}
.browser img,.browser .slot{display:block;width:100%}
.phones{margin-top:40px;display:flex;gap:56px;justify-content:center}
.phone{width:360px;border-radius:52px;padding:12px;background:#1d1d24;border:1px solid rgb(237 237 237/.18);box-shadow:0 50px 90px -40px #000}
.phone img{display:block;width:100%;border-radius:40px}
`
const browserCard = (c, inner) =>
  `<div class="card"><div class="kicker"><i></i>${c.kicker}</div><h2>${c.title}</h2><p>${c.text}</p>
   <div class="browser"><div class="bar"><i></i><i></i><i></i><span>${c.url}</span></div>${inner}</div></div>`
const dataUrl = (file) => `data:image/png;base64,${readFileSync(join(raw, file)).toString('base64')}`

const CARDS = [
  { file: 'card-hero', kicker: 'Hero · 3D', title: 'Glass UI layers, pulled apart.', text: 'An exploded interface in React Three Fiber that tilts with your mouse and turns when you drag it.', url: 'jagdish-patil / home', shot: 'hero.png' },
  { file: 'card-work', kicker: 'Selected work', title: 'Eight projects in a 3D stack.', text: 'Scroll flips through the panels; hover plays a preview; a click flies the cover into its case study.', url: 'jagdish-patil / #work', shot: 'work.png' },
  { file: 'card-case', kicker: 'Case studies', title: 'Architecture from the real code.', text: 'Every project gets the problem, a diagram drawn from its repo, features, the hardest part and what’s next.', url: 'jagdish-patil / work / lexagent', shot: 'diagram.png' },
  { file: 'card-toolkit', kicker: 'Toolkit', title: 'No skill bars.', text: 'Each tool shows a dot for every project it’s in, in that project’s colour.', url: 'jagdish-patil / #toolkit', shot: 'toolkit.png' },
]

async function render(page, html, out, width = 1400) {
  const tmp = join(tmpdir(), `readme-card-${Date.now()}.html`)
  writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${html}</body></html>`)
  await page.setViewportSize({ width, height: 800 })
  await page.goto(pathToFileURL(tmp).href)
  await page.evaluate(() => document.fonts.ready)
  const el = await page.$('body > *')
  const png = await el.screenshot({ omitBackground: true })
  rmSync(tmp)
  await sharp(png).resize({ width: Math.round(width * 0.8) }).webp({ quality: 86, alphaQuality: 100 }).toFile(out)
  return el.boundingBox()
}

if (run('cards')) {
  const browser = await chromium.launch()
  const page = await browser.newPage({ deviceScaleFactor: 1 })
  for (const c of CARDS) {
    await render(page, browserCard(c, `<img src="${dataUrl(c.shot)}">`), join(here, `${c.file}.webp`))
    console.log('saved', `${c.file}.webp`)
  }
  await render(
    page,
    `<div class="card"><div class="kicker"><i></i>On a phone</div><h2>Lighter 3D, no custom cursor.</h2><p>Phones get a simpler scene, a plain list of projects and native scrolling.</p>
     <div class="phones"><div class="phone"><img src="${dataUrl('mobile-hero.png')}"></div><div class="phone"><img src="${dataUrl('mobile-detail.png')}"></div></div></div>`,
    join(here, 'card-mobile.webp'),
  )
  console.log('saved card-mobile.webp')
  // Banner: the site's own background, rounded, with a border, in both GitHub themes.
  await render(
    page,
    `<div class="card" style="width:1600px;height:520px;padding:64px 72px;display:flex;flex-direction:column;justify-content:flex-end">
       <img src="data:image/webp;base64,${readFileSync('public/hero-poster.webp').toString('base64')}" style="position:absolute;right:-260px;top:-150px;width:1150px;-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 30%)">
       <div class="kicker" style="position:relative"><i></i>Jagdish Patil · Portfolio</div>
       <h2 style="position:relative;font-size:78px;margin-top:22px;max-width:1200px">Building <span style="color:#c6ff3d">AI</span> solutions.<br>Custom setups, shipped live.</h2>
       <p style="position:relative;font-size:24px">AI-native builder · aspiring Forward Deployed Engineer · Surat, India</p>
     </div>`,
    join(here, 'banner.webp'),
    1600,
  )
  console.log('saved banner.webp')
  await browser.close()
}

/* ---------- 3. demo tour, framed in a card ---------- */
if (run('demo')) {
  const browser = await chromium.launch({ args: GPU })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const frames = []
  const dir = join(tmpdir(), 'readme-demo')
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  const cdp = await page.context().newCDPSession(page)
  cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
    const f = `f${String(frames.length).padStart(5, '0')}.jpg`
    writeFileSync(join(dir, f), Buffer.from(data, 'base64'))
    frames.push({ f, t: metadata.timestamp })
    await cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {})
  })
  await page.addInitScript(() => {
    const s = document.createElement('style')
    s.textContent = '.grain,.skip-link{display:none!important}'
    document.addEventListener('DOMContentLoaded', () => document.head.append(s))
  })
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 88, maxWidth: 1440, maxHeight: 900 })
  await page.goto(`${BASE}/?scene=full`)
  await page.mouse.move(720, 450)
  await page.waitForSelector('[data-loader]', { state: 'detached', timeout: 20000 })
  for (let i = 0; i < 30; i++) {
    await page.mouse.move(720 + Math.sin(i / 5) * 300, 380 + Math.cos(i / 6) * 140)
    await sleep(55)
  }
  for (let i = 0; i < 70; i++) {
    await page.mouse.wheel(0, 60)
    await sleep(45)
  }
  // Flip to the second card, then let the smooth scroll and the stack settle completely.
  const stage = await topOf(page, '.work-stage')
  while ((await page.evaluate(() => scrollY)) < stage + 675 * 0.85) {
    await page.mouse.wheel(0, 40)
    await sleep(45)
  }
  await sleep(2200)
  // Click whichever card is at the front (the only one that takes pointer events).
  const front = await page.evaluate(() => {
    const slot = [...document.querySelectorAll('.work-stage__slot')].find((s) => s.style.pointerEvents === 'auto')
    return slot?.querySelector('[data-card]')?.getAttribute('data-card')
  })
  const card = await page.locator(`[data-card="${front}"]`).boundingBox()
  await page.mouse.move(card.x + card.width * 0.6, card.y + card.height * 0.35, { steps: 14 })
  await sleep(900)
  await page.mouse.down()
  await page.mouse.up()
  await page.waitForURL(/\/work\//, { timeout: 5000 })
  await sleep(2200)
  for (let i = 0; i < 40; i++) {
    await page.mouse.wheel(0, 70)
    await sleep(45)
  }
  await sleep(900)
  await cdp.send('Page.stopScreencast')
  await browser.close()

  // Frames → video at their real timing.
  const list = frames.map((fr, i) => `file '${join(dir, fr.f).split('\\').join('/')}'\nduration ${Math.max((frames[i + 1]?.t ?? fr.t + 1 / 30) - fr.t, 1 / 60).toFixed(4)}`)
  writeFileSync(join(dir, 'list.txt'), list.join('\n') + `\nfile '${join(dir, frames.at(-1).f).split('\\').join('/')}'`)
  const rawVideo = join(dir, 'raw.mp4')
  ff('-f', 'concat', '-safe', '0', '-i', join(dir, 'list.txt'), '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-crf', '18', rawVideo)

  // Frame it: a card with a browser bar, the video in the window.
  const cardBrowser = await chromium.launch()
  const p = await cardBrowser.newPage({ deviceScaleFactor: 1 })
  const tmp = join(tmpdir(), 'demo-card.html')
  writeFileSync(
    tmp,
    `<!doctype html><html><head><meta charset="utf-8"><style>${css} .slot{height:${Math.round((1272 * 900) / 1440)}px;background:#000}</style></head><body>${browserCard(
      { kicker: 'Demo', title: 'Loader, hero, the stack, a case study.', text: 'Recorded from the production build.', url: 'jagdish-patil' },
      '<div class="slot"></div>',
    )}</body></html>`,
  )
  await p.setViewportSize({ width: 1400, height: 800 })
  await p.goto(pathToFileURL(tmp).href)
  await p.evaluate(() => document.fonts.ready)
  const cardEl = await p.$('.card')
  const slot = await p.$eval('.slot', (el) => {
    const r = el.getBoundingClientRect()
    return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }
  })
  const bg = join(tmpdir(), 'demo-bg.png')
  await cardEl.screenshot({ path: bg, omitBackground: true })
  await cardBrowser.close()
  const place = `[1]scale=${slot.w}:${slot.h}[v];[0][v]overlay=${slot.x}:${slot.y}:shortest=1`
  ff('-loop', '1', '-i', bg, '-i', rawVideo, '-filter_complex', `${place},scale=1120:-2:flags=lanczos,format=yuv420p`, '-c:v', 'libx264', '-crf', '24', '-preset', 'slow', '-movflags', '+faststart', '-an', join(here, 'demo.mp4'))
  ff('-loop', '1', '-i', bg, '-i', rawVideo, '-filter_complex', `${place},fps=12,scale=960:-2:flags=lanczos,format=yuva420p`, '-c:v', 'libwebp_anim', '-loop', '0', '-q:v', '68', '-an', join(here, 'demo.webp'))
  ff('-loop', '1', '-i', bg, '-i', rawVideo, '-filter_complex', `${place},format=rgb24,fps=8,scale=720:-2:flags=lanczos,split[a][b];[a]palettegen=max_colors=96:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle`, '-loop', '0', join(here, 'demo.gif'))
  rmSync(dir, { recursive: true, force: true })
  console.log(`demo saved (${frames.length} frames)`)
}
