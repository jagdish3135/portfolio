import type { CaseStudy } from '../projects'

const caseStudy: CaseStudy = {
  problem: [
    'A calculator is the classic first project, which is exactly why I rebuilt mine: to see how far a small, familiar app can go when it is treated like a real product.',
    'That means calculator rules people expect (2 + 3 × 4 = 14, 0.1 + 0.2 = 0.3), full keyboard use, accessibility checks, and motion that feels alive without slowing anything down.',
  ],
  built: [
    'Calculator 2.0 has a living number background: digits and maths symbols rise behind the glass panel in three depth layers, every key you press releases its digit into the background, and every result sends out a ripple of numbers.',
    'Underneath is a careful engine with standard precedence, percent, clear errors like “Can’t divide by 0” and results rounded to 12 significant digits, plus a history tape and a light and dark theme. It has no runtime dependencies, and I built it with Knit.',
  ],
  builtList: [
    'A pure calculator engine with unit tests',
    'Keyboard support for every key, including Enter, Backspace and Escape',
    'A history tape of the last 50 calculations, saved in your browser',
    'End-to-end tests with axe accessibility checks',
    'A strict Content-Security-Policy in production',
  ],
  diagram: {
    lanes: [
      {
        title: 'Input',
        nodes: [
          { id: 'keys', label: 'Keypad', sub: 'keys spring on press' },
          { id: 'kbd', label: 'Keyboard', sub: '0–9 . + − × ÷ % Enter' },
        ],
      },
      {
        title: 'Engine',
        nodes: [
          { id: 'press', label: 'press(state, key)', sub: 'pure function', accent: true },
          { id: 'rules', label: 'Calculator rules', sub: 'precedence · % · 12 digits' },
        ],
      },
      {
        title: 'Screen',
        nodes: [
          { id: 'display', label: 'Display', sub: 'slide · roll · shake' },
          { id: 'history', label: 'History tape', sub: 'last 50 · localStorage' },
        ],
      },
      {
        title: 'Background',
        nodes: [
          { id: 'glyphs', label: 'Number rain', sub: 'three depth layers', accent: true },
          { id: 'sparks', label: 'Bursts + ripples', sub: 'at most 24 at once' },
        ],
      },
    ],
    edges: [
      { from: 'keys', to: 'press' },
      { from: 'kbd', to: 'press' },
      { from: 'press', to: 'rules' },
      { from: 'press', to: 'display' },
      { from: 'display', to: 'history' },
      { from: 'display', to: 'sparks', label: 'key or result' },
      { from: 'glyphs', to: 'sparks' },
    ],
    band: {
      label: 'Motion that never costs speed',
      sub: 'CSS animates transform and opacity only · paused when hidden · still with reduced motion',
      lanes: [2, 3],
    },
  },
  how: [
    {
      title: 'One pure function',
      body: 'Every key goes through press(state, key), which returns the next state. That keeps the calculator rules easy to unit-test, with no screen involved.',
    },
    {
      title: 'Rules people expect',
      body: 'Standard precedence, percent that works like a pocket calculator (50 + 10% = 55), clear error messages, and results rounded to 12 significant digits, so 0.1 + 0.2 shows 0.3.',
    },
    {
      title: 'Screen and history',
      body: 'Digits slide in, results roll in and errors shake. Each result goes on a history tape saved in your browser; click one to reuse it.',
    },
    {
      title: 'A background that reacts',
      body: 'JavaScript only sets a few CSS custom properties on each glyph. CSS does the animating, so key bursts and result ripples stay smooth.',
    },
    {
      title: 'Tested like a product',
      body: 'Unit tests for the engine and history, Playwright end-to-end tests with axe accessibility checks, and security headers that match between preview and production.',
    },
  ],
  features: [
    {
      title: 'History you can reuse',
      body: 'Your last 50 calculations stay on a tape beside the keypad. Click any line to reuse its result.',
      image: '/work/calculator/feature-history',
      alt: 'Calculator 2.0 showing 2 + 3 × 4 = 14 with a history tape of earlier results',
      shape: 'wide',
    },
    {
      title: 'Light and dark, with clear errors',
      body: 'It follows your system theme until you pick one, then remembers. Errors say what happened, in words.',
      image: '/work/calculator/feature-dark',
      alt: 'Calculator 2.0 in dark mode showing “Can’t divide by 0”',
      shape: 'wide',
    },
    {
      title: 'On a phone',
      body: 'The keypad, history and background all fit a phone, with a Motion button to pause the background.',
      image: '/work/calculator/mobile',
      alt: 'Calculator 2.0 on a phone',
      shape: 'tall',
    },
  ],
  hardest: {
    problem:
      'A background full of moving numbers can easily make the calculator itself feel slow, drain a laptop battery, or bother people who are sensitive to motion.',
    solution: [
      'I kept all the animation in CSS on transform and opacity only, with JavaScript just setting a few numbers per glyph. Reactive sparks are capped at 24 alive at once and remove themselves when their animation ends.',
      'The background pauses when the tab is hidden, has its own Motion button, and stays still when your system asks for reduced motion.',
    ],
    code: {
      file: 'src/background.ts',
      source: `const sync = () => bg.toggleAttribute('data-paused', document.hidden);
document.addEventListener('visibilitychange', sync);
sync();

let live = 0;
const spark = (glyph: string, x: number, y: number, props: Record<string, string>, ring = false) => {
  if (reduced.matches || bg.hasAttribute('data-user-paused') || live >= MAX_SPARKS) return;
  const s = document.createElement('span');
  s.className = ring ? 'spark ring' : 'spark';
  s.textContent = glyph;
  set(s, { '--sx': \`\${x.toFixed(0)}px\`, '--sy': \`\${y.toFixed(0)}px\`, ...props });
  live++;
  s.addEventListener('animationend', () => (s.remove(), live--), { once: true });
  bg.append(s);
};`,
    },
  },
  next: ['A scientific mode with powers, roots and π.', 'Copy a result with one key.', 'Install it as an offline app.'],
}

export default caseStudy
