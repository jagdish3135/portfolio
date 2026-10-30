// Runs after `vite build`. Gives every route its own HTML head (title, description, canonical,
// Open Graph and Twitter tags, JSON-LD), so crawlers and link previews see real metadata
// without running JavaScript. Also writes sitemap.xml and robots.txt.
// The site URL comes from src/data/site.ts, or SITE_URL when building.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { projects, site, SITE_URL } from './lib/data.mjs'

const template = readFileSync('dist/index.html', 'utf8')
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

const person = {
  '@type': 'Person',
  '@id': `${SITE_URL}/#person`,
  name: site.name,
  url: SITE_URL,
  jobTitle: 'AI-native builder',
  description: 'Builds AI agents and web apps, AI-assisted, and ships them live. Working toward Forward Deployed Engineering.',
  email: `mailto:${site.email}`,
  address: { '@type': 'PostalAddress', addressLocality: 'Surat', addressRegion: 'Gujarat', addressCountry: 'IN' },
  worksFor: { '@type': 'Organization', name: 'FiadoLabs' },
  knowsAbout: ['AI agents', 'Multi-agent systems', 'Model Context Protocol', 'TypeScript', 'React', 'Next.js', 'three.js'],
  sameAs: [site.links.github, site.links.linkedin],
}

const work = (p) => ({
  '@type': 'CreativeWork',
  '@id': `${SITE_URL}/work/${p.slug}#work`,
  name: p.name,
  headline: p.pitch,
  description: p.summary,
  url: `${SITE_URL}/work/${p.slug}`,
  image: `${SITE_URL}/og/${p.slug}.png`,
  dateCreated: String(p.year),
  keywords: [...p.tags, ...p.stack].join(', '),
  author: { '@id': `${SITE_URL}/#person` },
  sameAs: [p.live, p.repo],
})

function page({ path, title, description, image, graph, type = 'website' }) {
  const url = SITE_URL + path
  const head = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:site_name" content="${esc(site.name)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\u003c')}</script>`,
  ].join('\n    ')
  return template.replace(/<!-- meta:[\s\S]*?<!-- \/meta -->/, head)
}

// Home
writeFileSync(
  'dist/index.html',
  page({
    path: '/',
    title: 'Jagdish Patil — AI-native builder, aspiring Forward Deployed Engineer',
    description:
      'Jagdish Patil builds AI agents and web apps, AI-assisted, and ships them live. An AI-native builder in Surat, India, working toward Forward Deployed Engineering.',
    image: `${SITE_URL}/og/home.png`,
    graph: [
      person,
      { '@type': 'WebSite', '@id': `${SITE_URL}/#site`, url: SITE_URL, name: site.name, author: { '@id': `${SITE_URL}/#person` } },
      ...projects.map(work),
    ],
  }),
)

// One page per project
for (const p of projects) {
  mkdirSync(`dist/work/${p.slug}`, { recursive: true })
  writeFileSync(
    `dist/work/${p.slug}/index.html`,
    page({
      path: `/work/${p.slug}`,
      title: `${p.name}, a case study — ${site.name}`,
      description: p.summary,
      image: `${SITE_URL}/og/${p.slug}.png`,
      type: 'article',
      graph: [person, work(p)],
    }),
  )
}

const today = new Date().toISOString().slice(0, 10)
const urls = ['/', ...projects.map((p) => `/work/${p.slug}`)]
writeFileSync(
  'dist/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${SITE_URL}${u}</loc><lastmod>${today}</lastmod></url>`)
    .join('\n')}\n</urlset>\n`,
)
writeFileSync('dist/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`)
console.log(`prerendered ${urls.length} pages for ${SITE_URL}, plus sitemap.xml and robots.txt`)
