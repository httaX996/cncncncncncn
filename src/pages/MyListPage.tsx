import { useState, useEffect } from 'react'
import { FaHeart, FaFilm } from 'react-icons/fa'
import { MediaCard } from '../components/MediaCard'
import { CompanyCard } from '../components/CompanyCard'
import { getWatchlist } from '../utils/watchlist'
import { getFavoriteStudios } from '../utils/favoriteStudios'
import type { WatchlistItem } from '../utils/watchlist'
import type { ProductionCompany, Movie, TVShow } from '../types/tmdb'

const MyListPage = () => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [favoriteStudios, setFavoriteStudios] = useState<ProductionCompany[]>([])

  useEffect(() => {
    loadWatchlist()
    loadFavoriteStudios()

    const handleWatchlistUpdate = () => {
      loadWatchlist()
    }

    window.addEventListener('watchlist-updated', handleWatchlistUpdate)
    return () => window.removeEventListener('watchlist-updated', handleWatchlistUpdate)
  }, [])

  const loadWatchlist = () => {
    const items = getWatchlist()
    setWatchlist(items)
  }

  const loadFavoriteStudios = () => {
    const studios = getFavoriteStudios()
    // Convert FavoriteStudio to ProductionCompany format
    setFavoriteStudios(studios.map(studio => ({
      ...studio,
      origin_country: ''
    })))
  }

  return (
    <div className="min-h-screen pt-20 md:pt-24 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <FaHeart className="text-primary text-2xl md:text-3xl" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient">
              My List
            </h1>
          </div>
          <p className="text-sm md:text-base text-gray-400">
            {watchlist.length} {watchlist.length === 1 ? 'item' : 'items'} • {favoriteStudios.length} favorite {favoriteStudios.length === 1 ? 'studio' : 'studios'}
          </p>
        </div>

        {/* Favorite Studios */}
        {favoriteStudios.length > 0 && (
          <div className="mb-8 md:mb-12">
            <div className="flex items-center gap-2 mb-4 md:mb-6">
              <FaFilm className="text-primary text-xl md:text-2xl" />
              <h2 className="text-2xl md:text-3xl font-bold text-gradient">
                Favorite Studios
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {favoriteStudios.map((studio) => (
                <CompanyCard 
                  key={studio.id} 
                  company={studio} 
                  onFavoriteChange={loadFavoriteStudios}
                />
              ))}
            </div>
          </div>
        )}

        {/* Watchlist */}
        {watchlist.length > 0 && (
          <div className="mb-8 md:mb-12">
            <div className="flex items-center gap-2 mb-4 md:mb-6">
              <FaHeart className="text-primary text-xl md:text-2xl" />
              <h2 className="text-2xl md:text-3xl font-bold text-gradient">
                My Watchlist
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {watchlist.map((item) => {
                // Convert WatchlistItem to Movie/TVShow format
                const mediaItem = item.mediaType === 'movie' 
                  ? {
                      id: item.id,
                      title: item.title,
                      original_title: item.title,
                      poster_path: item.poster_path,
                      vote_average: item.vote_average || 0,
                      release_date: item.release_date || '',
                      overview: '',
                      backdrop_path: null,
                      genre_ids: [],
                      popularity: 0,
                      vote_count: 0,
                      adult: false,
                      original_language: '',
                      video: false,
                    } as Movie
                  : {
                      id: item.id,
                      name: item.title,
                      original_name: item.title,
                      poster_path: item.poster_path,
                      vote_average: item.vote_average || 0,
                      first_air_date: item.first_air_date || '',
                      overview: '',
                      backdrop_path: null,
                      genre_ids: [],
                      popularity: 0,
                      vote_count: 0,
                      origin_country: [],
                      original_language: '',
                    } as TVShow
                
                return (
                  <MediaCard 
                    key={`${item.mediaType}-${item.id}`}
                    item={mediaItem}
                    mediaType={item.mediaType}
                  />
                )
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {watchlist.length === 0 && favoriteStudios.length === 0 && (
          <div className="text-center py-12 md:py-20">
            <FaHeart className="text-6xl md:text-8xl text-gray-700 mx-auto mb-4 md:mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">
              Your list is empty
            </h2>
            <p className="text-sm md:text-base text-gray-400 mb-6 md:mb-8 max-w-md mx-auto">
              Start adding movies, TV shows, and studios to your list by clicking the heart icon
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyListPage

