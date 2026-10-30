import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Cursor } from './components/Cursor'
import { Grain } from './components/Grain'
import { Loader } from './components/Loader'
import { Nav } from './components/Nav'
import { IntroProvider, useIntro } from './lib/intro'
import { startSmoothScroll } from './lib/smooth'
import Home from './pages/Home'

function Shell() {
  const { setReady, setDone } = useIntro()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    startSmoothScroll()
  }, [])

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      {loading && (
        <Loader
          onReveal={() => setReady(true)}
          onDone={() => {
            setDone(true)
            setLoading(false)
          }}
        />
      )}
      <Nav />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Grain />
      <Cursor />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <IntroProvider>
        <Shell />
      </IntroProvider>
    </BrowserRouter>
  )
}
