import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { FaSearch, FaTimes, FaClock, FaFire, FaFilm, FaTv, FaUser } from 'react-icons/fa'
import { getSearchSuggestions, getTrendingSearches } from '../services/tmdb'
import { getRecentSearches, removeFromSearchHistory } from '../utils/searchHistory'
import { getImageUrl } from '../services/tmdb'
import type { Movie, TVShow, PersonDetails } from '../types/tmdb'

interface SearchSuggestionsProps {
  query: string
  isVisible: boolean
  onSuggestionClick: (query: string) => void
  onClose: () => void
}

export const SearchSuggestions = ({ query, isVisible, onSuggestionClick, onClose }: SearchSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<{
    movies: Movie[]
    tvShows: TVShow[]
    people: PersonDetails[]
  }>({ movies: [], tvShows: [], people: [] })
  const [trendingSearches, setTrendingSearches] = useState<string[]>([])
  const [recentSearches, setRecentSearches] = useState(getRecentSearches())
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const allSuggestionsRef = useRef<(HTMLButtonElement | HTMLAnchorElement | null)[]>([])

  // Fetch suggestions when query changes
  useEffect(() => {
    if (!isVisible) return

    const fetchSuggestions = async () => {
      if (query.trim()) {
        setLoading(true)
        try {
          const data = await getSearchSuggestions(query)
          setSuggestions(data)
        } catch (error) {
          console.error('Error fetching suggestions:', error)
        } finally {
          setLoading(false)
        }
      } else {
        setSuggestions({ movies: [], tvShows: [], people: [] })
      }
    }

    const timeoutId = setTimeout(fetchSuggestions, 300) // Debounce
    return () => clearTimeout(timeoutId)
  }, [query, isVisible])

  // Fetch trending searches on mount
  useEffect(() => {
    if (!isVisible) return

    const fetchTrending = async () => {
      try {
        const trending = await getTrendingSearches()
        setTrendingSearches(trending)
      } catch (error) {
        console.error('Error fetching trending searches:', error)
      }
    }

    fetchTrending()
  }, [isVisible])

  // Update recent searches when component mounts
  useEffect(() => {
    if (isVisible) {
      setRecentSearches(getRecentSearches())
    }
  }, [isVisible])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return

      const allSuggestions = allSuggestionsRef.current.filter(Boolean)
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setActiveIndex((prev: number) => 
            prev < allSuggestions.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setActiveIndex((prev: number) => 
            prev > 0 ? prev - 1 : allSuggestions.length - 1
          )
          break
        case 'Enter':
          e.preventDefault()
          if (activeIndex >= 0 && allSuggestions[activeIndex]) {
            allSuggestions[activeIndex]?.click()
          }
          break
        case 'Escape':
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isVisible, activeIndex, onClose])

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && allSuggestionsRef.current[activeIndex]) {
      allSuggestionsRef.current[activeIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      })
    }
  }, [activeIndex])

  const handleSuggestionClick = (suggestionQuery: string) => {
    onSuggestionClick(suggestionQuery)
    onClose()
  }

  const handleRemoveRecent = (e: React.MouseEvent<HTMLButtonElement>, query: string) => {
    e.stopPropagation()
    removeFromSearchHistory(query)
    setRecentSearches(getRecentSearches())
  }

  const renderSuggestionItem = (
    item: Movie | TVShow | PersonDetails,
    type: 'movie' | 'tv' | 'person',
    index: number
  ) => {
    const isMovie = type === 'movie'
    const isTV = type === 'tv'
    const isPerson = type === 'person'
    
    const title = isPerson ? (item as PersonDetails).name : 
                  isMovie ? (item as Movie).title : 
                  (item as TVShow).name
    
    const releaseDate = isMovie ? (item as Movie).release_date : 
                        isTV ? (item as TVShow).first_air_date : 
                        null
    
    const posterPath = isPerson ? (item as PersonDetails).profile_path :
                       isMovie ? (item as Movie).poster_path :
                       (item as TVShow).poster_path

    const linkPath = isPerson ? `/person/${item.id}` :
                     isMovie ? `/movie/${item.id}` :
                     `/tv/${item.id}`

    const icon = isPerson ? FaUser : isMovie ? FaFilm : FaTv

    return (
      <Link
        key={`${type}-${item.id}`}
        to={linkPath}
        onClick={() => handleSuggestionClick(title)}
        className={`flex items-center space-x-3 p-3 hover:bg-white/10 transition-colors duration-200 bg-black/80 ${
          activeIndex === index ? 'bg-white/10' : ''
        }`}
        ref={(el: HTMLAnchorElement | null) => allSuggestionsRef.current[index] = el}
      >
        <div className="flex-shrink-0 w-12 h-16 bg-gray-700 rounded overflow-hidden">
          {posterPath ? (
            <img
              src={getImageUrl(posterPath, 'w92')}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {React.createElement(icon, { className: "text-gray-400 text-lg" })}
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white truncate">{title}</h4>
          {releaseDate && (
            <p className="text-sm text-gray-400">
              {new Date(releaseDate).getFullYear()}
            </p>
          )}
          {isPerson && (
            <p className="text-sm text-gray-400 truncate">
              {(item as PersonDetails).known_for_department}
            </p>
          )}
        </div>
      </Link>
    )
  }

  if (!isVisible) return null

  const hasQuery = query.trim().length > 0
  const hasSuggestions = suggestions.movies.length > 0 || suggestions.tvShows.length > 0 || suggestions.people.length > 0
  const hasRecentSearches = recentSearches.length > 0
  const hasTrendingSearches = trendingSearches.length > 0

  return (
    <div
      ref={suggestionsRef}
      className="absolute top-full left-0 right-0 mt-2 bg-black/98 backdrop-blur-md rounded-lg border border-white/30 shadow-xl z-50 max-h-96 overflow-y-auto"
    >
      {hasQuery ? (
        // Show search suggestions
        <>
          {loading ? (
            <div className="p-4 text-center text-gray-300 bg-black/95">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              Searching...
            </div>
          ) : hasSuggestions ? (
            <div className="py-2">
              {/* Movies */}
              {suggestions.movies.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-sm font-medium text-gray-200 border-b border-white/20 bg-black/95">
                    Movies
                  </div>
                  {suggestions.movies.map((movie, index) => 
                    renderSuggestionItem(movie, 'movie', index)
                  )}
                </div>
              )}

              {/* TV Shows */}
              {suggestions.tvShows.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-sm font-medium text-gray-200 border-b border-white/20 bg-black/95">
                    TV Shows
                  </div>
                  {suggestions.tvShows.map((show, index) => 
                    renderSuggestionItem(show, 'tv', suggestions.movies.length + index)
                  )}
                </div>
              )}

              {/* People */}
              {suggestions.people.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-sm font-medium text-gray-200 border-b border-white/20 bg-black/95">
                    People
                  </div>
                  {suggestions.people.map((person, index) => 
                    renderSuggestionItem(person, 'person', 
                      suggestions.movies.length + suggestions.tvShows.length + index)
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-300 bg-black/95">
              No suggestions found for "{query}"
            </div>
          )}
        </>
      ) : (
        // Show recent searches and trending
        <div className="py-2">
          {/* Recent Searches */}
          {hasRecentSearches && (
            <div>
              <div className="px-4 py-2 text-sm font-medium text-gray-200 border-b border-white/20 bg-black/95 flex items-center space-x-2">
                <FaClock className="text-sm" />
                <span>Recent Searches</span>
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={search.timestamp}
                  onClick={() => handleSuggestionClick(search.query)}
                  className={`w-full flex items-center justify-between p-3 hover:bg-white/10 transition-colors duration-200 bg-black/80 ${
                    activeIndex === index ? 'bg-white/10' : ''
                  }`}
                  ref={(el: HTMLButtonElement | null) => allSuggestionsRef.current[index] = el}
                >
                  <div className="flex items-center space-x-3">
                    <FaSearch className="text-gray-400 text-sm" />
                    <span className="text-white">{search.query}</span>
                  </div>
                  <button
                    onClick={(e) => handleRemoveRecent(e, search.query)}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors duration-200"
                    aria-label={`Remove ${search.query} from recent searches`}
                  >
                    <FaTimes className="text-gray-400 text-xs" />
                  </button>
                </button>
              ))}
            </div>
          )}

          {/* Trending Searches */}
          {hasTrendingSearches && (
            <div>
              <div className="px-4 py-2 text-sm font-medium text-gray-200 border-b border-white/20 bg-black/95 flex items-center space-x-2">
                <FaFire className="text-sm" />
                <span>Trending</span>
              </div>
              {trendingSearches.map((trend, index) => (
                <button
                  key={trend}
                  onClick={() => handleSuggestionClick(trend)}
                  className={`w-full flex items-center space-x-3 p-3 hover:bg-white/10 transition-colors duration-200 bg-black/80 ${
                    activeIndex === (recentSearches.length + index) ? 'bg-white/10' : ''
                  }`}
                  ref={(el: HTMLButtonElement | null) => allSuggestionsRef.current[recentSearches.length + index] = el}
                >
                  <FaFire className="text-primary text-sm" />
                  <span className="text-white">{trend}</span>
                </button>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!hasRecentSearches && !hasTrendingSearches && (
            <div className="p-4 text-center text-gray-300 bg-black/95">
              Start typing to search for movies, TV shows, and people
            </div>
          )}
        </div>
      )}
    </div>
  )
}
