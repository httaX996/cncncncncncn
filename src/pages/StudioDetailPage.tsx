import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { FaBuilding, FaGlobe, FaMapMarkerAlt, FaHeart, FaRegHeart } from 'react-icons/fa'
import { isFavoriteStudio, toggleFavoriteStudio } from '../utils/favoriteStudios'
import { SEO } from '../components/SEO'
import { MediaCard } from '../components/MediaCard'
import { TimelineSeparator } from '../components/TimelineSeparator'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { SkeletonCard } from '../components/SkeletonCard'
import {
  fetchCompanyDetails,
  fetchCompanyMovies,
  fetchCompanyTVShows,
  getImageUrl
} from '../services/tmdb'
import type { CompanyDetails, Movie, TVShow } from '../types/tmdb'

type ContentType = 'all' | 'movies' | 'tv'
type SortOption = 'latest' | 'oldest' | 'rating' | 'popularity'

interface TimelineGroup {
  year: number | string
  items: (Movie | TVShow)[]
}

const StudioDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const [company, setCompany] = useState<CompanyDetails | null>(null)
  const [contentType, setContentType] = useState<ContentType>('all')
  const [sortOption, setSortOption] = useState<SortOption>('latest')
  const [movies, setMovies] = useState<Movie[]>([])
  const [tvShows, setTVShows] = useState<TVShow[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [currentMoviePage, setCurrentMoviePage] = useState(1)
  const [currentTVPage, setCurrentTVPage] = useState(1)
  const [hasMoreMovies, setHasMoreMovies] = useState(true)
  const [hasMoreTV, setHasMoreTV] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Load company details and initial content
  useEffect(() => {
    const loadCompanyData = async () => {
      if (!id) return

      setLoading(true)
      try {
        const [companyData, moviesData, tvData] = await Promise.all([
          fetchCompanyDetails(Number(id)),
          fetchCompanyMovies(Number(id), 1),
          fetchCompanyTVShows(Number(id), 1)
        ])

        setCompany(companyData)
        setMovies(moviesData.results)
        setTVShows(tvData.results)
        setHasMoreMovies(moviesData.page < moviesData.total_pages)
        setHasMoreTV(tvData.page < tvData.total_pages)
        setIsFavorite(isFavoriteStudio(Number(id)))
      } catch (error) {
        console.error('Failed to load company data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCompanyData()
  }, [id])

  const handleFavoriteClick = () => {
    if (!company) return
    
    const newState = toggleFavoriteStudio({
      id: company.id,
      name: company.name,
      logo_path: company.logo_path
    })
    
    setIsFavorite(newState)
  }

  // Load more content
  const loadMore = useCallback(async () => {
    if (!id || loadingMore || loading) return

    const needsMoreMovies = (contentType === 'all' || contentType === 'movies') && hasMoreMovies
    const needsMoreTV = (contentType === 'all' || contentType === 'tv') && hasMoreTV

    if (!needsMoreMovies && !needsMoreTV) return

    setLoadingMore(true)
    try {
      const promises: Promise<any>[] = []

      if (needsMoreMovies) {
        promises.push(fetchCompanyMovies(Number(id), currentMoviePage + 1))
      }
      if (needsMoreTV) {
        promises.push(fetchCompanyTVShows(Number(id), currentTVPage + 1))
      }

      const results = await Promise.all(promises)
      let resultIndex = 0

      if (needsMoreMovies) {
        const moviesData = results[resultIndex++]
        setMovies(prev => [...prev, ...moviesData.results])
        setCurrentMoviePage(prev => prev + 1)
        setHasMoreMovies(moviesData.page < moviesData.total_pages)
      }

      if (needsMoreTV) {
        const tvData = results[resultIndex++]
        setTVShows(prev => [...prev, ...tvData.results])
        setCurrentTVPage(prev => prev + 1)
        setHasMoreTV(tvData.page < tvData.total_pages)
      }
    } catch (error) {
      console.error('Failed to load more content:', error)
    } finally {
      setLoadingMore(false)
    }
  }, [id, currentMoviePage, currentTVPage, contentType, hasMoreMovies, hasMoreTV, loadingMore, loading])

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (loading) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [loadMore, loading])

  // Get filtered and sorted content
  const getContent = (): (Movie | TVShow)[] => {
    let content: (Movie | TVShow)[] = []

    if (contentType === 'movies') {
      content = movies
    } else if (contentType === 'tv') {
      content = tvShows
    } else {
      content = [...movies, ...tvShows]
    }

    // Sort content
    return content.sort((a, b) => {
      const aDate = 'release_date' in a ? a.release_date : a.first_air_date
      const bDate = 'release_date' in b ? b.release_date : b.first_air_date

      switch (sortOption) {
        case 'latest':
          return new Date(bDate || '').getTime() - new Date(aDate || '').getTime()
        case 'oldest':
          return new Date(aDate || '').getTime() - new Date(bDate || '').getTime()
        case 'rating':
          return b.vote_average - a.vote_average
        case 'popularity':
          return b.popularity - a.popularity
        default:
          return 0
      }
    })
  }

  // Group content by year for timeline view
  const getTimelineGroups = (): TimelineGroup[] => {
    const content = getContent()
    const groups: Record<string, (Movie | TVShow)[]> = {}

    content.forEach(item => {
      const date = 'release_date' in item ? item.release_date : item.first_air_date
      const year = date ? new Date(date).getFullYear() : 'Unknown'
      const yearKey = year.toString()

      if (!groups[yearKey]) {
        groups[yearKey] = []
      }
      groups[yearKey].push(item)
    })

    return Object.entries(groups)
      .map(([year, items]) => ({
        year: year === 'Unknown' ? 'Unknown' : parseInt(year),
        items
      }))
      .sort((a, b) => {
        if (a.year === 'Unknown') return 1
        if (b.year === 'Unknown') return -1
        return sortOption === 'latest' 
          ? (b.year as number) - (a.year as number)
          : (a.year as number) - (b.year as number)
      })
  }

  if (loading) return <LoadingSpinner />
  if (!company) return <div className="text-center py-20">Studio not found</div>

  const timelineGroups = getTimelineGroups()
  const totalContent = movies.length + tvShows.length

  return (
    <div className="min-h-screen pt-16">
      <SEO
        title={company.name}
        description={company.description || `Browse content from ${company.name}`}
      />

      {/* Studio Header */}
      <section className="relative py-12 md:py-20 bg-gradient-to-b from-primary/20 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
            {/* Studio Logo */}
            {company.logo_path && (
              <div className="flex-shrink-0 w-48 md:w-64 glass-effect rounded-xl p-6 md:p-8 bg-white/10">
                <img
                  src={getImageUrl(company.logo_path, 'w200')}
                  alt={company.name}
                  className="w-full h-auto object-contain"
                />
              </div>
            )}

            {/* Studio Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start gap-4 mb-4 md:mb-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gradient">
                  {company.name}
                </h1>
                <button
                  onClick={handleFavoriteClick}
                  className="p-3 md:p-4 rounded-full glass-effect hover:bg-primary/20 
                           transition-all duration-300 hover:scale-110 active:scale-95
                           focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {isFavorite ? (
                    <FaHeart className="text-primary text-xl md:text-2xl" />
                  ) : (
                    <FaRegHeart className="text-white text-xl md:text-2xl" />
                  )}
                </button>
              </div>
              
              {company.description && (
                <p className="text-base md:text-lg text-gray-300 mb-6 leading-relaxed">
                  {company.description}
                </p>
              )}

              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm md:text-base text-gray-400">
                {company.headquarters && (
                  <div className="flex items-center space-x-2">
                    <FaMapMarkerAlt className="text-primary" />
                    <span>{company.headquarters}</span>
                  </div>
                )}
                {company.origin_country && (
                  <div className="flex items-center space-x-2">
                    <FaBuilding className="text-primary" />
                    <span>{company.origin_country}</span>
                  </div>
                )}
                {company.homepage && (
                  <a
                    href={company.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 hover:text-primary transition-colors"
                  >
                    <FaGlobe className="text-primary" />
                    <span>Official Website</span>
                  </a>
                )}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
                <div className="glass-effect rounded-lg px-4 py-2">
                  <div className="text-2xl md:text-3xl font-bold text-primary">{movies.length}+</div>
                  <div className="text-xs md:text-sm text-gray-400">Movies</div>
                </div>
                <div className="glass-effect rounded-lg px-4 py-2">
                  <div className="text-2xl md:text-3xl font-bold text-primary">{tvShows.length}+</div>
                  <div className="text-xs md:text-sm text-gray-400">TV Shows</div>
                </div>
                <div className="glass-effect rounded-lg px-4 py-2">
                  <div className="text-2xl md:text-3xl font-bold text-primary">{totalContent}+</div>
                  <div className="text-xs md:text-sm text-gray-400">Total Titles</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          {/* Content Type Tabs */}
          <div className="flex space-x-2 glass-effect rounded-lg p-1 w-full sm:w-auto">
            <button
              onClick={() => setContentType('all')}
              className={`px-4 py-2 rounded-md transition-all text-sm md:text-base ${
                contentType === 'all'
                  ? 'bg-primary text-white'
                  : 'hover:bg-white/10'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setContentType('movies')}
              className={`px-4 py-2 rounded-md transition-all text-sm md:text-base ${
                contentType === 'movies'
                  ? 'bg-primary text-white'
                  : 'hover:bg-white/10'
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => setContentType('tv')}
              className={`px-4 py-2 rounded-md transition-all text-sm md:text-base ${
                contentType === 'tv'
                  ? 'bg-primary text-white'
                  : 'hover:bg-white/10'
              }`}
            >
              TV Shows
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-sm text-gray-400">Sort by:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="glass-effect rounded-lg px-4 py-2 text-sm md:text-base
                       focus:outline-none focus:ring-2 focus:ring-primary
                       bg-transparent border border-white/20 cursor-pointer"
            >
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
              <option value="rating">Rating</option>
              <option value="popularity">Popularity</option>
            </select>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="space-y-8 md:space-y-12">
          {timelineGroups.map(group => (
            <div key={group.year}>
              <TimelineSeparator year={group.year} />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {group.items.map(item => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    mediaType={'title' in item ? 'movie' : 'tv'}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Loading More */}
        {loadingMore && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 mt-8">
            {[...Array(12)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Infinite Scroll Trigger */}
        <div ref={loadMoreRef} className="h-20" />
      </section>
    </div>
  )
}

export default StudioDetailPage

