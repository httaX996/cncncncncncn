import { useEffect, useState, useRef, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { FaSearch } from 'react-icons/fa'
import { MediaCard } from '../components/MediaCard'
import { SkeletonCard } from '../components/SkeletonCard'
import { SearchSuggestions } from '../components/SearchSuggestions'
import { searchMulti } from '../services/tmdb'
import { addToSearchHistory } from '../utils/searchHistory'
import type { Movie, TVShow } from '../types/tmdb'

const SearchPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = searchParams.get('q') || ''
  const [searchQuery, setSearchQuery] = useState(query)
  const [results, setResults] = useState<(Movie | TVShow)[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const observerTarget = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setSearchQuery(query)
  }, [query])

  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setResults([])
        setHasMore(false)
        return
      }

      setLoading(true)
      setPage(1)
      try {
        const response = await searchMulti(query, 1)
        // Filter out people and other non-media results
        const mediaResults = response.results.filter(
          (item: any) => item.media_type === 'movie' || item.media_type === 'tv'
        )
        setResults(mediaResults)
        setHasMore(response.page < response.total_pages)
        
        // Add to search history
        addToSearchHistory(query, mediaResults.length)
      } catch (error) {
        console.error('Search failed:', error)
        setResults([])
        setHasMore(false)
      } finally {
        setLoading(false)
      }
    }

    performSearch()
  }, [query])

  const handleSearch = (searchTerm: string) => {
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`)
      setShowSuggestions(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    setShowSuggestions(true)
  }

  const handleInputFocus = () => {
    setShowSuggestions(true)
  }

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => setShowSuggestions(false), 200)
  }


  const loadMore = useCallback(async () => {
    if (!query.trim() || loadingMore || !hasMore) return

    setLoadingMore(true)
    try {
      const response = await searchMulti(query, page + 1)
      const mediaResults = response.results.filter(
        (item: any) => item.media_type === 'movie' || item.media_type === 'tv'
      )
      setResults(prev => [...prev, ...mediaResults])
      setPage(page + 1)
      setHasMore(response.page < response.total_pages)
    } catch (error) {
      console.error('Failed to load more results:', error)
    } finally {
      setLoadingMore(false)
    }
  }, [query, loadingMore, hasMore, page])

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

  return (
    <div className="min-h-screen pt-20 md:pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Search Input */}
        <div className="mb-6 md:mb-8 relative">
          <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSearch(searchQuery)
                  } else if (e.key === 'Escape') {
                    setShowSuggestions(false)
                  }
                }}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder="Search for movies, TV shows, and people..."
                className="w-full px-4 py-3 pl-12 pr-4 bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                autoComplete="off"
              />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          {/* Search Suggestions */}
          <SearchSuggestions
            query={searchQuery}
            isVisible={showSuggestions}
            onSuggestionClick={handleSearch}
            onClose={() => setShowSuggestions(false)}
          />
        </div>

        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
            Search Results {query && `for "${query}"`}
          </h1>
          <p className="text-sm md:text-base text-gray-400">
            {loading ? 'Searching...' : `${results.length} results found`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
            {[...Array(18)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
              {results.map((item: any) => (
                <MediaCard
                  key={`${item.media_type}-${item.id}`}
                  item={item}
                  mediaType={item.media_type}
                />
              ))}
            </div>

            {/* Loading More Indicator */}
            {loadingMore && (
              <div className="flex justify-center mt-8 md:mt-12">
                <div className="flex items-center space-x-3 text-gray-400">
                  <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <span>Loading more results...</span>
                </div>
              </div>
            )}

            {/* Intersection Observer Target */}
            {hasMore && !loadingMore && (
              <div ref={observerTarget} className="h-20 w-full" aria-hidden="true" />
            )}

            {/* End Message */}
            {!hasMore && results.length > 0 && (
              <div className="text-center mt-8 md:mt-12 text-gray-400">
                <p>No more results found</p>
              </div>
            )}
          </>
        ) : query ? (
          <div className="text-center py-12 md:py-20">
            <FaSearch className="text-4xl md:text-6xl text-gray-600 mx-auto mb-3 md:mb-4" />
            <h2 className="text-xl md:text-2xl font-bold mb-2">No results found</h2>
            <p className="text-sm md:text-base text-gray-400">
              Try searching with different keywords
            </p>
          </div>
        ) : (
          <div className="text-center py-12 md:py-20">
            <FaSearch className="text-4xl md:text-6xl text-gray-600 mx-auto mb-3 md:mb-4" />
            <h2 className="text-xl md:text-2xl font-bold mb-2">Start Searching</h2>
            <p className="text-sm md:text-base text-gray-400">
              Use the search bar above to find movies and TV shows
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchPage

