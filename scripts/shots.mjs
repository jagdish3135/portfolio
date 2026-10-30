// Checkpoint screenshots: desktop (1440x900) and mobile (390x844) of the given section ids.
// Usage: node scripts/shots.mjs [path] top about services ...   → .shots/<id>-<device>.png
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const args = process.argv.slice(2)
const path = args[0]?.startsWith('/') ? args.shift() : '/'
const ids = args.length ? args : ['top']
const BASE = process.env.URL ?? 'http://localhost:5220'
mkdirSync('.shots', { recursive: true })

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const devices = [
  { name: 'desktop', viewport: { width: 1440, height: 900 } },
  { name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
]
const errors = []
for (const d of devices) {
  const page = await browser.newPage(d)
  page.on('pageerror', (e) => errors.push(`${d.name}: ${e.message}`))
  page.on('console', (m) => m.type() === 'error' && errors.push(`${d.name}: ${m.text()}`))
  await page.goto(BASE + path + (path.includes('?') ? '&' : '?') + 'scene=full', { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-loader]', { state: 'detached', timeout: 15000 }).catch(() => {})
  await page.addStyleTag({ content: '.grain,.skip-link{display:none!important}' })
  for (const id of ids) {
    // Walk down to the section so every scroll-triggered reveal on the way fires.
    const top = await page.evaluate((id) => {
      const el = document.getElementById(id)
      return el ? el.getBoundingClientRect().top + window.scrollY : 0
    }, id)
    for (let y = await page.evaluate(() => window.scrollY); y < top; y += 400) {
      await page.evaluate((y) => window.scrollTo(0, y), y)
      await page.waitForTimeout(60)
    }
    // ...and through it, so reveals near its bottom fire too.
    const bottom = await page.evaluate((id) => {
      const el = document.getElementById(id)
      return el ? el.getBoundingClientRect().bottom + window.scrollY : 0
    }, id)
    for (let y = top; y < bottom; y += 300) {
      await page.evaluate((y) => window.scrollTo(0, y), y)
      await page.waitForTimeout(80)
    }
    await page.evaluate((y) => window.scrollTo(0, y), top)
    await page.waitForTimeout(1800)
    // Section shots: hide the fixed nav so it doesn't float over the stitched image.
    if (id !== 'top') await page.addStyleTag({ content: 'header{visibility:hidden!important}' })
    const el = await page.$(`#${id}`)
    const file = `.shots/${id}-${d.name}.png`
    if (el) await el.screenshot({ path: file })
    else await page.screenshot({ path: file })
    console.log('saved', file)
  }
  await page.close()
}
await browser.close()
if (errors.length) console.log('ERRORS:\n' + errors.join('\n'))
