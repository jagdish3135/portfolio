// Checkpoint (b) screenshots: the pinned work stack, hover, the click flight and the mobile list.
import { chromium } from 'playwright'
const BASE = process.env.URL ?? 'http://localhost:5220'
const browser = await chromium.launch({ args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11'] })
const errors = []
const watch = (page, tag) => {
  page.on('pageerror', (e) => errors.push(`${tag}: ${e.message}`))
  page.on('console', (m) => m.type() === 'error' && errors.push(`${tag}: ${m.text()}`))
}
const hide = '.grain,.skip-link{display:none!important}'

// Desktop
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
watch(page, 'desktop')
await page.goto(BASE, { waitUntil: 'networkidle' })
await page.waitForSelector('[data-loader]', { state: 'detached' })
await page.addStyleTag({ content: hide })
const walk = async (to) => {
  let y = await page.evaluate(() => scrollY)
  const step = to > y ? 300 : -300
  for (; Math.abs(to - y) > 300; y += step) {
    await page.evaluate((v) => scrollTo(0, v), y)
    await page.waitForTimeout(40)
  }
  await page.evaluate((v) => scrollTo(0, v), to)
}
const start = await page.evaluate(() => {
  const el = document.querySelector('.work-stage')
  return el.getBoundingClientRect().top + scrollY
})
const seg = 900 * 0.75
for (const [name, p] of [['0', 0], ['0.5', 0.5], ['1', 1], ['3', 3]]) {
  await walk(start + p * seg)
  await page.waitForTimeout(1600)
  await page.screenshot({ path: `.shots/work-desktop-${name}.png` })
  console.log('saved stack', name)
}
await walk(start - 700)
await page.waitForTimeout(1500)
await page.screenshot({ path: `.shots/work-desktop-intro.png` })
await walk(start + seg)
await page.waitForTimeout(1500)
// Hover the front card: tilt + preview video
const front = page.locator('[data-card="lexagent"]')
const b = await front.boundingBox()
await page.mouse.move(b.x + b.width * 0.7, b.y + b.height * 0.35, { steps: 8 })
await page.waitForTimeout(2500)
const playing = await page.evaluate(() => {
  const v = document.querySelector('[data-card="lexagent"] video')
  return v ? { paused: v.paused, t: v.currentTime.toFixed(2) } : null
})
await page.screenshot({ path: `.shots/work-desktop-hover.png` })
console.log('hover video', JSON.stringify(playing))
// Click → flight
await page.mouse.down()
await page.mouse.up()
await page.waitForTimeout(380)
await page.screenshot({ path: `.shots/flight-mid.png` })
await page.waitForTimeout(1800)
await page.screenshot({ path: `.shots/detail-desktop.png` })
console.log('url after click', page.url())
// Back → returns to the stack
await page.goBack()
await page.waitForTimeout(1800)
console.log('back scrollY', await page.evaluate(() => Math.round(scrollY)), 'expected about', Math.round(start + seg))
await page.close()

// Mobile
const m = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
watch(m, 'mobile')
await m.goto(BASE, { waitUntil: 'networkidle' })
await m.waitForSelector('[data-loader]', { state: 'detached' })
await m.addStyleTag({ content: hide })
const top = await m.evaluate(() => document.getElementById('work').getBoundingClientRect().top + scrollY)
const bottom = await m.evaluate(() => document.getElementById('work').getBoundingClientRect().bottom + scrollY)
for (let y = 0; y < bottom; y += 400) {
  await m.evaluate((v) => scrollTo(0, v), y)
  await m.waitForTimeout(60)
}
await m.evaluate((v) => scrollTo(0, v), top)
await m.waitForTimeout(1500)
await m.addStyleTag({ content: 'header{visibility:hidden!important}' })
await m.locator('#work').screenshot({ path: '.shots/work-mobile.png' })
console.log('saved mobile list')
await m.close()
await browser.close()
if (errors.length) console.log('ERRORS:\n' + [...new Set(errors)].join('\n'))
