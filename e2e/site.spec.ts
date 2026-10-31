import { test, expect, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'

// Slugs and names straight from the data file, so the test follows the site.
const source = readFileSync('src/data/projects.ts', 'utf8')
const projects = [...source.matchAll(/slug: '([^']+)',\s*name: '([^']+)'/g)].map((m) => ({ slug: m[1], name: m[2] }))

async function openHome(page: Page) {
  await page.goto('/')
  await page.locator('[data-loader]').waitFor({ state: 'detached', timeout: 15_000 })
}

test('home loads and the loader hands over to the hero', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await openHome(page)
  await expect(page).toHaveTitle(/Jagdish Patil/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Building')
  await expect(page.locator('[data-logo]')).toBeVisible()
  for (const id of ['about', 'services', 'work', 'toolkit', 'contact']) await expect(page.locator(`#${id}`)).toBeAttached()
  expect(errors).toEqual([])
})

test('the data file has all seven projects', () => {
  expect(projects).toHaveLength(7)
})

for (const p of projects) {
  test(`card opens the ${p.name} case study`, async ({ page, isMobile }) => {
    await openHome(page)
    const card = page.locator(`[data-card="${p.slug}"]`)
    if (isMobile) {
      await card.scrollIntoViewIfNeeded()
      await card.click()
    } else {
      // On desktop only the front panel of the stack takes clicks; the keyboard brings any card forward.
      await card.focus()
      await page.keyboard.press('Enter')
    }
    await expect(page).toHaveURL(new RegExp(`/work/${p.slug}$`))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(p.name)
    await expect(page.getByText('The problem', { exact: true })).toBeVisible()
    await expect(page).toHaveTitle(new RegExp(p.name))
  })
}

test('an unknown project shows a not-found page', async ({ page }) => {
  await page.goto('/work/does-not-exist')
  await expect(page.getByRole('heading', { name: 'Project not found' })).toBeVisible()
})

test('every outside link has a valid URL', async ({ page }) => {
  const hrefs = new Set<string>()
  for (const path of ['/', ...projects.map((p) => `/work/${p.slug}`)]) {
    await page.goto(path)
    await page.locator('[data-loader]').waitFor({ state: 'detached', timeout: 15_000 })
    await page.waitForTimeout(400) // case studies load in their own chunk
    for (const h of await page.locator('a[href]').evaluateAll((as) => as.map((a) => a.getAttribute('href')!))) {
      if (/^(https?:|mailto:)/.test(h)) hrefs.add(h)
    }
  }
  expect(hrefs.size).toBeGreaterThan(10)
  for (const h of hrefs) {
    const url = new URL(h)
    expect(['https:', 'mailto:'], `${h} should be https or mailto`).toContain(url.protocol)
    if (url.protocol === 'mailto:') expect(url.pathname).toMatch(/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i)
    else expect(url.hostname).toMatch(/\./)
  }
})

test('outside links respond', async ({ request, page }) => {
  test.skip(!!process.env.OFFLINE, 'needs the internet')
  await openHome(page)
  const hrefs = await page.locator('a[href^="https://"]').evaluateAll((as) => [...new Set(as.map((a) => (a as HTMLAnchorElement).href))])
  for (const h of hrefs) {
    // LinkedIn answers bots with status 999, so it is only checked for a valid URL above.
    if (h.includes('linkedin.com')) continue
    const res = await request.get(h, { timeout: 30_000, maxRedirects: 5 })
    expect(res.status(), h).toBeLessThan(400)
  }
})

test('reduced motion: still poster instead of WebGL, and no smooth scroll', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  await openHome(page)
  await expect(page.locator('img[src="/hero-poster.webp"]')).toBeVisible()
  await expect(page.locator('canvas')).toHaveCount(0)
  await ctx.close()
})

test('copy email shows a confirmation', async ({ page, context, isMobile }) => {
  test.skip(isMobile, 'clipboard permissions are desktop-only in this setup')
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await openHome(page)
  const button = page.getByRole('button', { name: /copy email/i })
  await button.scrollIntoViewIfNeeded()
  await button.click()
  await expect(page.getByText('Email copied. Paste it anywhere.')).toBeVisible()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('jagdishpatil1341@gmail.com')
})

test('theme toggle switches to light and is remembered', async ({ page }) => {
  await openHome(page)
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'light')
  await page.getByRole('button', { name: 'Switch to light theme' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect(page.getByRole('button', { name: 'Switch to dark theme' })).toBeVisible()
})

test('the particle intro draws the name and dissolves it on scroll', async ({ page }) => {
  await openHome(page)
  const canvas = page.locator('#top canvas')
  await expect(canvas).toBeVisible()
  await page.waitForTimeout(2500)
  const inked = () =>
    canvas.evaluate((c: HTMLCanvasElement) => {
      const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data
      let n = 0
      for (let i = 3; i < d.length; i += 4 * 97) if (d[i] > 0) n++
      return n
    })
  // The name has assembled…
  expect(await inked()).toBeGreaterThan(50)
  // …and by the end of the pin it has parted and faded away.
  const vh = page.viewportSize()!.height
  await page.evaluate((y) => scrollTo(0, y), Math.round(vh * 0.89))
  await expect.poll(inked, { timeout: 5000 }).toBeLessThan(5)
})
