/** Personal details used across the site. Edit here; nothing else needs to change. */
export const site = {
  /** The live address. Change it here (or set SITE_URL when building) once the domain is final. */
  url: 'https://jagdishpatil.vercel.app',
  name: 'Jagdish Patil',
  email: 'jagdishpatil1341@gmail.com',
  location: 'Surat, Gujarat, India',
  timeZone: 'Asia/Kolkata',
  links: {
    github: 'https://github.com/jagdish3135',
    linkedin: 'https://www.linkedin.com/in/jagdish-patil-708389309/',
  },
  /** Path to a PDF in /public, e.g. '/jagdish-patil-resume.pdf'. Hidden while null. */
  resume: null as string | null,
  /** Portrait for the intro, a path without extension (.avif + .webp), e.g. '/me/portrait'. A monogram shows while null. */
  portrait: null as string | null,
}
