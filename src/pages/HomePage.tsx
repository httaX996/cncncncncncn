import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SEO } from '../components/SEO'
import { Hero } from '../components/Hero'
import { Carousel } from '../components/Carousel'
import { AnimatedSection } from '../components/AnimatedSection'
import { BentoGrid } from '../components/BentoGrid'
import { TrendingPeople } from '../components/TrendingPeople'
import { StudioShowcase } from '../components/StudioShowcase'
import { GenreExplorer } from '../components/GenreExplorer'
import { InstallPWAPrompt } from '../components/InstallPWAPrompt'
import { KeepWatching } from '../components/KeepWatching'
import { BecauseYouWatched } from '../components/BecauseYouWatched'
import { SkeletonHero } from '../components/SkeletonHero'
import { SkeletonCard } from '../components/SkeletonCard'
import { RandomButton } from '../components/RandomButton'
import { QuoteSection } from '../components/QuoteSection'
import { FeaturedCollection } from '../components/FeaturedCollection'
import { StreamingSpotlight } from '../components/StreamingSpotlight'
import { getHomeMode } from '../utils/homeMode'
import {
  fetchTrendingMoviesPaginated,
  fetchPopularMoviesPaginated,
  fetchTopRatedMoviesPaginated,
  fetchNowPlayingMoviesPaginated,
  fetchPopularTVShowsPaginated,
  fetchTopRatedTVShowsPaginated,
  fetchTrendingTVShowsPaginated,
} from '../services/tmdbPaginated'
import type { Movie, TVShow } from '../types/tmdb'

