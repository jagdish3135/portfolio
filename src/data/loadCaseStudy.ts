import type { CaseStudy } from './projects'

/** Case studies live in ./case-studies/<slug>.ts and load only with their page. */
const caseStudies = import.meta.glob<{ default: CaseStudy }>('./case-studies/*.ts')

export async function loadCaseStudy(slug: string): Promise<CaseStudy | undefined> {
  const load = caseStudies[`./case-studies/${slug}.ts`]
  return load ? (await load()).default : undefined
}
