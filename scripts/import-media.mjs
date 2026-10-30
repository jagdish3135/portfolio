// Copies an image from a project's repo into public/work/<slug>/<name>.{avif,webp}, resized.
// Usage: node scripts/import-media.mjs <slug> <source image> <name> [max width]
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

const [slug, src, name, width = '1600'] = process.argv.slice(2)
if (!slug || !src || !name) {
  console.error('Usage: node scripts/import-media.mjs <slug> <source> <name> [width]')
  process.exit(1)
}
const dir = `public/work/${slug}`
mkdirSync(dir, { recursive: true })
const img = sharp(src).resize({ width: Number(width), withoutEnlargement: true })
const meta = await img.clone().webp({ quality: 82 }).toFile(`${dir}/${name}.webp`)
await img.clone().avif({ quality: 55, effort: 5 }).toFile(`${dir}/${name}.avif`)
console.log(`${dir}/${name}  ${meta.width}x${meta.height}`)
