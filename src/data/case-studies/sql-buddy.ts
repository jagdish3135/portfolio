import type { CaseStudy } from '../projects'

const caseStudy: CaseStudy = {
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
      {
        title: 'Only this travels',
        nodes: [{ id: 'profile', label: 'Column profiles', sub: 'names · types · samples' }],
      },
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
}

export default caseStudy
