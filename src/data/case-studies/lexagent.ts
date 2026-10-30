import type { CaseStudy } from '../projects'

const caseStudy: CaseStudy = {
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
}

export default caseStudy
