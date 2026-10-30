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

export type DiagramNode = { id: string; label: string; sub?: string; accent?: boolean }

/**
 * Architecture diagram, drawn as inline SVG by <ArchDiagram>.
 * Lanes are columns, left to right; nodes stack inside a lane; edges join nodes.
 * An optional band runs under some lanes for a service they all use.
 */
export type Diagram = {
  lanes: { title: string; nodes: DiagramNode[] }[]
  edges: { from: string; to: string; label?: string; dashed?: boolean }[]
  band?: { label: string; sub?: string; lanes: [number, number] }
}

export type Feature = {
  title: string
  body: string
  /** Path without extension (.avif + .webp). */
  image: string
  alt: string
  /** Wide screenshots span the row; tall ones (phone, PDF page) sit beside the text. */
  shape: 'wide' | 'tall'
  /** Pixel size, for the frame's aspect ratio. Defaults to 16:10. */
  size?: [number, number]
  /** No parallax: for graphics with text near the edges. */
  still?: boolean
}

export type CaseStudy = {
  problem: string[]
  built: string[]
  /** Short list under "What I built". */
  builtList?: string[]
  diagram: Diagram
  /** Numbered steps that explain the diagram. */
  how: { title: string; body: string }[]
  features: Feature[]
  hardest: { problem: string; solution: string[]; code?: { file: string; source: string } }
  next: string[]
  /** For the page's meta description. */
  summary: string
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
    caseStudy: {
      summary:
        'GlassBoxAPK: hand your AI coding agent an Android APK and watch how the app works, as an animated, code-linked system design with PPT and PDF export. A case study by Jagdish Patil.',
      problem: [
        'Understanding how an Android app really works, screen by screen and call by call, means hours in decompiled code. Most people who need that picture (a new developer on the team, a PM, a security reviewer) can’t read smali or obfuscated Java.',
        'AI coding agents can read that code, but left alone they answer in walls of text, invent parts of the app, or paste source code into the answer.',
      ],
      built: [
        'GlassBoxAPK is a repo you add to your AI coding agent. Drop an APK into a folder, say “Analyze apks/your-app.apk”, and the agent decompiles it, traces every flow from an entry point to a goal, and opens an animated system design of the app in your browser.',
        'Each flow plays step by step on the app’s system map, with the class, method or endpoint behind every step. One click exports the whole thing as an editable PowerPoint or a PDF report. There is no server: the APK and the report stay on your machine.',
      ],
      builtList: [
        'An agent playbook (AGENTS.md) that Claude Code, Codex and Cursor follow',
        'A binary XML and DEX parser that scans an APK right in the browser, in a Web Worker',
        'A strict report validator the agent has to pass before anything is shown',
        'A flow player, plus PPT and PDF export, all in the browser',
        'A 3D scroll-story landing page with a Blender-made glass box',
      ],
      diagram: {
        lanes: [
          { title: 'Your machine', nodes: [{ id: 'apk', label: 'APK', sub: 'dropped into apks/' }] },
          {
            title: 'Decompile & scan',
            nodes: [
              { id: 'jadx', label: 'jadx', sub: 'readable code → work/' },
              { id: 'scan', label: 'Scanner', sub: 'manifest · DEX · SDKs' },
            ],
          },
          { title: 'Your AI agent', nodes: [{ id: 'agent', label: 'Trace flows', sub: 'follows AGENTS.md', accent: true }] },
          { title: 'Validate', nodes: [{ id: 'validate', label: 'Validator', sub: 'checks report.json', accent: true }] },
          {
            title: 'Viewer',
            nodes: [
              { id: 'map', label: 'System map', sub: 'auto-reloads' },
              { id: 'player', label: 'Flow player', sub: 'step · speed · keys' },
            ],
          },
          {
            title: 'Export',
            nodes: [
              { id: 'ppt', label: 'PowerPoint', sub: 'editable · notes' },
              { id: 'pdf', label: 'PDF report', sub: 'every flow, numbered' },
            ],
          },
        ],
        edges: [
          { from: 'apk', to: 'jadx' },
          { from: 'apk', to: 'scan' },
          { from: 'jadx', to: 'agent' },
          { from: 'scan', to: 'agent' },
          { from: 'agent', to: 'validate', label: 'report.json' },
          { from: 'validate', to: 'map' },
          { from: 'map', to: 'player' },
          { from: 'player', to: 'ppt' },
          { from: 'player', to: 'pdf' },
        ],
        band: {
          label: 'Everything stays on your machine',
          sub: 'No server · reports hold names and references, never source code',
          lanes: [0, 4],
        },
      },
      how: [
        {
          title: 'Decompile and take stock',
          body: 'jadx turns the APK into readable code. A scanner reads the binary manifest and DEX strings for the stack, SDKs, permissions, entry points, hosts, API paths and size.',
        },
        {
          title: 'The agent traces flows',
          body: 'Following AGENTS.md, the agent walks each flow: screen, ViewModel, repository, endpoint, response, storage writes and error branches. Static steps are marked “inferred”.',
        },
        {
          title: 'Validate before showing',
          body: 'npm run validate-report checks the report against its types. Steps must point at real boxes, no two boxes may overlap, and anything that looks like source code is rejected.',
        },
        {
          title: 'Play the flows',
          body: 'The viewer draws the system map and plays every flow, colour-coded as requests, responses, storage and errors. It reloads by itself when the agent fixes the report.',
        },
        {
          title: 'Export',
          body: 'PowerPoint with real text and shapes and speaker notes, or a PDF with the inventory, the map and every flow as numbered steps. Both are built in the browser.',
        },
      ],
      features: [
        {
          title: 'The system map',
          body: 'Every part of the app as a box on a grid, from screens to APIs and storage, with the stack, SDKs and permissions alongside.',
          image: '/work/glassboxapk/feature-map',
          alt: 'GlassBoxAPK system map of a sample food delivery app',
          shape: 'wide',
        },
        {
          title: 'Flows that play',
          body: 'Happy paths, error paths, background jobs and third-party calls, played step by step with a caption and the code reference behind each step.',
          image: '/work/glassboxapk/feature-flows',
          alt: 'Flow player stepping through a checkout flow on the system map',
          shape: 'wide',
        },
        {
          title: 'Export to PowerPoint and PDF',
          body: 'Editable slides with speaker notes, or a full PDF report, for the people who will never open a terminal.',
          image: '/work/glassboxapk/feature-export',
          alt: 'An exported PowerPoint slide of an app flow',
          shape: 'wide',
          size: [1600, 900],
        },
        {
          title: 'A glass box that opens',
          body: 'The landing page is a scroll story in React Three Fiber with a glass box modelled in Blender. Hover it and the cursor becomes a lens.',
          image: '/work/glassboxapk/feature-landing',
          alt: 'GlassBoxAPK landing page with the 3D glass box',
          shape: 'wide',
        },
      ],
      hardest: {
        problem:
          'An AI agent writing a report freely will invent boxes, draw steps between parts that don’t exist, stack boxes on top of each other, and paste the app’s source code into captions.',
        solution: [
          'So the agent doesn’t get the last word: a validator does. It checks the report against the same types the viewer uses, makes every step point at a real box, refuses two boxes in one grid cell, and keeps captions to one short line.',
          'A pattern catches text that looks like Java, Kotlin or smali and tells the agent to name the class or method instead. The agent loops until the validator exits with 0, and only then does the viewer open.',
        ],
        code: {
          file: 'src/lib/validate.ts',
          source: `const CODE_LIKE = /;\\s*$|;\\s+\\S.*;|\\breturn\\s+\\S|\\b(public|private|protected)\\s+(static\\s+|final\\s+)*\\w+\\s+\\w|=\\s*new\\s+[A-Z]|\\)\\s*\\{|\\bthrow\\s+new\\b|\\binvoke-(virtual|static|direct)\\b|\\bconst-string\\b/;

function checkProse(v: string, p: string, ctx: Ctx, max = MAX_TEXT) {
  if (/[\\r\\n]/.test(v)) ctx.err(p, 'must be one line (no source code or multi-line snippets)');
  else if (v.length > max) ctx.err(p, \`is \${v.length} characters; keep it under \${max} (a reference, not a code excerpt)\`);
  else if (CODE_LIKE.test(v)) ctx.err(p, \`looks like source code (\${show(v)}); name the class, method or file instead\`);
}`,
        },
      },
      next: [
        'Flow diffs between two versions of an app, with new and changed steps highlighted in the animation.',
        'Export flows as Maestro or Appium test scripts.',
        'Deeper support for Flutter and React Native apps, and iOS (IPA) files.',
      ],
    },
  },
  {
    slug: 'lexagent',
    name: 'LexAgent',
    pitch: 'Four AI agents read Indian legal case files, cross-check each other and hand you a PDF brief. Decision support, not a decision.',
    year: 2026,
    role: ROLE,
    tags: ['Multi-agent', 'Legal', 'OCR'],
    stack: ['Next.js', 'TypeScript', 'Mistral, Groq or Gemini', 'Tesseract.js', 'pdf.js', 'react-pdf', 'Zod', 'Vitest'],
    accent: '#F4F4F2',
    accentInk: '#0B0B0B',
    live: 'https://lexagent-ai.vercel.app',
    repo: 'https://github.com/jagdish3135/lexagent',
    media: media('lexagent'),
    caseStudy: {
      summary:
        'LexAgent: four AI agents read Indian legal case files in any Indian language, cross-check each other and hand you a PDF brief. A case study by Jagdish Patil.',
      problem: [
        'India’s courts carry a backlog of crores of cases, and almost every one starts with someone reading a long, dense document. Citizens often can’t follow it at all, and lawyers and judges spend hours on the first read alone.',
        'A plain AI chat doesn’t fix that. One answer can be confidently wrong or invent a citation, it may not know that the BNS replaced the IPC in 2024, and many district-court files are in Marathi or Hindi, often as scans.',
      ],
      built: [
        'LexAgent takes a case file in any Indian language and has four AI agents read it. Two read it independently, a third cross-checks them against the text, and a fourth writes the final brief, which you can download as a PDF.',
        'The answer comes in English, Hindi or Marathi, pitched for a citizen, law student, advocate, judge or researcher. It is decision support, not a decision: it never predicts a verdict, and every page of the report says so.',
      ],
      builtList: [
        'A Next.js app with a streaming analysis API',
        'Text extraction and OCR in the browser, so the file itself is never uploaded',
        'Works with Mistral, Groq or Gemini through one OpenAI-compatible client',
        'An honest demo mode that only answers for the built-in sample cases',
        'Built with Knit, my multi-agent workflow',
      ],
      diagram: {
        lanes: [
          {
            title: 'In your browser',
            nodes: [
              { id: 'upload', label: 'Upload', sub: 'PDF · DOCX · TXT · paste' },
              { id: 'extract', label: 'Extract text', sub: 'pdf.js · mammoth' },
              { id: 'ocr', label: 'OCR fallback', sub: 'Tesseract · mar hin eng' },
            ],
          },
          {
            title: '/api/analyze',
            nodes: [{ id: 'guard', label: 'Guard', sub: 'rate limit · 40k-char cap' }],
          },
          {
            title: 'Read in parallel',
            nodes: [
              { id: 'summarizer', label: 'Summarizer', sub: 'summary · parties · timeline', accent: true },
              { id: 'analyst', label: 'Legal Analyst', sub: 'facts · issues · laws', accent: true },
            ],
          },
          {
            title: 'Cross-check',
            nodes: [{ id: 'verifier', label: 'Cross-Verifier', sub: 'gaps · confidence', accent: true }],
          },
          {
            title: 'Conclude',
            nodes: [{ id: 'chief', label: 'Chief Analyst', sub: 'the final brief', accent: true }],
          },
          {
            title: 'Back in the browser',
            nodes: [
              { id: 'progress', label: 'Live progress', sub: 'NDJSON stream' },
              { id: 'pdf', label: 'PDF report', sub: 'made in the browser' },
            ],
          },
        ],
        edges: [
          { from: 'upload', to: 'extract' },
          { from: 'extract', to: 'ocr', label: 'broken text', dashed: true },
          { from: 'extract', to: 'guard' },
          { from: 'ocr', to: 'guard' },
          { from: 'guard', to: 'summarizer' },
          { from: 'guard', to: 'analyst' },
          { from: 'summarizer', to: 'verifier' },
          { from: 'analyst', to: 'verifier' },
          { from: 'verifier', to: 'chief' },
          { from: 'chief', to: 'progress' },
          { from: 'progress', to: 'pdf' },
        ],
        band: {
          label: 'One LLM client for every agent call',
          sub: 'OpenAI-compatible: Mistral, Groq or Gemini · Zod-checked JSON · polite retries',
          lanes: [2, 4],
        },
      },
      how: [
        {
          title: 'Read the file locally',
          body: 'pdf.js and mammoth pull the text out in the browser. Scanned PDFs, and Hindi or Marathi PDFs with a broken text layer, go through Tesseract OCR instead, and you check the text before it’s sent.',
        },
        {
          title: 'Guard the request',
          body: 'The API route rate-limits by IP, caps the text at 40,000 characters, and without an AI key only answers for the sample cases, so it never shows one case’s analysis for another.',
        },
        {
          title: 'Two independent readings',
          body: 'The Summarizer and the Legal Analyst read the same case at the same time. Each returns strict JSON, and a missing field becomes an empty value instead of failing the whole run.',
        },
        {
          title: 'Cross-check, then conclude',
          body: 'The Cross-Verifier compares both readings with each other and with the text and sets a confidence level. The Chief Analyst writes the brief and drops anything the verifier could not confirm.',
        },
        {
          title: 'Stream and export',
          body: 'Every agent’s status streams back as it finishes, so you watch the work happen. The PDF report is rendered in the browser with real, selectable text.',
        },
      ],
      features: [
        {
          title: 'Four agents, live',
          body: 'The dashboard shows each agent working and finishing in real time. If one fails, the steps that need it are skipped with a clear reason instead of a blank screen.',
          image: '/work/lexagent/feature-agents',
          alt: 'LexAgent dashboard with the four agents marked done and the case summary below',
          shape: 'wide',
        },
        {
          title: 'The law, side by side',
          body: 'Each side’s arguments, the issues for the court, and a table of the Acts and sections that apply, with the new BNS, BNSS and BSA next to the old IPC, CrPC and Evidence Act.',
          image: '/work/lexagent/feature-insights',
          alt: 'Legal insights view listing each side’s points and a table of relevant laws',
          shape: 'wide',
        },
        {
          title: 'A real PDF brief',
          body: 'One click builds a branded report with the LexAgent seal, a confidence stamp, a timeline and a laws table. Hindi and Marathi reports embed a Devanagari font, and the disclaimer is on every page.',
          image: '/work/lexagent/feature-report',
          alt: 'First page of a LexAgent PDF report',
          shape: 'tall',
        },
        {
          title: 'Made for phones too',
          body: 'The full flow works on a phone, in a light or dark theme, from picking a sample case to exporting the report.',
          image: '/work/lexagent/feature-mobile',
          alt: 'LexAgent on a phone in dark mode, with the Analyze Case button and agent cards',
          shape: 'tall',
        },
      ],
      hardest: {
        problem:
          'Many Hindi and Marathi court PDFs look perfect on screen but have a broken text layer. pdf.js pulls out scrambled characters, so the agents would read nonsense and never know it.',
        solution: [
          'I wrote a check for damaged Devanagari. Broken PDFs lose characters in recognisable ways: words split into lone letters or start with a vowel sign, the vowel sign ि disappears, and conjuncts break at the virama.',
          'If any of those signs shows up, or the PDF has no text at all, LexAgent reads the page images with Tesseract OCR in Marathi, Hindi and English, right in the browser, and asks you to check the text before analysing.',
        ],
        code: {
          file: 'src/lib/pdf-text.ts',
          source: `export function looksDamagedDevanagari(text: string): boolean {
  const t = text.normalize("NFC");
  const words = t.match(/[ऀ-ॿ]+/g) ?? [];
  if (words.length < 20) return false;
  const letters = (t.match(/[ऀ-ॿ]/g) ?? []).length;
  const broken = words.filter((w) => /^[ा-्॑-ॗॢॣ]/.test(w) || [...w].length === 1).length;
  const iSigns = (t.match(/ि/g) ?? []).length;
  const splitConjuncts = (t.match(/्(?=\\s)/g) ?? []).length;
  return broken / words.length > 0.3
    || (letters >= 300 && iSigns / letters < 0.006)
    || splitConjuncts / words.length > 0.04;
}`,
        },
      },
      next: [
        'Real accounts and saved case history. Today’s sign-in is a demo.',
        'Chunked reading for long judgments, beyond the 40,000-character cap.',
        'More Indian languages for the interface and the answers.',
      ],
    },
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
    caseStudy: {
      summary:
        'Knit: a multi-agent software team for Claude Code, Codex, Cursor, OpenCode and Antigravity that plans, builds, tests, reviews and ships, at the cost of one normal session. A case study by Jagdish Patil.',
      problem: [
        'A coding agent will happily build whatever you type, but it skips what a real team does: asking what the app is for, planning, cutting what isn’t needed, testing, reviewing and writing docs.',
        'Multi-agent frameworks add that discipline, but every extra agent re-reads the project. My first team-mode run built a habit tracker with 11 agents and cost 2.16 million tokens.',
      ],
      built: [
        'Knit gives your coding agent a whole team’s discipline at the cost of one normal session. One round of clickable questions, a one-page plan you approve, then the build in thin slices, with tests, a review pass, a README and a live deploy at the end.',
        'Every role (Product Manager, Architect, Lean Coder, Designer, Tester, Reviewer and more) is a short checklist your session follows. Team mode turns them into parallel agents when speed matters more than cost, and Knit says up front that it costs more.',
      ],
      builtList: [
        'A Manager skill plus 12 specialist agents and 8 more on call',
        'Works in Claude Code, Codex, Cursor, OpenCode and Antigravity',
        'Knit Board: a live view of the agents at work, with no dependencies',
        'A run log that turns into run and token reports',
        'Optional project docs kept in Notion',
      ],
      diagram: {
        lanes: [
          { title: 'You', nodes: [{ id: 'idea', label: '/knit-build', sub: 'your idea in one line' }] },
          { title: 'Intake', nodes: [{ id: 'intake', label: 'Questions', sub: 'one clickable round' }] },
          {
            title: 'Plan',
            nodes: [
              { id: 'plan', label: 'One-page plan', sub: 'stories · look · tasks', accent: true },
              { id: 'lean', label: 'Lean check', sub: 'cut what isn’t needed' },
            ],
          },
          { title: 'Build', nodes: [{ id: 'build', label: 'Slice by slice', sub: 'after you approve', accent: true }] },
          {
            title: 'Check & ship',
            nodes: [
              { id: 'tests', label: 'Tests + build', sub: 'lint · only where they pay' },
              { id: 'review', label: 'Reviewer pass', sub: 'bugs · security · a11y', accent: true },
              { id: 'deploy', label: 'Live deploy', sub: 'README + badge' },
            ],
          },
          {
            title: 'Every step logged',
            nodes: [
              { id: 'log', label: 'Run log', sub: '.knit/events.jsonl' },
              { id: 'board', label: 'Board + reports', sub: 'live UI · reports' },
            ],
          },
        ],
        edges: [
          { from: 'idea', to: 'intake' },
          { from: 'intake', to: 'plan' },
          { from: 'plan', to: 'lean', label: 'trim', dashed: true },
          { from: 'plan', to: 'build' },
          { from: 'build', to: 'tests' },
          { from: 'tests', to: 'review' },
          { from: 'review', to: 'deploy', label: 'you approve' },
          { from: 'deploy', to: 'log' },
          { from: 'log', to: 'board' },
        ],
        band: {
          label: 'The Manager runs it all in your main session',
          sub: 'Solo: one session wears every hat · Team: specialist agents in parallel',
          lanes: [1, 4],
        },
      },
      how: [
        {
          title: 'Intake',
          body: 'One round of clickable questions: the must-haves, the stack, where it goes live, and solo or team mode.',
        },
        {
          title: 'A plan you approve',
          body: 'One page of stories with acceptance checks, the look, the build and the tasks. The Lean checklist cuts anything that doesn’t need to exist before a line is written.',
        },
        {
          title: 'Build in slices',
          body: 'Thin end-to-end slices of one to four stories, so you see working software early. Your session puts on each role’s hat using short checklists.',
        },
        {
          title: 'Check, then ship',
          body: 'Tests, lint and build, one reviewer pass for bugs, security, accessibility and polish, then a README and a live deploy. Nothing goes live without your OK.',
        },
        {
          title: 'Log everything',
          body: 'The Manager appends every step to a run log. Knit Board shows it live in the browser, and one command turns it into run and token reports.',
        },
      ],
      features: [
        {
          title: 'Knit Board',
          body: 'A live view of a run: each station shows its agents, what they are doing and their tokens, files slide along the thread between agents, and a Watchguard flags anything stuck.',
          image: '/work/knit/feature-board',
          alt: 'Knit Board showing agent stations, the handoff thread and a live feed',
          shape: 'wide',
          size: [1440, 1020],
        },
        {
          title: 'A team you can tell apart',
          body: 'Twelve core roles and eight specialists on call, each with its own shape and colour, its own file, and a model you can change.',
          image: '/work/knit/feature-team',
          alt: 'The Knit team: the Manager, 12 core agents and 8 optional specialists',
          shape: 'wide',
          size: [1600, 867],
          still: true,
        },
        {
          title: 'Same cost as a plain session',
          body: 'On the same calculator app, a plain session used 117,960 tokens and Knit used 124,120, about 5% more, with less code, more checks, a plan, a run log and a README.',
          image: '/work/knit/feature-benchmark',
          alt: 'Benchmark chart comparing a plain session with Knit in tokens',
          shape: 'wide',
          size: [1600, 505],
          still: true,
        },
        {
          title: 'Reports from the run log',
          body: 'Tokens, tool uses and time per agent, plus a run report with the timeline, handoffs, debug loops, review rounds and lessons.',
          image: '/work/knit/feature-tokens',
          alt: 'Token report chart showing each agent’s share of a run',
          shape: 'wide',
          size: [1600, 817],
          still: true,
        },
      ],
      hardest: {
        problem:
          'The first full team run worked: 11 agents built a habit tracker with 197 unit and API tests and 112 of 112 end-to-end checks passing. But it cost 2.16 million tokens, because every agent re-reads the project.',
        solution: [
          'I turned the default around. In solo mode one session wears every hat, using a short checklist per role instead of a separate agent, so the discipline stays and the re-reading goes.',
          'Then I measured it. On the same calculator, a plain session used 117,960 tokens and Knit used 124,120: about 5% more, for a plan, tests, a review, a run log and a README. Team mode is still there when speed matters, and Knit says what it will cost.',
        ],
      },
      next: [
        'Project templates: Next.js + FastAPI, Next.js full-stack and Expo mobile.',
        'Hooks that block edits to .env files and run lint and tests after each agent finishes.',
        'A standalone runner built on the Claude Agent SDK.',
      ],
    },
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
    caseStudy: {
      summary:
        'JanDrishti: one civic complaint portal in English, Hindi and Marathi where every complaint gets a named officer and a deadline, escalates automatically, and closes only with fresh proof. A case study by Jagdish Patil.',
      problem: [
        'When you report a pothole or a broken water pipe, it usually disappears into a department. You don’t know who has it, when it will be fixed, or whether a “resolved” photo was even taken at the site.',
        'And the people who most need these services, including older citizens and first-time smartphone users, often meet portals in one language with small text and official jargon.',
      ],
      built: [
        'JanDrishti (“the people’s eye”) is one dashboard for complaints about any government service. Every complaint gets a named officer and a visible deadline. Miss the deadline and it moves up to that officer’s senior automatically, all the way to the Commissioner.',
        'A case only closes with a live, on-site photo that hasn’t been used before, and every officer has a public score built from their actual work. It runs in English, हिन्दी and मराठी, with large text and plain words for a citizen in their seventies.',
      ],
      builtList: [
        'Escalation engine with deadlines per problem type (1 to 10 days)',
        'Proof checks: live camera, within 150 m, after filing, and a photo fingerprint',
        'Duplicate detection within 150 m, so neighbours can support one report',
        'Officer scores, a public map and a parcel-style tracker',
        'Every string in three languages, with a test that fails if one is missing',
      ],
      diagram: {
        lanes: [
          {
            title: 'Citizen',
            nodes: [
              { id: 'file', label: 'File', sub: 'department · type · pin' },
              { id: 'dup', label: 'Duplicate check', sub: 'same type within 150 m' },
            ],
          },
          {
            title: 'Routing',
            nodes: [
              { id: 'ward', label: 'Ward + officer', sub: 'pin → ward → chain' },
              { id: 'sla', label: 'Deadline', sub: '1–10 days by type', accent: true },
            ],
          },
          {
            title: 'Escalation',
            nodes: [{ id: 'esc', label: 'Missed deadline', sub: 'senior gets half time', accent: true }],
          },
          {
            title: 'Officer',
            nodes: [{ id: 'proof', label: 'Upload proof', sub: 'live camera on site' }],
          },
          {
            title: 'Proof checks',
            nodes: [
              { id: 'geo', label: 'Place + time', sub: '≤ 150 m · after filing' },
              { id: 'dhash', label: 'Photo fingerprint', sub: '64-bit dHash', accent: true },
            ],
          },
          {
            title: 'Public',
            nodes: [
              { id: 'close', label: 'Citizen confirms', sub: 'rates the fix once' },
              { id: 'score', label: 'Officer score', sub: 'public · on the map' },
            ],
          },
        ],
        edges: [
          { from: 'file', to: 'dup', label: 'nearby?', dashed: true },
          { from: 'file', to: 'ward' },
          { from: 'ward', to: 'sla' },
          { from: 'sla', to: 'esc', label: 'passed' },
          { from: 'sla', to: 'proof' },
          { from: 'proof', to: 'geo' },
          { from: 'geo', to: 'dhash' },
          { from: 'dhash', to: 'close', label: 'all pass' },
          { from: 'close', to: 'score' },
        ],
        band: {
          label: 'Every miss and failed proof counts against the officer',
          sub: 'Score: 40% on time · 20% proof first time · 25% ratings · 15% no escalations',
          lanes: [2, 5],
        },
      },
      how: [
        {
          title: 'File in three steps',
          body: 'Pick one of 8 departments, then one of 18 problem types or “Other problem”, drop a pin and add a photo. The pin picks the ward; the department picks the officer chain.',
        },
        {
          title: 'Spot duplicates',
          body: 'If the same type of problem is already open within 150 metres, you’re offered “support this instead”. Supporters raise its priority instead of filing copies.',
        },
        {
          title: 'Deadlines that climb',
          body: 'Each problem type has a fixed time limit, in the spirit of Maharashtra’s Right to Public Services Act. When it passes, the senior officer gets the case with half the original time.',
        },
        {
          title: 'Proof before closing',
          body: 'The officer’s photo must come from the live camera, be taken within 150 m of the site and after filing, and match no earlier proof photo. Failed attempts are logged.',
        },
        {
          title: 'Scores in public',
          body: 'Only the citizen who filed can confirm and rate the fix, once. The officer’s public score updates from on-time fixes, proof, ratings and escalations.',
        },
      ],
      features: [
        {
          title: 'A tracker like a parcel’s',
          body: 'Every complaint shows who has it, what happens next and the deadline in plain words: “Must be fixed by Tue, 28 Oct · 3 days left”. When it moves to a senior officer, it says so.',
          image: '/work/jandrishti/feature-tracker',
          alt: 'A pipeline leakage complaint with a progress tracker, moved to the senior officer',
          shape: 'wide',
        },
        {
          title: 'Old photos don’t close cases',
          body: 'An officer trying last month’s photo gets a clear rejection, and the attempt is logged on their record. Only a live photo taken on site passes every check.',
          image: '/work/jandrishti/feature-proof',
          alt: 'Proof dialog rejecting a photo that was used before, with each check listed',
          shape: 'wide',
          size: [1600, 1125],
        },
        {
          title: 'In Hindi and Marathi too',
          body: 'The whole interface switches between English, हिन्दी and मराठी from the top of every page, including departments, problem types, dates and durations.',
          image: '/work/jandrishti/feature-hindi',
          alt: 'JanDrishti home page in Hindi',
          shape: 'wide',
        },
        {
          title: 'Officers on the record',
          body: 'Each officer has a public profile: complaints fixed, share fixed on time, missed deadlines, rejected proof photos and average rating, rolled into one score.',
          image: '/work/jandrishti/feature-officers',
          alt: 'An officer profile with a score of 69 and their fix record',
          shape: 'wide',
        },
        {
          title: 'Made for every citizen',
          body: 'A−, A and A+ text sizes on every page, 17 px body text, 48 px buttons, every text colour at 4.5:1 contrast or more, and a strong yellow focus ring.',
          image: '/work/jandrishti/feature-mobile',
          alt: 'A pothole complaint tracker on a phone',
          shape: 'tall',
        },
      ],
      hardest: {
        problem:
          'Catching a reused proof photo sounds simple until you remember the honest case: a real after-photo of the same pothole looks a lot like the citizen’s own before-photo of it.',
        solution: [
          'Each photo gets a 64-bit difference hash: shrink it to 9×8 grey pixels and record whether each one is brighter than its neighbour. Re-saved, resized or lightly edited copies keep almost the same bits, so I compare them by how many bits differ.',
          'Earlier proof photos are rejected within 10 of 64 bits. The citizen’s own photo of this complaint gets a much tighter limit of 2, so a genuine after-photo of the same spot passes while a copy of the before-photo doesn’t.',
        ],
        code: {
          file: 'src/lib/dhash.ts',
          source: `export function dhashFromGray(gray: ArrayLike<number>): string {
  if (gray.length !== HASH_W * HASH_H) throw new Error('Expected 9x8 pixels');
  let bits = '';
  for (let y = 0; y < HASH_H; y++) {
    for (let x = 0; x < HASH_W - 1; x++) {
      bits += gray[y * HASH_W + x] > gray[y * HASH_W + x + 1] ? '1' : '0';
    }
  }
  let hex = '';
  for (let i = 0; i < 64; i += 4) hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
  return hex;
}`,
        },
      },
      next: [
        'Voice complaints in Marathi and Hindi.',
        'An AI before-and-after comparison of the proof photo.',
        'Real DigiLocker sign-in, and SMS and WhatsApp alerts.',
      ],
    },
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
    caseStudy: {
      summary:
        'SQL Buddy: drop in spreadsheets and ask in plain English. It writes the SQL, shows it, runs it in your browser with DuckDB-WASM and charts the answer. A case study by Jagdish Patil.',
      problem: [
        'Most people with a spreadsheet full of orders or sales can’t write SQL, and the people who can still spend time on joins and group-bys for simple questions.',
        'Pasting the data into an AI chat means handing over every row, and you get an answer you can’t check, because you never see the query behind it.',
      ],
      built: [
        'SQL Buddy lets you drop in CSV, TSV, JSON or Parquet files and ask in plain English: “Revenue by month”, “Which outlet sold the most chai?”, “Now only UPI”. It writes the SQL, prints it on a receipt beside the answer, runs it and picks a chart.',
        'The data never leaves your tab. DuckDB runs inside the browser, and the AI only sees column names, types and a few example values. You can click the SQL, edit it and run it again.',
      ],
      builtList: [
        'DuckDB-WASM in a Web Worker: each file becomes a table',
        'A serverless /api/ask that uses Claude or any OpenAI-compatible model',
        'A guard that only lets read-only queries on your own tables run',
        'A chart picker driven by the result’s column types',
        'A demo mode with a small built-in translator when no AI key is set',
      ],
      diagram: {
        lanes: [
          {
            title: 'Your browser',
            nodes: [
              { id: 'drop', label: 'Drop files', sub: 'CSV · JSON · Parquet' },
              { id: 'duck', label: 'DuckDB-WASM', sub: 'Web Worker · SUMMARIZE', accent: true },
            ],
          },
          { title: 'Only this travels', nodes: [{ id: 'profile', label: 'Column profiles', sub: 'names · types · samples' }] },
          {
            title: '/api/ask',
            nodes: [
              { id: 'ai', label: 'AI writes SQL', sub: 'Claude · OpenAI-style', accent: true },
              { id: 'json', label: 'Fixed JSON shape', sub: 'sql · title · chart' },
            ],
          },
          { title: 'Guard', nodes: [{ id: 'guard', label: 'Read-only check', sub: 'server and browser', accent: true }] },
          { title: 'Run', nodes: [{ id: 'run', label: 'Run in DuckDB', sub: 'your rows, your tab' }] },
          {
            title: 'Answer',
            nodes: [
              { id: 'chart', label: 'Chart', sub: 'picked from the data' },
              { id: 'receipt', label: 'SQL receipt', sub: 'click, edit, rerun' },
            ],
          },
        ],
        edges: [
          { from: 'drop', to: 'duck' },
          { from: 'duck', to: 'profile' },
          { from: 'profile', to: 'ai' },
          { from: 'ai', to: 'json' },
          { from: 'json', to: 'guard' },
          { from: 'guard', to: 'run', label: 'safe' },
          { from: 'run', to: 'chart' },
          { from: 'chart', to: 'receipt' },
        ],
        band: {
          label: 'If the SQL fails, the error goes back once',
          sub: 'The AI gets its query and the error, and the corrected query runs',
          lanes: [2, 4],
        },
      },
      how: [
        {
          title: 'Load and profile',
          body: 'A dropped file is registered with DuckDB-WASM in a Web Worker and loaded into a table. SUMMARIZE profiles each column, and its columns show up as chips you can click into your question.',
        },
        {
          title: 'Ask the AI for one query',
          body: 'The question and the column profiles go to /api/ask, which asks the AI for a single DuckDB query in a fixed JSON shape. Without a key, a small translator answers simple questions.',
        },
        {
          title: 'Guard it twice',
          body: 'The server and then the browser check that the SQL is one statement that only reads your loaded tables: no writes, no other files, no URLs.',
        },
        {
          title: 'Run and chart',
          body: 'DuckDB runs the query in your tab, and SQL Buddy picks a line, bars, a big number, a scatter or a table from the result’s column types.',
        },
        {
          title: 'Fix itself once',
          body: 'If a query fails, its error goes back to the AI once and the corrected query runs. Follow-up questions build on earlier answers.',
        },
      ],
      features: [
        {
          title: 'Ask, see the SQL, get a chart',
          body: 'Every answer comes with its query on a receipt beside the chart. Click it, change it and run it again, or download the result as CSV.',
          image: '/work/sql-buddy/feature-answers',
          alt: 'SQL Buddy answering “Which outlet sold the most chai?” with a bar chart and its SQL',
          shape: 'wide',
        },
        {
          title: 'Joins across files',
          body: 'Drop two files and ask across them. “Revenue per seat for each city” joins the orders with the outlets and divides by seats.',
          image: '/work/sql-buddy/feature-join',
          alt: 'A joined question across two tables, answered with a bar chart',
          shape: 'wide',
        },
        {
          title: 'Your rows stay home',
          body: 'DuckDB runs inside your browser tab. The AI sees column names, types and a few example values, never your rows.',
          image: '/work/sql-buddy/feature-privacy',
          alt: 'Diagram showing that only column names travel to the AI',
          shape: 'wide',
        },
        {
          title: 'Riso zine, on a phone',
          body: 'A two-colour risograph look in riso blue and fluoro pink on cream, with a database mascot whose eyes follow your cursor. The whole flow works on a phone.',
          image: '/work/sql-buddy/feature-mobile',
          alt: 'SQL Buddy on a phone showing the top 5 items by revenue',
          shape: 'tall',
        },
      ],
      hardest: {
        problem:
          'Running SQL that an AI wrote, directly in someone’s browser, against their own files. One bad query could read files it shouldn’t or pull in a URL.',
        solution: [
          'I wrote one guard and run it twice, on the server and again in the browser before DuckDB sees the query. It blanks out quoted names and strings first, so their contents can’t trip the checks, but keeps any string that looks like a file path or URL.',
          'Then it allows exactly one statement that starts with SELECT, WITH or FROM, which can’t write in DuckDB, and blocks the functions that read other files.',
        ],
        code: {
          file: 'src/lib/guard.ts',
          source: `export function isReadOnly(sql: string): boolean {
  const body = sql
    .trim()
    .replace(/;\\s*$/, "")
    .replace(/"(?:[^"]|"")*"/g, '""')
    .replace(/'(?:[^']|'')*'/g, (m) => (/^'(https?:|s3:|gs:|\\w+:\\/\\/|.*\\.(csv|tsv|parquet|json|txt)'$)/i.test(m) ? "'FILE'" : "''"));
  if (body.includes(";")) return false;
  if (!/^\\(?\\s*(with|select|from)\\b/i.test(body)) return false;
  if (/\\binsert\\s+into\\b|\\bdelete\\s+from\\b|\\bupdate\\s+\\S+\\s+set\\b/i.test(body)) return false;
  return !/\\b(read_\\w+|glob|sniff_csv|parquet_\\w+)\\s*\\(|'FILE'/i.test(body);
}`,
        },
      },
      next: [
        'Excel files (.xlsx), alongside CSV, TSV, JSON and Parquet.',
        'Save a question and its chart as a link you can share, without sharing the data.',
        'A setting to send the AI no example values at all, only column names and types.',
      ],
    },
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
    caseStudy: {
      summary:
        'Sanjaya: a live 3D globe of earthquakes, satellites, disasters, wildfires, weather and undersea cables from free open data, India-first and narrated in plain sentences. A case study by Jagdish Patil.',
      problem: [
        'What is happening on the planet right now (a tremor near the Andamans, a cyclone off Odisha, the ISS overhead) is all public, but it lives on a dozen agency sites with different formats and no shared picture.',
        'Most world dashboards also start from a Western view, and many draw India’s borders wrong.',
      ],
      built: [
        'Sanjaya puts seven live layers on one globe: earthquakes, satellites, day and night, disasters, wildfires, rain and wind, and undersea cables. Each has its own switch and filters, refreshes on its own schedule, and links to its source.',
        'It is India-first: India is drawn with its official boundary as per the Survey of India, 88 ISRO satellites are tracked by name, and the Sanjaya narrates feed describes each event in plain sentences, like the charioteer who narrated the war to a king who could not see it.',
      ],
      builtList: [
        'One small API route per feed, cached in memory and on the CDN',
        'Satellite positions calculated on your device with SGP4',
        'Quakes from USGS and EMSC merged into one list',
        'No database, no sign-in, no tracking and no API keys',
        'A brass sighting dial inspired by the Jantar Mantar instruments',
      ],
      diagram: {
        lanes: [
          {
            title: 'Free open feeds',
            nodes: [
              { id: 'quakes', label: 'USGS + EMSC', sub: 'earthquakes' },
              { id: 'tle', label: 'CelesTrak', sub: 'satellite orbits' },
              { id: 'hazards', label: 'GDACS · FIRMS', sub: 'GIBS · Open-Meteo' },
            ],
          },
          {
            title: 'Next.js routes',
            nodes: [
              { id: 'routes', label: 'Route per feed', sub: 'compact JSON shape', accent: true },
              { id: 'cache', label: 'Cache', sub: 'memory + CDN' },
            ],
          },
          { title: 'Backup', nodes: [{ id: 'snap', label: 'Saved orbits', sub: 'if CelesTrak is busy' }] },
          { title: 'Browser', nodes: [{ id: 'fetch', label: 'Fetch what’s on', sub: 'only visible layers' }] },
          {
            title: 'On your device',
            nodes: [
              { id: 'sgp4', label: 'SGP4 positions', sub: '1,200 per frame', accent: true },
              { id: 'sun', label: 'Sun and night', sub: 'worked out locally' },
            ],
          },
          {
            title: 'Globe',
            nodes: [
              { id: 'globe', label: 'MapLibre globe', sub: 'official India boundary', accent: true },
              { id: 'narrate', label: 'Sanjaya narrates', sub: 'plain-sentence feed' },
            ],
          },
        ],
        edges: [
          { from: 'quakes', to: 'routes' },
          { from: 'tle', to: 'routes' },
          { from: 'hazards', to: 'routes' },
          { from: 'routes', to: 'cache' },
          { from: 'cache', to: 'fetch' },
          { from: 'snap', to: 'fetch', label: 'if busy', dashed: true },
          { from: 'fetch', to: 'sgp4' },
          { from: 'fetch', to: 'sun' },
          { from: 'sgp4', to: 'globe' },
          { from: 'sun', to: 'globe' },
          { from: 'globe', to: 'narrate' },
        ],
        band: {
          label: 'Always current, never blank',
          sub: 'A failed feed keeps its last good data · each satellite card shows its orbit’s age',
          lanes: [1, 4],
        },
      },
      how: [
        {
          title: 'One route per feed',
          body: 'Each feed (/api/earthquakes, /api/satellites, /api/disasters, /api/fires, /api/wind, /api/cables) fetches its source with a timeout and retry, turns it into a compact shape and caches it.',
        },
        {
          title: 'Merge and narrate',
          body: 'USGS and EMSC quakes are treated as one event when they are within 90 seconds, 150 km and one magnitude unit, and USGS details win. Each event becomes a plain sentence in the feed.',
        },
        {
          title: 'Ask only for what’s on',
          body: 'The browser requests a feed only while its layer is switched on, so a first visit loads earthquakes, satellites and day and night, not everything.',
        },
        {
          title: 'Orbits on your device',
          body: 'Satellite positions are calculated in the browser with SGP4 from CelesTrak’s orbit data. If CelesTrak is busy, orbits come from a copy saved at build time.',
        },
        {
          title: 'Draw the globe',
          body: 'MapLibre draws a night-observatory basemap with India’s official boundary and state lines. Click any event, satellite or cable to fly there and open its card.',
        },
      ],
      features: [
        {
          title: 'India-first',
          body: 'The globe spins in to India, drawn with its official boundary, and the narration names the nearest Indian place: “M5.1, 218 km NNW of Bamboo Flat, India, 10 km below the surface.”',
          image: '/work/sanjaya/feature-india',
          alt: 'Sanjaya globe centred on India with an earthquake card open',
          shape: 'wide',
        },
        {
          title: 'Satellites, moving live',
          body: 'Space stations, 88 ISRO satellites, navigation, weather and Starlink move in real time. Click one for its next orbit and how old its orbit data is.',
          image: '/work/sanjaya/feature-iss',
          alt: 'The International Space Station selected on the globe with its ground track',
          shape: 'wide',
        },
        {
          title: 'Disasters and fires',
          body: 'Cyclones, floods, volcanoes and droughts with GDACS alert levels, and every wildfire hotspot NASA saw from orbit in the last 24 hours.',
          image: '/work/sanjaya/feature-hazards',
          alt: 'The globe with disaster alerts and wildfire hotspots switched on',
          shape: 'wide',
        },
        {
          title: 'On a phone',
          body: 'The layer panel and the narration become bottom sheets, and everything calms down when your system asks for reduced motion.',
          image: '/work/sanjaya/feature-mobile',
          alt: 'Sanjaya on a phone with the layers panel open',
          shape: 'tall',
        },
      ],
      hardest: {
        problem:
          'Starlink alone has thousands of satellites. Working out every position with SGP4 on every frame would freeze the page, especially on a phone.',
        solution: [
          'The animation loop works through the satellite list in chunks of 1,200 per frame and picks up where it left off on the next frame. Only after a full pass does it send the new positions to the map, about once a second, or every two seconds when there are more than 3,000.',
          'The ISS and Tiangong are drawn last, on top of the capsules docked to them, so a click picks the station. And if CelesTrak is down, a snapshot of orbits saved at build time keeps the layer working.',
        ],
        code: {
          file: 'src/components/Globe.tsx',
          source: `if (vis.satellites && satList.length) {
  const now = new Date();
  const end = Math.min(satList.length, satIdx + 1200);
  for (; satIdx < end; satIdx++) {
    const s = satList[satIdx];
    const st = satState(s.rec, now);
    satFeatures[satIdx] = st && {
      type: "Feature",
      properties: { id: s.id, group: s.group, short: s.short },
      geometry: { type: "Point", coordinates: [st.lon, st.lat] },
    };
  }
  if (satIdx >= satList.length) {
    satIdx = 0;
    const every = satList.length > 3000 ? 2000 : 1000;
    if (t - lastPush > every) { lastPush = t; /* push to the map */ }
  }
}`,
        },
      },
      next: [
        'Flights, air quality and world events as new layers.',
        'Ships in the Indian Ocean.',
        'Ask in plain English: an AI assistant that flies the map and switches layers for you.',
      ],
    },
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
    caseStudy: {
      summary:
        'Glim: an open-source MCP server that lets Claude, Cursor and other AI agents run an Instagram Business or Creator account, with two-step publishing and a demo mode. A case study by Jagdish Patil.',
      problem: [
        'Small businesses and creators spend real time on Instagram admin: checking last week’s reach, drafting a reel, clearing spam comments and answering DMs.',
        'An AI agent could do much of that, but giving an agent the keys to a public account is risky. One wrong call publishes a post, leaks a token or burns the day’s publishing quota.',
      ],
      built: [
        'Glim is an open-source MCP server with 17 tools that let Claude, Cursor and other agents read insights, publish posts, reels, carousels and stories, manage comments, answer DMs and search hashtags, all through Meta’s official Graph API.',
        'It is built so nothing goes public by accident. Publishing takes two steps with a preview in between, your token never leaves your machine except in a request to Meta, and without a token Glim runs on a fictional bakery account so every tool can be tried safely.',
      ],
      builtList: [
        '17 tools in six groups, each marked read-only, destructive or idempotent',
        'Two-step publishing: a private draft and preview, then publish on a yes',
        'Checks before any call: caption length, hashtag and mention limits, URLs',
        'Errors that explain the fix instead of returning a code',
        'Demo mode, 43 tests and an MIT licence',
      ],
      diagram: {
        lanes: [
          { title: 'Your AI client', nodes: [{ id: 'client', label: 'MCP client', sub: 'Claude · Cursor · others' }] },
          {
            title: 'Glim, on your machine',
            nodes: [
              { id: 'server', label: 'MCP server', sub: '17 tools over stdio' },
              { id: 'checks', label: 'Checks first', sub: 'caption · tags · URLs', accent: true },
            ],
          },
          {
            title: 'Publishing',
            nodes: [
              { id: 'prepare', label: 'ig_prepare_post', sub: 'private draft + preview', accent: true },
              { id: 'publish', label: 'ig_publish_post', sub: 'only after a yes', accent: true },
            ],
          },
          {
            title: 'Graph client',
            nodes: [
              { id: 'graph', label: 'Graph client', sub: 'host from token type' },
              { id: 'errors', label: 'Readable errors', sub: 'says how to fix it' },
            ],
          },
          {
            title: 'Meta, or demo',
            nodes: [
              { id: 'ig', label: 'graph.instagram.com', sub: 'IG… tokens' },
              { id: 'fb', label: 'graph.facebook.com', sub: 'EAA… tokens' },
              { id: 'demo', label: 'Demo mode', sub: 'no token: a fake bakery' },
            ],
          },
        ],
        edges: [
          { from: 'client', to: 'server' },
          { from: 'server', to: 'checks' },
          { from: 'checks', to: 'prepare' },
          { from: 'prepare', to: 'publish', label: 'user says yes' },
          { from: 'checks', to: 'graph' },
          { from: 'publish', to: 'graph' },
          { from: 'graph', to: 'errors' },
          { from: 'graph', to: 'ig' },
          { from: 'graph', to: 'fb' },
          { from: 'graph', to: 'demo', label: 'no token', dashed: true },
        ],
        band: {
          label: 'Your token stays yours',
          sub: 'Read from an env variable · sent only to Meta in a header · never returned · scrubbed from errors',
          lanes: [1, 3],
        },
      },
      how: [
        {
          title: 'Connect your client',
          body: 'Add Glim to Claude Desktop, Claude Code or Cursor as an MCP server. Leave out the token and it starts in demo mode.',
        },
        {
          title: 'Check before calling',
          body: 'Caption length, the 30-hashtag and 20-mention limits, public https:// media URLs and DM byte limits are all checked before anything reaches Instagram.',
        },
        {
          title: 'Publish in two steps',
          body: 'ig_prepare_post uploads a private draft, waits for Instagram to process it and returns a preview. ig_publish_post takes only that draft’s ID, after you confirm.',
        },
        {
          title: 'Talk to the right API',
          body: 'An IG… token goes to graph.instagram.com and an EAA… token to graph.facebook.com. Features only one of them offers, like hashtag search, say so clearly.',
        },
        {
          title: 'Explain every error',
          body: 'Expired token, missing permission, the 24-hour DM window, the publishing quota: each Meta error becomes a sentence that tells the agent and you what to do next.',
        },
      ],
      features: [
        {
          title: 'Real output, safe to try',
          body: 'In demo mode every tool answers from a fictional bakery account, including a full prepare-then-publish round trip, so you can see exactly what an agent would do.',
          image: '/work/glim/feature-output',
          alt: 'Glim tool output in demo mode: profile, insights and a prepared draft post',
          shape: 'wide',
          size: [1600, 1494],
          still: true,
        },
        {
          title: '17 tools, clearly marked',
          body: 'Profile and posts, insights, publishing, comments, direct messages and hashtags. MCP annotations let clients auto-approve reads and ask before writes.',
          image: '/work/glim/feature-tools',
          alt: 'Glim website listing its tool modules',
          shape: 'wide',
        },
        {
          title: 'A site to match',
          body: 'The landing page has a contact-sheet, cyberpunk look with setup tabs for each client, a step-by-step token guide and an FAQ, in light and dark.',
          image: '/work/glim/feature-site',
          alt: 'Glim landing page: “Run your Instagram from any AI chat”',
          shape: 'wide',
        },
        {
          title: 'On a phone',
          body: 'The landing page works on a phone, from the setup command to the token guide.',
          image: '/work/glim/feature-mobile',
          alt: 'Glim landing page on a phone',
          shape: 'tall',
        },
      ],
      hardest: {
        problem:
          'An agent acting on a real, public account will hit Meta’s limits all the time: expired tokens, missing permissions, the 24-hour DM window, quotas. Raw error codes leave it guessing, or retrying something that can never work.',
        solution: [
          'I mapped Meta’s error codes and subcodes to plain sentences that say what to do next, and kept Instagram’s own message at the end for detail. The agent can pass the fix straight to the user instead of looping.',
          'The same care goes into what never happens by accident: publishing is split in two, the publish tool only accepts a draft the user has seen, and the token is scrubbed from any error text before it reaches the agent.',
        ],
        code: {
          file: 'src/graph.ts',
          source: `export function explainGraphError(err: GraphError): string {
  const meta = err.message ? \` Instagram said: "\${err.message}"\` : "";
  const { code, subcode } = err;
  if (code === 190) {
    return "The Instagram access token is invalid or expired. Long-lived tokens last 60 days: create or refresh one in your Meta app and update INSTAGRAM_ACCESS_TOKEN." + meta;
  }
  if (code === 10 && subcode === 2534022) {
    return "This person can't be messaged right now: Instagram only allows replies within 24 hours of their last message. Wait until they message the account again." + meta;
  }
  if (code === 4 || code === 17 || code === 32 || code === 613) {
    return "Instagram rate limit reached. Wait a few minutes before making more requests." + meta;
  }
  if (subcode === 2207042) return "The account has hit its publishing limit for the last 24 hours. Check ig_get_publishing_limit and try later." + meta;
  // …permissions, bad parameters, not found
}`,
        },
      },
      next: [
        'Publish glim-mcp to npm, so the one-line npx setup in the README works for everyone.',
        'Scheduled posts that wait for your approval.',
        'A weekly insights summary the agent can write for you.',
      ],
    },
  },
  {
    slug: 'calculator',
    name: 'Calculator 2.0',
    pitch: 'An animated calculator with a living number background: every key releases its digit into the glass. Built with Knit.',
    year: 2026,
    role: ROLE,
    tags: ['Motion', 'Keyboard-first', 'Accessibility'],
    stack: ['TypeScript', 'Vite', 'Plain CSS', 'No runtime dependencies', 'Vitest', 'Playwright + axe'],
    accent: '#5EEAD4',
    accentInk: '#0B0B0F',
    live: 'https://calculator-2-umber.vercel.app',
    repo: 'https://github.com/jagdish3135/Calculator-2.0',
    media: media('calculator'),
    caseStudy: {
      summary:
        'Calculator 2.0: an animated calculator with a living number background, keyboard support, a history tape and correct calculator rules, built with Knit. A case study by Jagdish Patil.',
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
      next: [
        'A scientific mode with powers, roots and π.',
        'Copy a result with one key.',
        'Install it as an offline app.',
      ],
    },
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
