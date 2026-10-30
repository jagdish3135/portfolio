import type { CaseStudy } from '../projects'

const caseStudy: CaseStudy = {
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
}

export default caseStudy
