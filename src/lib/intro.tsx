import { createContext, useContext, useState, type ReactNode } from 'react'

type Intro = {
  /** The curtain is lifting: the hero can reveal. */
  ready: boolean
  /** The loader is gone: the nav logo takes over from the loader's initials. */
  done: boolean
  setReady: (v: boolean) => void
  setDone: (v: boolean) => void
}

const IntroContext = createContext<Intro>({ ready: true, done: true, setReady: () => {}, setDone: () => {} })

export function IntroProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [done, setDone] = useState(false)
  return <IntroContext.Provider value={{ ready, done, setReady, setDone }}>{children}</IntroContext.Provider>
}

export const useIntro = () => useContext(IntroContext)