const HomePage = () => {
  const navigate = useNavigate()
  const [heroMovies, setHeroMovies] = useState<Movie[]>([])
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([])
  const [popularMovies, setPopularMovies] = useState<Movie[]>([])
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([])
  const [nowPlayingMovies, setNowPlayingMovies] = useState<Movie[]>([])
  const [trendingTVShows, setTrendingTVShows] = useState<TVShow[]>([])
  const [popularTVShows, setPopularTVShows] = useState<TVShow[]>([])
  const [topRatedTVShows, setTopRatedTVShows] = useState<TVShow[]>([])
  const [heroLoading, setHeroLoading] = useState(true)
  const [contentLoading, setContentLoading] = useState(true)

  useEffect(() => {
    const loadHeroContent = async () => {
      try {
        // Fetch only trending movies first for the Hero
        const trending = await fetchTrendingMoviesPaginated(1)
        setHeroMovies(trending.results.slice(0, 5))
        setHeroLoading(false)
      } catch (error) {
        console.error('Failed to load hero content:', error)
        setHeroLoading(false)
      }
    }

    const loadRestOfContent = async () => {
      try {
        // Detect mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768

        // Load fewer pages on mobile for faster initial load
        const pagesToLoad = isMobile ? 2 : 3

        const promises = []

        // Trending Movies (Pages 1-N) - We re-fetch page 1 to keep logic simple for the carousel, or we could reuse hero data
        for (let i = 1; i <= pagesToLoad; i++) {
          promises.push(fetchTrendingMoviesPaginated(i))
        }
        // Popular Movies
        for (let i = 1; i <= pagesToLoad; i++) {
          promises.push(fetchPopularMoviesPaginated(i))
        }
        // Top Rated Movies
        for (let i = 1; i <= pagesToLoad; i++) {
          promises.push(fetchTopRatedMoviesPaginated(i))
        }
        // Now Playing Movies
        for (let i = 1; i <= pagesToLoad; i++) {
          promises.push(fetchNowPlayingMoviesPaginated(i))
        }
        // Trending TV
        for (let i = 1; i <= pagesToLoad; i++) {
          promises.push(fetchTrendingTVShowsPaginated(i))
        }
        // Popular TV
        for (let i = 1; i <= pagesToLoad; i++) {
          promises.push(fetchPopularTVShowsPaginated(i))
        }
        // Top Rated TV
        for (let i = 1; i <= pagesToLoad; i++) {
          promises.push(fetchTopRatedTVShowsPaginated(i))
        }

        const results = await Promise.all(promises)

        // Split results into categories with proper typing
        const emptyMovieResponse = { results: [] as Movie[] }
        const emptyTVResponse = { results: [] as TVShow[] }

        const trending1 = results[0] as typeof emptyMovieResponse
        const trending2 = results[1] as typeof emptyMovieResponse
        const trending3 = pagesToLoad === 3 ? (results[2] as typeof emptyMovieResponse) : emptyMovieResponse

        const popular1 = results[pagesToLoad] as typeof emptyMovieResponse
        const popular2 = results[pagesToLoad + 1] as typeof emptyMovieResponse
        const popular3 = pagesToLoad === 3 ? (results[pagesToLoad + 2] as typeof emptyMovieResponse) : emptyMovieResponse

        const topRated1 = results[pagesToLoad * 2] as typeof emptyMovieResponse
        const topRated2 = results[pagesToLoad * 2 + 1] as typeof emptyMovieResponse
        const topRated3 = pagesToLoad === 3 ? (results[pagesToLoad * 2 + 2] as typeof emptyMovieResponse) : emptyMovieResponse

        const nowPlaying1 = results[pagesToLoad * 3] as typeof emptyMovieResponse
        const nowPlaying2 = results[pagesToLoad * 3 + 1] as typeof emptyMovieResponse
        const nowPlaying3 = pagesToLoad === 3 ? (results[pagesToLoad * 3 + 2] as typeof emptyMovieResponse) : emptyMovieResponse

        const trendingTV1 = results[pagesToLoad * 4] as typeof emptyTVResponse
        const trendingTV2 = results[pagesToLoad * 4 + 1] as typeof emptyTVResponse
        const trendingTV3 = pagesToLoad === 3 ? (results[pagesToLoad * 4 + 2] as typeof emptyTVResponse) : emptyTVResponse

        const popularTV1 = results[pagesToLoad * 5] as typeof emptyTVResponse
        const popularTV2 = results[pagesToLoad * 5 + 1] as typeof emptyTVResponse
        const popularTV3 = pagesToLoad === 3 ? (results[pagesToLoad * 5 + 2] as typeof emptyTVResponse) : emptyTVResponse

        const topRatedTV1 = results[pagesToLoad * 6] as typeof emptyTVResponse
        const topRatedTV2 = results[pagesToLoad * 6 + 1] as typeof emptyTVResponse
        const topRatedTV3 = pagesToLoad === 3 ? (results[pagesToLoad * 6 + 2] as typeof emptyTVResponse) : emptyTVResponse

        const allTrending: Movie[] = [...trending1.results, ...trending2.results, ...trending3.results]
        const allPopular: Movie[] = [...popular1.results, ...popular2.results, ...popular3.results]
        const allTopRated: Movie[] = [...topRated1.results, ...topRated2.results, ...topRated3.results]
        const allNowPlaying: Movie[] = [...nowPlaying1.results, ...nowPlaying2.results, ...nowPlaying3.results]
        const allTrendingTV: TVShow[] = [...trendingTV1.results, ...trendingTV2.results, ...trendingTV3.results]
        const allPopularTV: TVShow[] = [...popularTV1.results, ...popularTV2.results, ...popularTV3.results]
        const allTopRatedTV: TVShow[] = [...topRatedTV1.results, ...topRatedTV2.results, ...topRatedTV3.results]

        setTrendingMovies(allTrending)
        setPopularMovies(allPopular)
        setTopRatedMovies(allTopRated)
        setNowPlayingMovies(allNowPlaying)
        setTrendingTVShows(allTrendingTV)
        setPopularTVShows(allPopularTV)
        setTopRatedTVShows(allTopRatedTV)
      } catch (error) {
        console.error('Failed to load content:', error)
      } finally {
        setContentLoading(false)
      }
    }

    // Start loading hero content immediately
    loadHeroContent()
    // Start loading the rest of the content
    loadRestOfContent()
  }, [])

  // Check home mode and redirect if needed
  useEffect(() => {
    const mode = getHomeMode()
    if (mode === 'sports') {
      navigate('/sports', { replace: true })
    }
  }, [navigate])

  // Ensure homepage starts at top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  if (heroLoading) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <SkeletonHero />
        <div className="max-w-7xl mx-auto py-6 md:py-12 space-y-6 md:space-y-12 px-4 sm:px-6 lg:px-8">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="space-y-4">
              <div className="h-6 md:h-8 bg-gray-800/50 rounded w-48 shimmer" />
              <div className="flex space-x-3 md:space-x-4 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-32 sm:w-40 md:w-48">
                    <SkeletonCard />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f1014] pb-20 md:pb-0 overflow-x-hidden relative">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[150px] opacity-40" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-blue-900/20 rounded-full blur-[150px] opacity-30" />
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[40%] bg-pink-900/10 rounded-full blur-[150px] opacity-30" />
      </div>

      <div className="relative z-10">

        <SEO
          title="Home"
          description="Your ultimate destination for streaming movies and TV shows. Watch trending movies, popular series, and discover new content on SanuFlix."
        />
        <InstallPWAPrompt />
        <Hero movies={heroMovies} />

        <RandomButton variant="floating" />

        <KeepWatching />

        <BecauseYouWatched />

        <div className="max-w-7xl mx-auto py-6 md:py-12 space-y-8 md:space-y-16 px-4 sm:px-6 lg:px-8">
          {contentLoading ? (
            // Content Skeletons while loading the rest
            <div className="px-4 sm:px-6 lg:px-8 space-y-12">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="space-y-4">
                  <div className="h-6 md:h-8 bg-gray-800/50 rounded w-48 shimmer" />
                  <div className="flex space-x-3 md:space-x-4 overflow-hidden">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="flex-shrink-0 w-32 sm:w-40 md:w-48">
                        <SkeletonCard />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <AnimatedSection>
                <BentoGrid
                  title="Trending Now"
                  items={trendingMovies}
                  type="movie"
                />
              </AnimatedSection>

              <AnimatedSection delay={0.1}>
                <StreamingSpotlight />
              </AnimatedSection>

              <AnimatedSection delay={0.1}>
                <TrendingPeople />
              </AnimatedSection>

              <AnimatedSection delay={0.1}>
                <Carousel
                  title="Popular Movies"
                  items={popularMovies}
                  mediaType="movie"
                  categoryPath="/category/popular-movies"
                />
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <QuoteSection />
              </AnimatedSection>

              <AnimatedSection delay={0.1}>
                <StudioShowcase />
              </AnimatedSection>

              <AnimatedSection delay={0.1}>
                <Carousel
                  title="Trending TV Shows"
                  items={trendingTVShows}
                  mediaType="tv"
                  categoryPath="/category/trending-tv"
                />
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <GenreExplorer />
              </AnimatedSection>

              <AnimatedSection delay={0.1}>
                <Carousel
                  title="Now Playing"
                  items={nowPlayingMovies}
                  mediaType="movie"
                  categoryPath="/category/now-playing"
                />
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <FeaturedCollection />
              </AnimatedSection>

              <AnimatedSection delay={0.1}>
                <Carousel
                  title="Popular TV Shows"
                  items={popularTVShows}
                  mediaType="tv"
                  categoryPath="/category/popular-tv"
                />
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <QuoteSection />
              </AnimatedSection>

              <AnimatedSection delay={0.1}>
                <Carousel
                  title="Top Rated Movies"
                  items={topRatedMovies}
                  mediaType="movie"
                  categoryPath="/category/top-rated-movies"
                />
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <FeaturedCollection />
              </AnimatedSection>

              <AnimatedSection delay={0.1}>
                <Carousel
                  title="Top Rated TV Shows"
                  items={topRatedTVShows}
                  mediaType="tv"
                  categoryPath="/category/top-rated-tv"
                />
              </AnimatedSection>
            </>
          )}
        </div>
      </div>
    </div>

  )
}

export default HomePage
