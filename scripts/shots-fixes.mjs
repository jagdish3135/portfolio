// Screenshots for the round of fixes: nav + hero at several sizes and themes, About, Contact, a diagram at 900px.
import { chromium } from 'playwright'
const BASE = process.env.URL ?? 'http://localhost:5220'
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const errors = []
async function open(viewport, path, theme = 'dark', mobile = false) {
  const page = await browser.newPage({ viewport, ...(mobile ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : {}) })
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await page.goto(`${BASE}${path}${path.includes('?') ? '&' : '?'}scene=full&theme=${theme}`, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-loader]', { state: 'detached' })
  await page.addStyleTag({ content: '.grain{display:none!important}' })
  return page
}
async function at(page, sel, offset = 0) {
  const y = await page.evaluate((s) => document.querySelector(s).getBoundingClientRect().top + scrollY, sel)
  for (let v = 0; v < y + offset; v += 400) {
    await page.evaluate((t) => scrollTo(0, t), v)
    await page.waitForTimeout(40)
  }
  await page.evaluate((t) => scrollTo(0, t), y + offset)
  await page.waitForTimeout(2200)
}
for (const [name, vp, theme, mobile] of [
  ['1440-dark', { width: 1440, height: 900 }, 'dark'],
  ['1440-light', { width: 1440, height: 900 }, 'light'],
  ['1280x720', { width: 1280, height: 720 }, 'dark'],
  ['900', { width: 900, height: 760 }, 'dark'],
  ['mobile', { width: 390, height: 844 }, 'dark', true],
]) {
  const p = await open(vp, '/', theme, mobile)
  await at(p, '#hero')
  await p.screenshot({ path: `.shots/fix-hero-${name}.png` })
  if (name === '1440-dark') {
    await at(p, '#about', -60)
    await p.screenshot({ path: '.shots/fix-about.png' })
    await at(p, '#contact', 40)
    await p.screenshot({ path: '.shots/fix-contact.png' })
  }
  await p.close()
}
for (const w of [900, 1100]) {
  const p = await open({ width: w, height: 800 }, '/work/glassboxapk')
  const h = await p.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < h; y += 500) {
    await p.evaluate((t) => scrollTo(0, t), y)
    await p.waitForTimeout(30)
  }
  await at(p, 'svg[role=img]', -120)
  await p.screenshot({ path: `.shots/fix-diagram-${w}.png` })
  await p.close()
}
await browser.close()
console.log(errors.length ? 'ERRORS:\n' + [...new Set(errors)].join('\n') : 'no errors')
