import type { CaseStudy } from '../projects'

const caseStudy: CaseStudy = {
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
}

export default caseStudy
