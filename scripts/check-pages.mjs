// Opens every project page, scrolls through it, and reports console errors, broken images
// and horizontal overflow. Saves each architecture diagram to .shots/diagram-<slug>.png.
// Usage: node scripts/check-pages.mjs  (dev server on :5220)
import { chromium } from 'playwright'
const BASE = process.env.URL ?? 'http://localhost:5220'
const slugs = ['glassboxapk', 'lexagent', 'knit', 'jandrishti', 'sql-buddy', 'sanjaya', 'glim', 'calculator']
const browser = await chromium.launch()
let problems = 0
for (const [device, opts] of [
  ['desktop', { viewport: { width: 1440, height: 900 } }],
  ['mobile', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }],
]) {
  const page = await browser.newPage(opts)
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('response', (r) => r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`))
  for (const slug of slugs) {
    errors.length = 0
    await page.goto(`${BASE}/work/${slug}`, { waitUntil: 'networkidle' })
    await page.waitForSelector('[role=status]', { state: 'detached', timeout: 15000 }).catch(() => {})
    const h = await page.evaluate(() => document.documentElement.scrollHeight)
    for (let y = 0; y < h; y += 500) {
      await page.evaluate((v) => scrollTo(0, v), y)
      await page.waitForTimeout(40)
    }
    await page.waitForTimeout(800)
    const r = await page.evaluate(() => ({
      title: document.title,
      sections: document.querySelectorAll('article section').length,
      broken: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src),
      overflow: document.documentElement.scrollWidth - innerWidth,
    }))
    if (device === 'desktop') {
      const svg = page.locator('svg[role=img]').first()
      if (await svg.count()) {
        await svg.scrollIntoViewIfNeeded()
        await page.waitForTimeout(1600)
        await svg.screenshot({ path: `.shots/diagram-${slug}.png` })
      }
    }
    const bad = errors.length || r.broken.length || r.overflow > 0
    if (bad) problems++
    console.log(`${bad ? '✗' : '✓'} ${device} ${slug}: ${r.sections} sections, overflow ${r.overflow}px${r.broken.length ? ', broken: ' + r.broken.join(' ') : ''}${errors.length ? '\n   ' + [...new Set(errors)].join('\n   ') : ''}`)
  }
  await page.close()
}
await browser.close()
process.exit(problems ? 1 : 0)
