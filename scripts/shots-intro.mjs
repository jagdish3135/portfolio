// Intro checkpoint: the particle name assembled, mid-split and fully open, in both themes and sizes.
import { chromium } from 'playwright'
import sharp from 'sharp'
const BASE = process.env.URL ?? 'http://localhost:5220'
const browser = await chromium.launch()
const errors = []
const out = []
for (const theme of ['dark', 'light']) {
  for (const [name, opts] of [
    ['desktop', { viewport: { width: 1440, height: 900 } }],
    ['mobile', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }],
  ]) {
    const page = await browser.newPage(opts)
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
    await page.goto(`${BASE}/?theme=${theme}`, { waitUntil: 'networkidle' })
    await page.waitForSelector('[data-loader]', { state: 'detached' })
    await page.addStyleTag({ content: '.grain{display:none!important}' })
    await page.waitForTimeout(2600)
    const vh = opts.viewport.height
    for (const p of [0, 0.45, 1]) {
      // The pin runs for 130% of the viewport height; the cut finishes at 80% of it.
      await page.evaluate((y) => scrollTo(0, y), Math.round(vh * 1.3 * (0.08 + p * 0.72)))
      await page.waitForTimeout(1300)
      const file = `.shots/intro-${theme}-${name}-${p}.png`
      await page.screenshot({ path: file })
      out.push(file)
    }
    await page.close()
  }
}
await browser.close()
// One sheet per device
for (const name of ['desktop', 'mobile']) {
  const files = out.filter((f) => f.includes(name))
  const w = name === 'desktop' ? 480 : 195
  const tiles = await Promise.all(files.map((f) => sharp(f).resize({ width: w }).toBuffer()))
  const h = (await sharp(tiles[0]).metadata()).height
  await sharp({ create: { width: w * 3 + 20, height: h * 2 + 10, channels: 3, background: '#888' } })
    .composite(tiles.map((t, i) => ({ input: t, left: (i % 3) * (w + 10), top: Math.floor(i / 3) * (h + 10) })))
    .png()
    .toFile(`.shots/intro-sheet-${name}.png`)
}
console.log(errors.length ? 'ERRORS:\n' + [...new Set(errors)].join('\n') : 'no errors')
