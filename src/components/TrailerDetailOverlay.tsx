import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaHeart, FaRegHeart, FaPlay, FaTimes, FaStar } from 'react-icons/fa'
import { toggleWatchlist, isInWatchlist } from '../utils/watchlist'
import { getImageUrl } from '../services/tmdb'
import type { Movie, MovieDetails, TVShow, TVShowDetails } from '../types/tmdb'

interface TrailerDetailOverlayProps {
  item: Movie | TVShow | MovieDetails | TVShowDetails
  type: 'movie' | 'tv'
  isOpen: boolean
  onClose: () => void
}

export const TrailerDetailOverlay = ({ item, type, isOpen, onClose }: TrailerDetailOverlayProps) => {
  const navigate = useNavigate()
  const [inWatchlist, setInWatchlist] = useState(false)

  useEffect(() => {
    if (item) {
      setInWatchlist(isInWatchlist(item.id, type))
    }
  }, [item, type])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleEscape)
    }

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen || !item) return null

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newState = toggleWatchlist(item, type)
    setInWatchlist(newState)
  }

  const handleWatch = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/${type}/${item.id}/watch`)
  }

  const title = (item as Movie).title || (item as TVShow).name
  const date = (item as Movie).release_date || (item as TVShow).first_air_date
  const year = date ? new Date(date).getFullYear() : null
  const runtime = (item as MovieDetails).runtime || ((item as TVShowDetails).episode_run_time ? (item as TVShowDetails).episode_run_time[0] : null)

  let rating = null
  if (type === 'movie' && (item as MovieDetails)?.release_dates) {
    const data = (item as MovieDetails).release_dates
    const usRating = data?.results?.find(r => r.iso_3166_1 === 'US')
    if (usRating && usRating.release_dates.length > 0) {
      rating = usRating.release_dates[0].certification
    } else if (data?.results && data.results.length > 0 && data.results[0].release_dates.length > 0) {
      rating = data.results[0].release_dates[0].certification
    }
  } else if (type === 'tv' && (item as TVShowDetails)?.content_ratings) {
    const data = (item as TVShowDetails).content_ratings
    const usRating = data?.results?.find(r => r.iso_3166_1 === 'US')
    if (usRating) {
      rating = usRating.rating
    } else if (data?.results && data.results.length > 0) {
      rating = data.results[0].rating
    }
  }

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-end sm:items-center justify-center transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Content */}
      <div
        className={`relative w-full max-w-2xl bg-[#0f0f0f]/90 backdrop-blur-xl border border-white/10 
                   rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl transform transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1)
                   max-h-[85vh] flex flex-col
                   ${isOpen ? 'translate-y-0 scale-100' : 'translate-y-full sm:translate-y-10 sm:scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Handle Indicator */}
        <div className="w-full flex justify-center pt-3 pb-1 sm:hidden" onClick={onClose}>
          <div className="w-12 h-1.5 rounded-full bg-white/20" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-white/10 rounded-full transition-colors border border-white/5"
          aria-label="Close"
        >
          <FaTimes className="text-lg text-white/70 hover:text-white" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto custom-scrollbar">
          {/* Hero Image */}
          <div className="relative h-64 sm:h-80 w-full shrink-0">
            <img
              src={getImageUrl(item.backdrop_path || item.poster_path, 'w1280')}
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/50 to-transparent" />
          </div>

          {/* Body */}
          <div className="px-6 pb-8 -mt-12 relative z-10">
            {/* Title & Meta */}
            <div className="mb-6">
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 leading-tight tracking-tight">
                {title}
              </h2>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-gray-300">
                {year && (
                  <span className="bg-white/10 px-2 py-0.5 rounded text-white/90">{year}</span>
                )}
                {rating && (
                  <span className="bg-white/10 px-2 py-0.5 rounded text-white/90 border border-white/10">{rating}</span>
                )}
                {item.vote_average > 0 && (
                  <div className="flex items-center gap-1.5 text-yellow-400">
                    <FaStar />
                    <span className="text-white">{item.vote_average.toFixed(1)}</span>
                  </div>
                )}
                {runtime && (
                  <span className="text-gray-400">
                    {Math.floor(runtime / 60)}h {runtime % 60}m
                  </span>
                )}
                {type === 'tv' && (item as TVShowDetails).number_of_seasons && (
                  <span className="text-gray-400">
                    {(item as TVShowDetails).number_of_seasons} Season{(item as TVShowDetails).number_of_seasons !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            {/* Overview */}
            {item.overview && (
              <p className="text-gray-300 leading-relaxed text-base sm:text-lg font-light mb-8">
                {item.overview}
              </p>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleFavorite}
                className={`py-4 px-6 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2 border
                  ${inWatchlist
                    ? 'bg-primary/10 border-primary/50 text-primary hover:bg-primary/20'
                    : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                  }`}
              >
                {inWatchlist ? <FaHeart className="text-lg" /> : <FaRegHeart className="text-lg" />}
                <span>{inWatchlist ? 'In My List' : 'Add to List'}</span>
              </button>

              <button
                onClick={handleWatch}
                className="py-4 px-6 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2
                         bg-white text-black hover:bg-gray-200 shadow-lg shadow-white/5"
              >
                <FaPlay className="text-lg" />
                <span>Watch Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
