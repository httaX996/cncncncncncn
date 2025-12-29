import { useEffect, useState, useRef, useCallback } from 'react'
import { useSearchParams, useLocation, Link } from 'react-router-dom'
import { FaArrowLeft, FaFilter } from 'react-icons/fa'
import { MediaCard } from '../components/MediaCard'
import { SkeletonCard } from '../components/SkeletonCard'
import { discoverMovies, discoverTVShows, fetchMovieGenres, fetchTVGenres } from '../services/tmdb'
import type { Movie, TVShow, Genre, DiscoverFilters } from '../types/tmdb'

const GenrePage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const mediaType = location.pathname.includes('/genre/tv') ? 'tv' : 'movie'
  
  const [items, setItems] = useState<(Movie | TVShow)[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const observerTarget = useRef<HTMLDivElement>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Get filters from URL
  const filters: DiscoverFilters = {
    genre: searchParams.get('genre') ? Number(searchParams.get('genre')) : undefined,
    year_min: searchParams.get('year_min') ? Number(searchParams.get('year_min')) : undefined,
    year_max: searchParams.get('year_max') ? Number(searchParams.get('year_max')) : undefined,
    rating_min: searchParams.get('rating_min') ? Number(searchParams.get('rating_min')) : undefined,
    sort_by: searchParams.get('sort') || 'popularity.desc',
  }

  // Load genres
  useEffect(() => {
    const loadGenres = async () => {
      try {
        const response = mediaType === 'movie' ? await fetchMovieGenres() : await fetchTVGenres()
        setGenres(response.genres)
      } catch (error) {
        console.error('Failed to load genres:', error)
      }
    }
    loadGenres()
  }, [mediaType])

  // Load content
  useEffect(() => {
    const loadInitialContent = async () => {
      setLoading(true)
      setPage(1)
      setHasMore(true)
      
      try {
        const response = mediaType === 'movie' 
          ? await discoverMovies(1, filters)
          : await discoverTVShows(1, filters)
        
        setItems(response.results)
        setHasMore(response.page < response.total_pages)
      } catch (error) {
        console.error('Failed to load content:', error)
      } finally {
        setLoading(false)
      }
    }

    loadInitialContent()
    window.scrollTo(0, 0)
  }, [searchParams, mediaType])

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)
    try {
      const response = mediaType === 'movie'
        ? await discoverMovies(page + 1, filters)
        : await discoverTVShows(page + 1, filters)
      
      setItems(prev => [...prev, ...response.results])
      setPage(page + 1)
      setHasMore(response.page < response.total_pages)
    } catch (error) {
      console.error('Failed to load more content:', error)
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, hasMore, page, mediaType, filters])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || loadingMore || loading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
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

  const updateFilter = (key: string, value: any) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set(key, value.toString())
    } else {
      newParams.delete(key)
    }
    setSearchParams(newParams)
  }

  const selectedGenre = genres.find(g => g.id === filters.genre)
  const currentYear = new Date().getFullYear()

  const sortOptions = [
    { value: 'popularity.desc', label: 'Most Popular' },
    { value: 'popularity.asc', label: 'Least Popular' },
    { value: 'vote_average.desc', label: 'Highest Rated' },
    { value: 'vote_average.asc', label: 'Lowest Rated' },
    { value: mediaType === 'movie' ? 'primary_release_date.desc' : 'first_air_date.desc', label: 'Newest First' },
    { value: mediaType === 'movie' ? 'primary_release_date.asc' : 'first_air_date.asc', label: 'Oldest First' },
  ]

  return (
    <div className="min-h-screen pt-20 md:pt-24 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <Link
            to="/genres"
            className="inline-flex items-center space-x-2 text-gray-300 hover:text-primary transition-colors mb-4"
          >
            <FaArrowLeft />
            <span>Back to Genres</span>
          </Link>
          
          {loading ? (
            <>
              <div className="h-10 md:h-12 bg-gray-700/50 rounded w-64 mb-2 shimmer" />
              <div className="h-4 md:h-5 bg-gray-700/50 rounded w-48 shimmer" />
            </>
          ) : (
            <>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient">
                {selectedGenre ? selectedGenre.name : 'All'} {mediaType === 'movie' ? 'Movies' : 'TV Shows'}
              </h1>
              <p className="text-sm md:text-base text-gray-400 mt-2">
                {items.length} {mediaType === 'movie' ? 'movies' : 'shows'} found
              </p>
            </>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6 md:mb-8">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 md:px-6 py-2 md:py-3 glass-effect rounded-lg font-semibold text-sm md:text-base
                     hover:bg-white/20 active:scale-95 transition-all duration-300 mb-4"
          >
            <FaFilter />
            <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
          </button>

          {showFilters && (
            <div className="glass-effect rounded-lg p-4 md:p-6 space-y-4 md:space-y-6 animate-slide-up">
              {/* Genre Select */}
              <div>
                <label className="block text-sm font-semibold mb-2">Genre</label>
                <select
                  value={filters.genre || ''}
                  onChange={(e) => updateFilter('genre', e.target.value)}
                  className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-800/50 border border-white/10 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-primary text-sm md:text-base"
                >
                  <option value="">All Genres</option>
                  {genres.map(genre => (
                    <option key={genre.id} value={genre.id}>{genre.name}</option>
                  ))}
                </select>
              </div>

              {/* Year Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">From Year</label>
                  <input
                    type="number"
                    min="1900"
                    max={currentYear}
                    value={filters.year_min || ''}
                    onChange={(e) => updateFilter('year_min', e.target.value)}
                    placeholder="1900"
                    className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-800/50 border border-white/10 rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-primary text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">To Year</label>
                  <input
                    type="number"
                    min="1900"
                    max={currentYear}
                    value={filters.year_max || ''}
                    onChange={(e) => updateFilter('year_max', e.target.value)}
                    placeholder={currentYear.toString()}
                    className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-800/50 border border-white/10 rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-primary text-sm md:text-base"
                  />
                </div>
              </div>

              {/* Minimum Rating */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Minimum Rating: {filters.rating_min || 0}
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={filters.rating_min || 0}
                  onChange={(e) => updateFilter('rating_min', e.target.value)}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0</span>
                  <span>10</span>
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-semibold mb-2">Sort By</label>
                <select
                  value={filters.sort_by || 'popularity.desc'}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                  className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-800/50 border border-white/10 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-primary text-sm md:text-base"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
          {loading ? (
            [...Array(18)].map((_, i) => <SkeletonCard key={i} />)
          ) : (
            items.map((item) => (
              <MediaCard key={item.id} item={item} mediaType={mediaType} />
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

        {/* No Results */}
        {!loading && items.length === 0 && (
          <div className="text-center py-12 md:py-20">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">No results found</h2>
            <p className="text-sm md:text-base text-gray-400">
              Try adjusting your filters to see more results
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default GenrePage

