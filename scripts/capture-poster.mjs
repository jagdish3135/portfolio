// Renders the hero's 3D scene in a real browser and saves stills:
//   public/hero-poster.webp  — shown instead of WebGL on low-end devices and with reduced motion
//   public/og.png            — the Open Graph share image
// Usage: start the dev server (npm run dev), then: node scripts/capture-poster.mjs
import { chromium } from 'playwright'

const URL = process.env.URL ?? 'http://localhost:5220/?scene=full'
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })

async function shot(width, height, file, opts = {}) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 })
  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-loader]', { state: 'detached', timeout: 15000 })
  await page.waitForTimeout(2500) // let the layers settle apart
  if (opts.sceneOnly) {
    // Poster: the canvas alone, without the page copy on top.
    const data = await page.evaluate(() => document.querySelector('canvas').toDataURL('image/webp', 0.86))
    const fs = await import('node:fs')
    fs.writeFileSync(file, Buffer.from(data.split(',')[1], 'base64'))
  } else {
    await page.addStyleTag({ content: '.grain,.cursor-pos{display:none!important}' })
    await page.screenshot({ path: file })
  }
  await page.close()
  console.log('saved', file)
}

await shot(1600, 1000, 'public/hero-poster.webp', { sceneOnly: true })
await shot(1200, 630, 'public/og.png')
await browser.close()
