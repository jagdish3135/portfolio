/**
 * The tools I actually use, grouped. `usedIn` lists where: project slugs from projects.ts,
 * 'site' for this portfolio, or 'fiadolabs' for my part-time work. Each comes from the
 * project's committed package.json or files.
 */
export type ToolGroup = { title: string; note: string; tools: { name: string; usedIn: string[] }[] }

export const toolkit: ToolGroup[] = [
  {
    title: 'Languages',
    note: 'TypeScript first, everywhere',
    tools: [
      { name: 'TypeScript', usedIn: ['glassboxapk', 'lexagent', 'jandrishti', 'sql-buddy', 'sanjaya', 'glim', 'site'] },
      { name: 'JavaScript', usedIn: ['knit'] },
      { name: 'SQL', usedIn: ['sql-buddy'] },
      { name: 'Python', usedIn: ['glassboxapk'] },
      { name: 'HTML & CSS', usedIn: ['knit', 'glim', 'site'] },
    ],
  },
  {
    title: 'Frameworks & data',
    note: 'Whatever ships fastest and stays small',
    tools: [
      { name: 'React', usedIn: ['glassboxapk', 'lexagent', 'jandrishti', 'sql-buddy', 'sanjaya', 'site'] },
      { name: 'Next.js', usedIn: ['lexagent', 'sanjaya', 'habit-tracker'] },
      { name: 'Vite', usedIn: ['glassboxapk', 'jandrishti', 'sql-buddy', 'site'] },
      { name: 'Tailwind CSS', usedIn: ['habit-tracker', 'site'] },
      { name: 'Zod', usedIn: ['lexagent', 'sql-buddy', 'glim'] },
      { name: 'DuckDB-WASM', usedIn: ['sql-buddy'] },
      { name: 'MapLibre', usedIn: ['sanjaya'] },
      { name: 'Leaflet', usedIn: ['jandrishti'] },
      { name: 'Prisma', usedIn: ['habit-tracker'] },
    ],
  },
  {
    title: 'AI',
    note: 'Building with it, and building on it',
    tools: [
      { name: 'Claude Code', usedIn: ['knit', 'glassboxapk', 'glim', 'site'] },
      { name: 'Claude API', usedIn: ['sql-buddy'] },
      { name: 'MCP', usedIn: ['glim'] },
      { name: 'Mistral', usedIn: ['lexagent', 'sql-buddy'] },
      { name: 'Groq', usedIn: ['lexagent'] },
      { name: 'Gemini', usedIn: ['lexagent'] },
      { name: 'Cursor', usedIn: ['knit', 'glassboxapk', 'glim'] },
      { name: 'Codex', usedIn: ['knit', 'glassboxapk'] },
      { name: 'Tesseract OCR', usedIn: ['lexagent'] },
    ],
  },
  {
    title: '3D & motion',
    note: 'Motion that respects reduced-motion settings',
    tools: [
      { name: 'three.js', usedIn: ['glassboxapk', 'site'] },
      { name: 'React Three Fiber', usedIn: ['glassboxapk', 'site'] },
      { name: 'GSAP', usedIn: ['glassboxapk', 'site'] },
      { name: 'Lenis', usedIn: ['glassboxapk', 'site'] },
      { name: 'Framer Motion', usedIn: ['site'] },
      { name: 'Blender', usedIn: ['glassboxapk'] },
    ],
  },
  {
    title: 'Design',
    note: 'Where most of my day job lives',
    tools: [
      { name: 'Figma', usedIn: ['fiadolabs'] },
      { name: 'Framer', usedIn: ['fiadolabs'] },
      { name: 'Wix', usedIn: ['fiadolabs'] },
    ],
  },
  {
    title: 'Test & deploy',
    note: 'Nothing is done until it’s live',
    tools: [
      { name: 'Playwright', usedIn: ['glassboxapk', 'lexagent', 'jandrishti', 'sql-buddy', 'sanjaya', 'glim', 'site'] },
      { name: 'Vitest', usedIn: ['lexagent', 'jandrishti', 'sql-buddy', 'sanjaya', 'glim'] },
      { name: 'axe', usedIn: ['habit-tracker'] },
      { name: 'Vercel', usedIn: ['glassboxapk', 'lexagent', 'jandrishti', 'sql-buddy', 'sanjaya', 'glim', 'site'] },
      { name: 'GitHub Pages', usedIn: ['knit'] },
      { name: 'GitHub Actions', usedIn: ['knit'] },
    ],
  },
]

/** Display names for the places a tool is used. */
export const usedInLabel: Record<string, string> = {
  site: 'This site',
  fiadolabs: 'FiadoLabs',
  'habit-tracker': 'Habit Tracker',
}
