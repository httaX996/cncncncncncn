import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FaArrowLeft, FaSort } from 'react-icons/fa'
import { MediaCard } from '../components/MediaCard'
import { SkeletonCard } from '../components/SkeletonCard'
import {
  fetchTrendingMoviesPaginated,
  fetchPopularMoviesPaginated,
  fetchTopRatedMoviesPaginated,
  fetchNowPlayingMoviesPaginated,
  fetchTrendingTVShowsPaginated,
  fetchPopularTVShowsPaginated,
  fetchTopRatedTVShowsPaginated,
} from '../services/tmdbPaginated'
import type { Movie, TVShow } from '../types/tmdb'

const categoryConfig: Record<string, {
  title: string
  fetchFn: (page: number, sortBy?: string) => Promise<any>
  mediaType: 'movie' | 'tv'
  supportsSorting: boolean
}> = {
  'trending-movies': {
    title: 'Trending Movies',
    fetchFn: fetchTrendingMoviesPaginated,
    mediaType: 'movie',
    supportsSorting: false // Trending doesn't support sorting
  },
  'popular-movies': {
    title: 'Popular Movies',
    fetchFn: fetchPopularMoviesPaginated,
    mediaType: 'movie',
    supportsSorting: true
  },
  'top-rated-movies': {
    title: 'Top Rated Movies',
    fetchFn: fetchTopRatedMoviesPaginated,
    mediaType: 'movie',
    supportsSorting: true
  },
  'now-playing': {
    title: 'Now Playing',
    fetchFn: fetchNowPlayingMoviesPaginated,
    mediaType: 'movie',
    supportsSorting: true
  },
  'trending-tv': {
    title: 'Trending TV Shows',
    fetchFn: fetchTrendingTVShowsPaginated,
    mediaType: 'tv',
    supportsSorting: false // Trending doesn't support sorting
  },
  'popular-tv': {
    title: 'Popular TV Shows',
    fetchFn: fetchPopularTVShowsPaginated,
    mediaType: 'tv',
    supportsSorting: true
  },
  'top-rated-tv': {
    title: 'Top Rated TV Shows',
    fetchFn: fetchTopRatedTVShowsPaginated,
    mediaType: 'tv',
    supportsSorting: true
  }
}

const sortOptions = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'release_date.desc', label: 'Newest First' },
  { value: 'release_date.asc', label: 'Oldest First' },
  { value: 'title.asc', label: 'A-Z' },
  { value: 'title.desc', label: 'Z-A' },
]

const CategoryPage = () => {
  const { category } = useParams<{ category: string }>()
  const [items, setItems] = useState<(Movie | TVShow)[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [sortBy, setSortBy] = useState('popularity.desc')
  const observerTarget = useRef<HTMLDivElement>(null)

  const config = category ? categoryConfig[category] : null

  useEffect(() => {
    const loadInitialContent = async () => {
      if (!config) return

      setLoading(true)
      setPage(1)
      setHasMore(true)
      try {
        const sortParam = config.supportsSorting ? sortBy : undefined
        const response = await config.fetchFn(1, sortParam)
        setItems(response.results)
        setHasMore(response.page < response.total_pages)
      } catch (error) {
        console.error('Failed to load category content:', error)
      } finally {
        setLoading(false)
      }
    }

    loadInitialContent()
  }, [category, config, sortBy])

  const loadMore = useCallback(async () => {
    if (!config || loadingMore || !hasMore) return

    setLoadingMore(true)
    try {
      const sortParam = config.supportsSorting ? sortBy : undefined
      const response = await config.fetchFn(page + 1, sortParam)
      setItems(prev => [...prev, ...response.results])
      setPage(page + 1)
      setHasMore(response.page < response.total_pages)
    } catch (error) {
      console.error('Failed to load more content:', error)
    } finally {
      setLoadingMore(false)
    }
  }, [config, loadingMore, hasMore, page, sortBy])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || loadingMore || loading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '100px'
      }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [hasMore, loadingMore, loading, loadMore])

  if (!config) return <div className="text-center py-20">Category not found</div>

  return (
    <div className="min-h-screen pt-20 md:pt-24 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-gray-300 hover:text-primary transition-colors mb-4"
          >
            <FaArrowLeft />
            <span>Back to Home</span>
          </Link>
          {loading ? (
            <>
              <div className="h-10 md:h-12 bg-gray-700/50 rounded w-64 mb-2 shimmer" />
              <div className="h-4 md:h-5 bg-gray-700/50 rounded w-48 shimmer" />
            </>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient">
                    {config.title}
                  </h1>
                  <p className="text-sm md:text-base text-gray-400 mt-2">
                    {items.length} {config.mediaType === 'movie' ? 'movies' : 'shows'} available
                  </p>
                </div>

                {/* Sort Dropdown */}
                {config.supportsSorting && (
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <FaSort className="text-primary text-lg" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="glass-effect rounded-lg px-3 md:px-4 py-2 md:py-2.5 font-semibold text-sm md:text-base
                               border border-white/10 hover:border-primary/50 focus:outline-none focus:ring-2 
                               focus:ring-primary transition-all duration-300 cursor-pointer bg-gray-800/50"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value} className="bg-gray-900">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
          {loading ? (
            [...Array(18)].map((_, i) => <SkeletonCard key={i} />)
          ) : (
            items.map((item) => (
              <MediaCard key={item.id} item={item} mediaType={config.mediaType} />
            ))
          )}
        </div>

        {/* Loading Indicator */}
        {loadingMore && (
          <div className="flex justify-center mt-8 md:mt-12">
            <div className="flex items-center space-x-3 text-gray-400">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span>Loading more...</span>
            </div>
          </div>
        )}

        {/* Intersection Observer Target */}
        {hasMore && !loadingMore && !loading && (
          <div ref={observerTarget} className="h-20 w-full" aria-hidden="true" />
        )}

        {/* End Message */}
        {!hasMore && items.length > 0 && (
          <div className="text-center mt-8 md:mt-12 text-gray-400">
            <p>You've reached the end! 🎬</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoryPage

