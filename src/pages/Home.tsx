import { useLayoutEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import { Intro } from '../sections/Intro'
import { Hero } from '../sections/Hero'
import { About } from '../sections/About'
import { WhatIDo } from '../sections/WhatIDo'
import { Work } from '../sections/Work'
import { Toolkit } from '../sections/Toolkit'
import { Contact } from '../sections/Contact'
import { ScrollTrigger } from '../lib/motion'
import { getLenis, scrollTo } from '../lib/smooth'
import { setMeta } from '../lib/meta'

/** Saved when a project card is opened, so Back returns to the same spot. */
export const HOME_SCROLL_KEY = 'home-scroll'

export default function Home() {
  const location = useLocation()
  const navType = useNavigationType()

  useLayoutEffect(() => {
    setMeta('Jagdish Patil — AI-native builder, aspiring Forward Deployed Engineer')
    const target = (location.state as { scrollTo?: string } | null)?.scrollTo
    const saved = sessionStorage.getItem(HOME_SCROLL_KEY)
    if (!target && !(navType === 'POP' && saved)) return
    // Let the pinned sections measure themselves first.
    const id = requestAnimationFrame(() => {
      ScrollTrigger.refresh()
      if (target) scrollTo(target, -40)
      else {
        const y = Number(saved)
        getLenis()?.scrollTo(y, { immediate: true, force: true })
        window.scrollTo(0, y)
      }
    })
    return () => cancelAnimationFrame(id)
  }, [location.key, location.state, navType])

  return (
    <>
      <Intro />
      <Hero />
      <About />
      <WhatIDo />
      <Work />
      <Toolkit />
      <Contact />
    </>
  )
}
