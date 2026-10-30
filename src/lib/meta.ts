const DEFAULT_DESCRIPTION =
  'Jagdish Patil builds AI agents and web apps, AI-assisted, and ships them live. An AI-native builder in Surat, India, working toward Forward Deployed Engineering.'

/** Sets the page title and meta description (the static versions are baked in at build time for crawlers). */
export function setMeta(title: string, description = DEFAULT_DESCRIPTION) {
  document.title = title
  document.querySelector('meta[name="description"]')?.setAttribute('content', description)
}
