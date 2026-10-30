// Records a ~7 s muted, looping hover preview of each live site and saves
// public/work/<slug>/preview.mp4 + preview.webm (target: under 1.5 MB each).
// Frames come from Chrome's own screencast, which is sharper than Playwright's recorder.
// Knit uses its existing promo video instead (see KNIT_PROMO below).
// Usage: node scripts/capture-previews.mjs [slug ...]
import { chromium } from 'playwright'
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const SITES = {
  glassboxapk: 'https://glassboxapk.vercel.app',
  lexagent: 'https://lexagent-ai.vercel.app',
  jandrishti: 'https://jandrishti-app.vercel.app',
  sanjaya: 'https://sanjaya-live.vercel.app',
  'sql-buddy': 'https://sql-buddy-app.vercel.app',
  glim: 'https://glim-mcp.vercel.app',
  calculator: 'https://calculator-2-umber.vercel.app',
}
const KNIT_PROMO = '../../project videos/knit/Knit_v1_30s_4x5.mp4'
const DURATION = 7000
const SIZE = { w: 1280, h: 800 }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// What happens on screen during the recording.
const ACTIONS = {
  async default(page) {
    await page.mouse.move(SIZE.w * 0.6, SIZE.h * 0.5)
    const steps = 56
    for (let i = 0; i < steps; i++) {
      await page.mouse.wheel(0, 22)
      await sleep(DURATION / steps)
    }
  },
  async sanjaya(page) {
    await page.mouse.move(SIZE.w * 0.62, SIZE.h * 0.5)
    await page.mouse.down()
    for (let i = 0; i < 70; i++) {
      await page.mouse.move(SIZE.w * 0.62 - i * 4, SIZE.h * 0.5 + Math.sin(i / 12) * 20)
      await sleep(DURATION / 70)
    }
    await page.mouse.up()
  },
  async calculator(page) {
    for (const k of ['1', '2', '8', '*', '7', 'Enter', '+', '4', '2', 'Enter']) {
      await page.keyboard.press(k)
      await sleep(650)
    }
  },
}

function encode(dir, frames, outDir) {
  // Concat list with each frame's real on-screen duration.
  const lines = []
  const posix = (p) => p.split(String.fromCharCode(92)).join('/')
  frames.forEach((f, i) => {
    const next = frames[i + 1]?.t ?? f.t + 1 / 30
    lines.push(`file '${posix(join(dir, f.file))}'`, `duration ${Math.max(next - f.t, 1 / 60).toFixed(4)}`)
  })
  lines.push(`file '${posix(join(dir, frames.at(-1).file))}'`)
  writeFileSync(join(dir, 'list.txt'), lines.join('\n'))
  const vf = 'fps=30,scale=960:600:flags=lanczos,format=yuv420p'
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', join(dir, 'list.txt'), '-vf', vf, '-t', '7', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-movflags', '+faststart', `${outDir}/preview.mp4`])
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', `${outDir}/preview.mp4`, '-an', '-c:v', 'libvpx-vp9', '-crf', '38', '-b:v', '0', '-row-mt', '1', `${outDir}/preview.webm`])
}

function knit() {
  const outDir = 'public/work/knit'
  mkdirSync(outDir, { recursive: true })
  // 6–13 s of the promo ("Type an idea" → "the team takes over"), cropped to 16:10.
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', '6', '-t', '7', '-i', KNIT_PROMO, '-vf', 'crop=1080:675:0:250,scale=960:600:flags=lanczos,fps=30,format=yuv420p', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-movflags', '+faststart', `${outDir}/preview.mp4`])
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', `${outDir}/preview.mp4`, '-an', '-c:v', 'libvpx-vp9', '-crf', '38', '-b:v', '0', '-row-mt', '1', `${outDir}/preview.webm`])
}

const only = process.argv.slice(2)
if (!only.length || only.includes('knit')) {
  knit()
  console.log('saved public/work/knit/preview')
}

const browser = await chromium.launch({ args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11'] })
for (const [slug, url] of Object.entries(SITES)) {
  if (only.length && !only.includes(slug)) continue
  const page = await browser.newPage({ viewport: { width: SIZE.w, height: SIZE.h } })
  await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {})
  await sleep(5500)
  await page.addStyleTag({ content: '[class*="grain" i]{opacity:0!important}' }).catch(() => {})

  const dir = join(tmpdir(), `preview-${slug}`)
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  const frames = []
  const cdp = await page.context().newCDPSession(page)
  cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
    const file = `f${String(frames.length).padStart(4, '0')}.jpg`
    writeFileSync(join(dir, file), Buffer.from(data, 'base64'))
    frames.push({ file, t: metadata.timestamp })
    await cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {})
  })
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 88, maxWidth: SIZE.w, maxHeight: SIZE.h, everyNthFrame: 1 })
  await (ACTIONS[slug] ?? ACTIONS.default)(page)
  await sleep(300)
  await cdp.send('Page.stopScreencast')
  await page.close()

  const outDir = `public/work/${slug}`
  mkdirSync(outDir, { recursive: true })
  encode(dir, frames, outDir)
  const kb = (f) => Math.round(statSync(`${outDir}/${f}`).size / 1024)
  console.log(`saved ${outDir}/preview  frames=${frames.length}  mp4=${kb('preview.mp4')}KB webm=${kb('preview.webm')}KB`)
}
await browser.close()
