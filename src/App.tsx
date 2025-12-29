import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { Layout } from './components/Layout'
import { LoadingSpinner } from './components/LoadingSpinner'
import { DisclaimerDialog } from './components/DisclaimerDialog'

// Lazy load all pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'))
const MovieDetailPage = lazy(() => import('./pages/MovieDetailPage'))
const TVShowDetailPage = lazy(() => import('./pages/TVShowDetailPage'))
const WatchMoviePage = lazy(() => import('./pages/WatchMoviePage'))
const WatchTVShowPage = lazy(() => import('./pages/WatchTVShowPage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const CategoryPage = lazy(() => import('./pages/CategoryPage'))
const MyListPage = lazy(() => import('./pages/MyListPage'))
const GenreBrowsePage = lazy(() => import('./pages/GenreBrowsePage'))
const GenrePage = lazy(() => import('./pages/GenrePage'))
const PersonDetailPage = lazy(() => import('./pages/PersonDetailPage'))
const StudiosPage = lazy(() => import('./pages/StudiosPage'))
const StudioDetailPage = lazy(() => import('./pages/StudioDetailPage'))
const TrailerSwipePage = lazy(() => import('./pages/TrailerSwipePage'))
const SportsHomePage = lazy(() => import('./pages/SportsHomePage'))
const SportsMatchDetailPage = lazy(() => import('./pages/SportsMatchDetailPage'))
const SportsMatchPlayerPage = lazy(() => import('./pages/SportsMatchPlayerPage'))
const SportsCategoryPage = lazy(() => import('./pages/SportsCategoryPage'))
const DownloaderPage = lazy(() => import('./pages/DownloaderPage'))

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Use instant scroll to avoid any animation
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    // Also set scroll position after a brief delay to handle any layout shifts
    const timeoutId = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }, 0)
    return () => clearTimeout(timeoutId)
  }, [pathname])

  return null
}

import { useTheme } from './contexts/ThemeContext'
import { ChristmasSnow } from './components/ChristmasSnow'

function AppContent() {
  const { seasonalEnabled } = useTheme()

  return (
    <>
      {seasonalEnabled && <ChristmasSnow />}
      <ScrollToTop />
      <DisclaimerDialog />
      <Layout>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/movie/:id" element={<MovieDetailPage />} />
            <Route path="/movie/:id/watch" element={<WatchMoviePage />} />
            <Route path="/tv/:id" element={<TVShowDetailPage />} />
            <Route path="/tv/:id/watch" element={<WatchTVShowPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/my-list" element={<MyListPage />} />
            <Route path="/genres" element={<GenreBrowsePage />} />
            <Route path="/genre/movie" element={<GenrePage />} />
            <Route path="/genre/tv" element={<GenrePage />} />
            <Route path="/person/:id" element={<PersonDetailPage />} />
            <Route path="/studios" element={<StudiosPage />} />
            <Route path="/studio/:id" element={<StudioDetailPage />} />
            <Route path="/reeailer" element={<TrailerSwipePage />} />
            <Route path="/sports" element={<SportsHomePage />} />
            <Route path="/sports/match/:id" element={<SportsMatchDetailPage />} />
            <Route path="/sports/match/:id/watch" element={<SportsMatchPlayerPage />} />
            <Route path="/sports/category/:category" element={<SportsCategoryPage />} />
            <Route path="/downloader" element={<DownloaderPage />} />
          </Routes>
        </Suspense>
      </Layout>
    </>
  )
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppContent />
    </Router>
  )
}

export default App

