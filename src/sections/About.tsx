import { SectionHeading } from '../components/SectionHeading'
import { FadeUp, SplitReveal } from '../components/Reveal'

const CURRENTLY = [
  { k: 'Building', v: '3D landing pages for my public apps, and this site.' },
  { k: 'Work', v: 'Part-time at FiadoLabs: UI/UX, Framer and Wix sites, blog writing, social media and reports.' },
  { k: 'Open to', v: 'Forward Deployed Engineer roles and remote AI work.' },
]

export function About() {
  return (
    <section id="about" className="container-x py-28 md:py-40" aria-labelledby="about-title">
      <SectionHeading index="01" label="About" />

      <div className="grid-12 mt-8 md:mt-[-2.4rem]">
        <SplitReveal
          as="h2"
          id="about-title"
          className="col-span-12 font-display text-[clamp(30px,3.9vw,62px)] font-medium leading-[1.08] tracking-[-0.02em] md:col-span-9 md:col-start-4"
        >
          I’m Jagdish, an AI-native builder in Surat, India. I build AI agents and web apps, and take them all the
          way to a live link.
        </SplitReveal>
        <FadeUp
          as="p"
          className="col-span-12 mt-6 max-w-[52ch] text-[18px] leading-relaxed text-mute md:col-span-6 md:col-start-4 md:mt-8"
        >
          I build AI-assisted, with Claude Code and Cursor as co-pilots, and I’m working toward Forward Deployed
          Engineering: turning AI demos into tools people use every day.
        </FadeUp>
      </div>

      <div className="grid-12 mt-14 gap-y-8 md:mt-20">
        <FadeUp className="col-span-12 md:col-span-6 md:col-start-4">
          <div className="relative overflow-hidden rounded-2xl border border-line bg-[linear-gradient(140deg,rgb(255_255_255/0.06),rgb(255_255_255/0.01)_60%)] p-6 md:p-8">
            <p className="label flex items-center gap-2.5 text-ink/85">
              <span className="pulse-dot" aria-hidden="true" />
              Currently
            </p>
            <dl className="mt-6 divide-y divide-line">
              {CURRENTLY.map((row) => (
                <div key={row.k} className="grid grid-cols-[96px_1fr] gap-4 py-4 first:pt-0 last:pb-0">
                  <dt className="text-[14px] text-mute">{row.k}</dt>
                  <dd className="text-[16px] leading-relaxed text-ink">{row.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </FadeUp>

        <FadeUp delay={0.1} className="col-span-12 md:col-span-3">
          <ul className="space-y-3 text-[15px] text-mute md:pt-2">
            <li className="flex justify-between gap-4 border-b border-line pb-3">
              <span>Based in</span>
              <span className="text-ink">Surat, Gujarat</span>
            </li>
            <li className="flex justify-between gap-4 border-b border-line pb-3">
              <span>Time zone</span>
              <span className="text-ink">IST, UTC+5:30</span>
            </li>
            <li className="flex justify-between gap-4">
              <span>Works</span>
              <span className="text-ink">Remote</span>
            </li>
          </ul>
        </FadeUp>
      </div>
    </section>
  )
}
