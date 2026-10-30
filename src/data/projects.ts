/**
 * Every project on the site lives here. Facts come from each project's own README and repo.
 * To add a project: add an entry, then run `node scripts/capture-work.mjs <slug>` and
 * `node scripts/capture-previews.mjs <slug>` to make its screenshots and hover preview.
 */

export type Media = {
  /** Path without extension: `.avif` and `.webp` both exist. */
  desktop: string
  mobile: string
  /** Hover preview: `.mp4` and `.webm` both exist. */
  preview: string
}

export type CaseStudy = {
  problem: string[]
  built: string[]
  /** Short steps that explain the architecture diagram. */
  how: { title: string; body: string }[]
  features: { title: string; body: string; image?: string }[]
  hardest: { problem: string; solution: string }
  next: string[]
}

export type Project = {
  slug: string
  name: string
  /** One line for the card. */
  pitch: string
  year: number
  role: string
  /** Exactly three, shown on the card. */
  tags: [string, string, string]
  stack: string[]
  /** The project's own brand colour, and a text colour that reads on it. */
  accent: string
  accentInk: string
  live: string
  repo: string
  media: Media
  /** Filled in for the detail pages. */
  caseStudy?: CaseStudy
}

const media = (slug: string): Media => ({
  desktop: `/work/${slug}/desktop`,
  mobile: `/work/${slug}/mobile`,
  preview: `/work/${slug}/preview`,
})

const ROLE = 'Solo, AI-assisted: product, design, build and deploy'

export const projects: Project[] = [
  {
    slug: 'glassboxapk',
    name: 'GlassBoxAPK',
    pitch: 'Hand your AI coding agent an Android APK and watch how the app works, as an animated, code-linked system design.',
    year: 2026,
    role: ROLE,
    tags: ['AI agents', 'Android', '3D web'],
    stack: ['React', 'Vite', 'TypeScript', 'React Three Fiber', 'GSAP', 'jadx', 'pptxgenjs', 'jsPDF'],
    accent: '#FF5A1E',
    accentInk: '#0B0B0F',
    live: 'https://glassboxapk.vercel.app',
    repo: 'https://github.com/jagdish3135/glassboxapk',
    media: media('glassboxapk'),
  },
  {
    slug: 'lexagent',
    name: 'LexAgent',
    pitch: 'Four AI agents read Indian legal case files, cross-check each other and hand you a PDF brief. Decision support, not a decision.',
    year: 2026,
    role: ROLE,
    tags: ['Multi-agent', 'Legal', 'OCR'],
    stack: ['Next.js', 'TypeScript', 'Mistral, Groq or Gemini', 'Tesseract.js', 'react-pdf', 'Zod', 'React Three Fiber'],
    accent: '#F4F4F2',
    accentInk: '#0B0B0B',
    live: 'https://lexagent-ai.vercel.app',
    repo: 'https://github.com/jagdish3135/lexagent',
    media: media('lexagent'),
  },
  {
    slug: 'knit',
    name: 'Knit',
    pitch: 'A multi-agent software team for your coding agent: it plans, builds, tests, reviews and ships, and you approve each step.',
    year: 2026,
    role: ROLE,
    tags: ['Multi-agent', 'Claude Code', 'Dev tools'],
    stack: ['Claude Code subagents', 'Skills', 'Codex', 'Cursor', 'OpenCode', 'Antigravity', 'GitHub Pages'],
    accent: '#C99200',
    accentInk: '#0B0B0F',
    live: 'https://jagdish3135.github.io/knit/',
    repo: 'https://github.com/jagdish3135/knit',
    media: media('knit'),
  },
  {
    slug: 'jandrishti',
    name: 'JanDrishti',
    pitch: 'One civic complaint portal: every complaint gets a named officer and a deadline, and closes only with a fresh on-site photo.',
    year: 2026,
    role: ROLE,
    tags: ['Civic tech', 'Multilingual', 'Accessibility'],
    stack: ['React', 'Vite', 'TypeScript', 'Leaflet', 'OpenStreetMap', 'exifr', 'Vitest', 'Playwright'],
    accent: '#2163CA',
    accentInk: '#FFFFFF',
    live: 'https://jandrishti-app.vercel.app',
    repo: 'https://github.com/jagdish3135/jandrishti',
    media: media('jandrishti'),
  },
  {
    slug: 'sql-buddy',
    name: 'SQL Buddy',
    pitch: 'Drop in spreadsheets and ask in plain English. It writes the SQL, shows it, runs it in your browser and charts the answer.',
    year: 2026,
    role: ROLE,
    tags: ['AI', 'Data', 'In-browser SQL'],
    stack: ['React', 'Vite', 'TypeScript', 'DuckDB-WASM', 'Claude API', 'Zod', 'Vitest'],
    accent: '#FF48B0',
    accentInk: '#0B0B0F',
    live: 'https://sql-buddy-app.vercel.app',
    repo: 'https://github.com/jagdish3135/sql-buddy',
    media: media('sql-buddy'),
  },
  {
    slug: 'sanjaya',
    name: 'Sanjaya',
    pitch: 'A live 3D globe of earthquakes, satellites and more, built from free open data and narrated in plain sentences. India-first.',
    year: 2026,
    role: ROLE,
    tags: ['Live data', 'Maps', 'India-first'],
    stack: ['Next.js', 'TypeScript', 'MapLibre GL', 'satellite.js', 'Vitest', 'Playwright'],
    accent: '#E9C46A',
    accentInk: '#0B0B0F',
    live: 'https://sanjaya-live.vercel.app',
    repo: 'https://github.com/jagdish3135/sanjaya',
    media: media('sanjaya'),
  },
  {
    slug: 'glim',
    name: 'Glim',
    pitch: 'An open-source MCP server that lets Claude, Cursor and other agents run an Instagram Business or Creator account, safely.',
    year: 2026,
    role: ROLE,
    tags: ['MCP', 'Open source', 'Instagram'],
    stack: ['TypeScript', 'MCP SDK', 'Zod', 'Meta Graph API', 'Vitest'],
    accent: '#E5FC35',
    accentInk: '#07080D',
    live: 'https://glim-mcp.vercel.app',
    repo: 'https://github.com/jagdish3135/glim',
    media: media('glim'),
  },
  {
    slug: 'calculator',
    name: 'Calculator 2.0',
    pitch: 'An animated calculator with a living number background: every key releases its digit into the glass. Built with Knit.',
    year: 2026,
    role: ROLE,
    tags: ['Three.js', 'Motion', 'Keyboard-first'],
    stack: ['TypeScript', 'Vite', 'three.js', 'postprocessing', 'GSAP', 'Vitest', 'Playwright + axe'],
    accent: '#5EEAD4',
    accentInk: '#0B0B0F',
    live: 'https://calculator-2-umber.vercel.app',
    repo: 'https://github.com/jagdish3135/Calculator-2.0',
    media: media('calculator'),
  },
]

/** Smaller work, listed without a card or detail page. */
export const more = [
  {
    name: 'Habit Tracker',
    pitch: 'A small, private habit tracker with streaks and a 30-day history. Runs on your own computer only.',
    stack: ['Next.js', 'Prisma', 'Zod', 'Tailwind'],
    year: 2026,
    note: 'Local only, no live link',
  },
]

export const getProject = (slug: string) => projects.find((p) => p.slug === slug)

export const neighbours = (slug: string) => {
  const i = projects.findIndex((p) => p.slug === slug)
  const n = projects.length
  return { prev: projects[(i - 1 + n) % n], next: projects[(i + 1) % n] }
}

export const pad = (i: number) => String(i + 1).padStart(2, '0')
