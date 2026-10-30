import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { Cursor, refreshCursor } from './components/Cursor'
import { Grain } from './components/Grain'
import { Loader } from './components/Loader'
import { Nav } from './components/Nav'
import { IntroProvider, useIntro } from './lib/intro'
import { FlightProvider } from './lib/flight'
import { TransitionProvider } from './lib/transition'
import { startSmoothScroll } from './lib/smooth'
import Home from './pages/Home'

const ProjectPage = lazy(() => import('./pages/ProjectPage'))

function Shell() {
  const { setReady, setDone } = useIntro()
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    startSmoothScroll()
  }, [])

  // The element under the pointer changes on a route change without a pointer event.
  useEffect(() => {
    requestAnimationFrame(refreshCursor)
  }, [location.pathname])

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
        <Suspense fallback={<div className="min-h-[100svh]" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/work/:slug" element={<ProjectPage />} />
            <Route path="*" element={<ProjectPage />} />
          </Routes>
        </Suspense>
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
        <TransitionProvider>
          <FlightProvider>
            <Shell />
          </FlightProvider>
        </TransitionProvider>
      </IntroProvider>
    </BrowserRouter>
  )
}
