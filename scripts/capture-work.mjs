// Screenshots each project's live site at desktop (1440x900) and mobile (390x844)
// and saves AVIF + WebP into public/work/<slug>/.
// Usage: node scripts/capture-work.mjs [slug ...]
import { chromium } from 'playwright'
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

export const SITES = {
  knit: 'https://jagdish3135.github.io/knit/',
  glassboxapk: 'https://glassboxapk.vercel.app',
  lexagent: 'https://lexagent-ai.vercel.app',
  jandrishti: 'https://jandrishti-app.vercel.app',
  sanjaya: 'https://sanjaya-live.vercel.app',
  'sql-buddy': 'https://sql-buddy-app.vercel.app',
  glim: 'https://glim-mcp.vercel.app',
  calculator: 'https://calculator-2-umber.vercel.app',
}

// Hide custom cursors, grain and cookie-style overlays so stills look clean.
const CLEAN = `
  [class*="cursor" i]:not(html):not(body), .grain, [class*="grain" i] { opacity: 0 !important; }
  html, body { cursor: auto !important; }
`

const only = process.argv.slice(2)
const browser = await chromium.launch({ args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11'] })

async function save(buf, dir, name, width) {
  const img = sharp(buf).resize({ width, withoutEnlargement: true })
  await img.clone().webp({ quality: 82 }).toFile(`${dir}/${name}.webp`)
  await img.clone().avif({ quality: 55, effort: 5 }).toFile(`${dir}/${name}.avif`)
}

for (const [slug, url] of Object.entries(SITES)) {
  if (only.length && !only.includes(slug)) continue
  const dir = `public/work/${slug}`
  mkdirSync(dir, { recursive: true })
  for (const d of [
    { name: 'desktop', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, out: 1440 },
    { name: 'mobile', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, out: 780 },
  ]) {
    const page = await browser.newPage(d)
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 })
    } catch {
      /* some sites keep a socket open; carry on after the timeout */
    }
    await page.waitForTimeout(6000) // loaders, 3D scenes and intro animations
    await page.addStyleTag({ content: CLEAN }).catch(() => {})
    await page.mouse.move(-10, -10).catch(() => {})
    await page.waitForTimeout(400)
    const buf = await page.screenshot()
    await save(buf, dir, d.name, d.out)
    console.log('saved', `${dir}/${d.name}`)
    await page.close()
  }
}
await browser.close()
