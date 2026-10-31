// Share images (1200x630) for the home page and every project page → public/og/<name>.png
// Usage: node scripts/og.mjs
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { projects, site, SITE_URL } from './lib/data.mjs'

const file = (p) => pathToFileURL(resolve(p)).href
const host = SITE_URL.replace(/^https?:\/\//, '')
const inter = file('node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')

const page = (body, accent = '#c6ff3d') => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Clash;src:url(${file('public/fonts/clash-display-500.woff2')});font-weight:500}
@font-face{font-family:Clash;src:url(${file('public/fonts/clash-display-600.woff2')});font-weight:600}
@font-face{font-family:Inter;src:url(${inter});font-weight:100 900}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;background:#0b0b0f;color:#ededed;font-family:Inter;position:relative}
.glow{position:absolute;inset:0;background:radial-gradient(60% 70% at 78% 45%,#1a1a21 0%,#0b0b0f 70%)}
.left{position:absolute;left:72px;top:64px;bottom:60px;width:560px;display:flex;flex-direction:column}
.label{font-size:15px;letter-spacing:.1em;text-transform:uppercase;color:#8e8e97;display:flex;gap:14px;align-items:center;font-weight:500}
.logo{font-family:Clash;font-weight:600;font-size:26px;color:#ededed;letter-spacing:-.02em;text-transform:none}
.dot{width:8px;height:8px;border-radius:50%;background:${accent}}
h1{font-family:Clash;font-weight:500;letter-spacing:-.03em;line-height:.92;margin-top:auto}
p.pitch{margin-top:22px;font-size:23px;line-height:1.4;color:#a3a3ab}
.foot{margin-top:28px;font-size:16px;color:#8e8e97;display:flex;justify-content:space-between}
.foot b{color:#ededed;font-weight:600}
.stage{position:absolute;right:-40px;top:70px;width:600px;height:490px;perspective:1400px}
.panel{position:absolute;inset:0;border-radius:30px;padding:22px;background:${accent};transform:rotateY(-16deg) rotateX(6deg) rotateZ(-2deg);box-shadow:0 60px 90px -40px #000}
.panel img{width:100%;height:100%;object-fit:cover;object-position:top;border-radius:14px;display:block}
.ghost{position:absolute;inset:0;border-radius:30px;border:1px solid rgb(237 237 237/.18);background:rgb(255 255 255/.03);transform:rotateY(-16deg) rotateX(6deg) rotateZ(-2deg) translateZ(-120px) translateY(-28px)}
.lime{color:#c6ff3d}
</style></head><body><div class="glow"></div>${body}</body></html>`

const cards = [
  {
    name: 'home',
    html: page(`
      <div class="stage"><div class="ghost"></div><div class="panel" style="background:transparent;padding:0;border:1px solid rgb(237 237 237/.2)"><img src="${file('public/hero-poster.webp')}" style="object-position:72% 30%;transform:scale(1.35)"></div></div>
      <div class="left" style="width:720px">
        <div class="label"><span class="logo">JP</span>${site.name} · ${site.location.split(',')[0]}, India</div>
        <h1 style="font-size:76px">Building <span class="lime">AI</span> solutions. Custom setups, shipped live.</h1>
        <p class="pitch" style="font-size:21px">AI-native builder and aspiring Forward Deployed Engineer.</p>
        <div class="foot"><span><b>${projects.length} projects</b>, live and public on GitHub</span><span>${host}</span></div>
      </div>`),
  },
  ...projects.map((p, i) => ({
    name: p.slug,
    html: page(
      `<div class="stage"><div class="ghost"></div><div class="panel"><img src="${file(`public/work/${p.slug}/desktop.webp`)}"></div></div>
      <div class="left">
        <div class="label"><span class="logo">JP</span><span class="dot"></span>Case study ${String(i + 1).padStart(2, '0')}</div>
        <h1 style="font-size:${p.name.length > 11 ? 82 : 104}px">${p.name}</h1>
        <p class="pitch">${p.pitch}</p>
        <div class="foot"><span>by <b>${site.name}</b></span><span>${host}/work/${p.slug}</span></div>
      </div>`,
      p.accent,
    ),
  })),
]

mkdirSync('public/og', { recursive: true })
mkdirSync('.shots/og-tmp', { recursive: true })
const browser = await chromium.launch()
const tab = await browser.newPage({ viewport: { width: 1200, height: 630 } })
for (const c of cards) {
  const tmp = resolve(`.shots/og-tmp/${c.name}.html`)
  writeFileSync(tmp, c.html)
  await tab.goto(pathToFileURL(tmp).href, { waitUntil: 'load' })
  await tab.evaluate(() => document.fonts.ready)
  await tab.screenshot({ path: `public/og/${c.name}.png` })
  console.log('saved public/og/' + c.name + '.png')
}
await browser.close()
