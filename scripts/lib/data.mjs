// Loads the site's TypeScript data files (projects, site) in Node, for the build scripts.
import ts from 'typescript'
import { readFileSync } from 'node:fs'

async function load(file) {
  const out = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText
  return import('data:text/javascript;base64,' + Buffer.from(out).toString('base64'))
}

export const { projects } = await load('src/data/projects.ts')
export const { site } = await load('src/data/site.ts')
export const SITE_URL = (process.env.SITE_URL ?? site.url).replace(/\/$/, '')
