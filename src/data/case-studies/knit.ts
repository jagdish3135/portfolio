import type { CaseStudy } from '../projects'

const caseStudy: CaseStudy = {
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
}

export default caseStudy
