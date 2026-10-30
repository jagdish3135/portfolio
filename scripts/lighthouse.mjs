// Lighthouse scores for the production build. Start it first: npm run build && npx vite preview --port 4173
// Usage: node scripts/lighthouse.mjs [desktop|mobile] [path ...]   → .shots/lh/<form>-<page>.json
import { chromium } from 'playwright'
import lighthouse from 'lighthouse'
import desktopConfig from 'lighthouse/core/config/desktop-config.js'
import { mkdirSync, writeFileSync } from 'node:fs'

const BASE = process.env.URL ?? 'http://localhost:4173'
const [form = 'desktop', ...paths] = process.argv.slice(2)
const pages = paths.length ? paths : ['/', '/work/lexagent']
const port = 9333
mkdirSync('.shots/lh', { recursive: true })

const browser = await chromium.launch({ args: [`--remote-debugging-port=${port}`] })
const rows = []
for (const path of pages) {
  const result = await lighthouse(
    BASE + path,
    { port, output: 'json', logLevel: 'error' },
    form === 'desktop' ? desktopConfig : undefined,
  )
  const { categories: c, audits: a } = result.lhr
  const name = path === '/' ? 'home' : path.split('/').pop()
  writeFileSync(`.shots/lh/${form}-${name}.json`, result.report)
  rows.push(
    `${form.padEnd(7)} ${name.padEnd(12)} perf ${Math.round(c.performance.score * 100)} · a11y ${Math.round(c.accessibility.score * 100)} · best ${Math.round(c['best-practices'].score * 100)} · seo ${Math.round(c.seo.score * 100)}  |  FCP ${a['first-contentful-paint'].displayValue} · LCP ${a['largest-contentful-paint'].displayValue} · TBT ${a['total-blocking-time'].displayValue} · CLS ${a['cumulative-layout-shift'].displayValue}`,
  )
}
await browser.close()
console.log(rows.join('\n'))
