// Checkpoint (c) screenshots: a full detail page (desktop + mobile), the next-project hover preview,
// the lightbox and the panel wipe. Usage: node scripts/shots-detail.mjs [slug]
import { chromium } from 'playwright'
const BASE = process.env.URL ?? 'http://localhost:5220'
const slug = process.argv[2] ?? 'lexagent'
const browser = await chromium.launch()
const errors = []
const hide = '.grain,.skip-link{display:none!important}'

async function open(page) {
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await page.goto(`${BASE}/work/${slug}`, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-loader]', { state: 'detached' })
  await page.addStyleTag({ content: hide })
  const h = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < h; y += 350) {
    await page.evaluate((v) => scrollTo(0, v), y)
    await page.waitForTimeout(70)
  }
  await page.waitForTimeout(1500)
}

const d = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await open(d)
await d.evaluate(() => scrollTo(0, 0))
await d.waitForTimeout(600)
await d.addStyleTag({ content: 'header.fixed{visibility:hidden!important}' })
await d.screenshot({ path: `.shots/detail-${slug}-desktop-full.png`, fullPage: true })
console.log('saved desktop full')
await d.addStyleTag({ content: 'header.fixed{visibility:visible!important}' })

// Next-project hover preview
const next = d.locator('nav[aria-label="More projects"] a').last()
await next.scrollIntoViewIfNeeded()
await d.waitForTimeout(800)
const b = await next.boundingBox()
await d.mouse.move(b.x + b.width * 0.55, b.y + b.height * 0.45, { steps: 10 })
await d.waitForTimeout(1200)
await d.screenshot({ path: `.shots/detail-${slug}-next-hover.png` })
console.log('saved next hover')

// Panel wipe, mid-way
await d.mouse.down()
await d.mouse.up()
await d.waitForTimeout(260)
await d.screenshot({ path: `.shots/detail-${slug}-wipe.png` })
await d.waitForTimeout(1200)
console.log('after next click:', d.url())

// Lightbox
await d.goto(`${BASE}/work/${slug}`)
await d.waitForSelector('[data-loader]', { state: 'detached' })
const zoom = d.locator('button[aria-label^="Show full size"]').first()
await zoom.scrollIntoViewIfNeeded()
await d.waitForTimeout(800)
await zoom.click()
await d.waitForTimeout(900)
await d.screenshot({ path: `.shots/detail-${slug}-lightbox.png` })
await d.keyboard.press('Escape')
await d.waitForTimeout(300)
console.log('lightbox closed:', await d.evaluate(() => !document.querySelector('dialog[open]')))
await d.close()

const m = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
await open(m)
await m.evaluate(() => scrollTo(0, 0))
await m.waitForTimeout(600)
await m.addStyleTag({ content: 'header.fixed{visibility:hidden!important}' })
await m.screenshot({ path: `.shots/detail-${slug}-mobile-full.png`, fullPage: true })
console.log('saved mobile full')
await browser.close()
if (errors.length) console.log('ERRORS:\n' + [...new Set(errors)].join('\n'))
