import type { CaseStudy } from '../projects'

const caseStudy: CaseStudy = {
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
      {
        title: 'Your AI agent',
        nodes: [{ id: 'agent', label: 'Trace flows', sub: 'follows AGENTS.md', accent: true }],
      },
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
}

export default caseStudy
