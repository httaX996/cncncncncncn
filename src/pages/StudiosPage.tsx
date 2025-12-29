import { useState, useEffect, useCallback, useRef } from 'react'
import { FaSearch, FaFilm, FaHeart } from 'react-icons/fa'
import { SEO } from '../components/SEO'
import { CompanyCard } from '../components/CompanyCard'
import { SkeletonCard } from '../components/SkeletonCard'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { FEATURED_STUDIOS } from '../config/studios'
import { fetchCompanyDetails, searchCompanies } from '../services/tmdb'
import { getFavoriteStudios } from '../utils/favoriteStudios'
import { useDebounce } from '../hooks/useDebounce'
import type { ProductionCompany } from '../types/tmdb'

const StudiosPage = () => {
  const [featuredStudios, setFeaturedStudios] = useState<ProductionCompany[]>([])
  const [searchResults, setSearchResults] = useState<ProductionCompany[]>([])
  const [favoriteStudios, setFavoriteStudios] = useState<ProductionCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const observerTarget = useRef<HTMLDivElement>(null)
  
  const debouncedSearch = useDebounce(searchQuery, 500)

  // Load featured studios on mount
  useEffect(() => {
    const loadFeaturedStudios = async () => {
      try {
        const studioData = await Promise.all(
          FEATURED_STUDIOS.map(async (studio) => {
            try {
              const details = await fetchCompanyDetails(studio.id)
              return details
            } catch (error) {
              return {
                id: studio.id,
                name: studio.name,
                description: studio.description,
                logo_path: null,
                headquarters: '',
                homepage: '',
                origin_country: ''
              }
            }
          })
        )
        setFeaturedStudios(studioData)
      } catch (error) {
        console.error('Failed to load featured studios:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFeaturedStudios()
    loadFavorites()
  }, [])

  const loadFavorites = () => {
    const favorites = getFavoriteStudios()
    // Convert FavoriteStudio to ProductionCompany format
    setFavoriteStudios(favorites.map(fav => ({
      ...fav,
      origin_country: ''
    })))
  }

  // Search companies when query changes
  useEffect(() => {
    if (debouncedSearch.trim()) {
      setPage(1)
      setSearchResults([])
      loadSearchResults(1)
    } else {
      setSearchResults([])
      setHasMore(true)
    }
  }, [debouncedSearch])

  const loadSearchResults = async (pageNum: number) => {
    if (!debouncedSearch.trim()) return

    setSearchLoading(true)
    try {
      const response = await searchCompanies(debouncedSearch, pageNum)
      
      if (pageNum === 1) {
        setSearchResults(response.results)
      } else {
        setSearchResults(prev => [...prev, ...response.results])
      }
      
      setHasMore(pageNum < response.total_pages)
      setPage(pageNum)
    } catch (error) {
      console.error('Failed to search studios:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  // Infinite scroll
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [target] = entries
    if (target.isIntersecting && hasMore && !searchLoading && debouncedSearch.trim()) {
      loadSearchResults(page + 1)
    }
  }, [hasMore, searchLoading, page, debouncedSearch])

  useEffect(() => {
    const element = observerTarget.current
    if (!element) return

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [handleObserver])

  const displayStudios = searchQuery.trim() ? searchResults : featuredStudios

  return (
    <div className="min-h-screen pt-16">
      <SEO
        title="Browse by Studio"
        description="Explore content from your favorite production companies and studios"
      />

      {/* Hero Section */}
      <section className="relative py-12 md:py-20 bg-gradient-to-b from-primary/20 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <FaFilm className="text-5xl md:text-6xl text-primary mx-auto mb-4 md:mb-6" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-gradient">
              Browse by Studio
            </h1>
            <p className="text-base md:text-lg text-gray-300 mb-6 md:mb-8">
              Discover movies and TV shows from the world's leading production companies
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search studios..."
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full 
                         px-5 py-3 md:py-4 pl-12 md:pl-14 
                         focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                         transition-all text-sm md:text-base"
                aria-label="Search for studios"
              />
              <FaSearch className="absolute left-4 md:left-5 top-1/2 transform -translate-y-1/2 text-gray-400 text-base md:text-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Favorite Studios */}
      {!searchQuery.trim() && favoriteStudios.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 border-b border-white/10">
          <div className="flex items-center gap-2 mb-4 md:mb-6">
            <FaHeart className="text-primary text-xl md:text-2xl" />
            <h2 className="text-2xl md:text-3xl font-bold text-gradient">
              Your Favorite Studios
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 animate-slide-up">
            {favoriteStudios.map((studio) => (
              <CompanyCard key={studio.id} company={studio} onFavoriteChange={loadFavorites} />
            ))}
          </div>
        </section>
      )}

      {/* Studios Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {!searchQuery.trim() && (
          <h2 className="text-2xl md:text-3xl font-bold text-gradient mb-4 md:mb-6">
            Featured Studios
          </h2>
        )}
        
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {[...Array(15)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : displayStudios.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 animate-slide-up">
              {displayStudios.map((studio) => (
                <CompanyCard key={studio.id} company={studio} onFavoriteChange={loadFavorites} />
              ))}
            </div>
            
            {/* Infinite scroll trigger */}
            {searchQuery.trim() && hasMore && (
              <div ref={observerTarget} className="py-8 flex justify-center">
                {searchLoading && <LoadingSpinner />}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">
              {searchQuery.trim() 
                ? `No studios found matching "${searchQuery}"` 
                : 'No studios available'}
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

export default StudiosPage

