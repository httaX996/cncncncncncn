import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaClock, FaStar, FaTimes } from 'react-icons/fa'
import { getImageUrl } from '../services/tmdb'
import { getRecentWatchHistory, removeFromWatchHistory, type WatchHistoryItem } from '../utils/watchHistory'
import { formatDistanceToNow } from '../utils/formatters'

export const KeepWatching = () => {
  const [history, setHistory] = useState<WatchHistoryItem[]>([])

  const loadHistory = () => {
    const recentHistory = getRecentWatchHistory(10)
    setHistory(recentHistory)
  }

  useEffect(() => {
    loadHistory()

    const handleUpdate = () => {
      loadHistory()
    }

    window.addEventListener('watch-history-updated', handleUpdate)
    return () => window.removeEventListener('watch-history-updated', handleUpdate)
  }, [])

  const handleRemove = (item: WatchHistoryItem, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    removeFromWatchHistory(item.id, item.mediaType, item.season, item.episode)
  }

  if (history.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8" aria-labelledby="keep-watching-heading">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 id="keep-watching-heading" className="text-xl md:text-2xl lg:text-3xl font-bold text-gradient">
          Keep Watching
        </h2>
      </div>

      <div className="relative">
        <div 
          className="flex space-x-3 md:space-x-4 overflow-x-scroll pb-4 hide-scrollbar"
          style={{ 
            touchAction: 'pan-y pan-x',
            overscrollBehaviorX: 'contain'
          }}
        >
          {history.map((item) => {
            const watchUrl = item.mediaType === 'movie' 
              ? `/movie/${item.id}/watch`
              : `/tv/${item.id}/watch?season=${item.season}&episode=${item.episode}`

            return (
              <Link
                key={`${item.id}-${item.mediaType}-${item.season}-${item.episode}`}
                to={watchUrl}
                className="group relative flex-shrink-0 w-48 sm:w-56 md:w-64 rounded-lg md:rounded-xl overflow-hidden 
                         hover-glow transform active:scale-95 md:hover:scale-105 transition-all duration-300 ease-out 
                         focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label={`Continue watching ${item.title}${item.season ? ` S${item.season}E${item.episode}` : ''}`}
              >
                {/* Backdrop Image */}
                <div className="aspect-video relative overflow-hidden bg-gray-800 rounded-lg md:rounded-xl">
                  <img
                    src={getImageUrl(item.backdrop_path || item.poster_path, 'w500')}
                    srcSet={`
                      ${getImageUrl(item.backdrop_path || item.poster_path, 'w300')} 300w,
                      ${getImageUrl(item.backdrop_path || item.poster_path, 'w500')} 500w,
                      ${getImageUrl(item.backdrop_path || item.poster_path, 'w780')} 780w
                    `}
                    sizes="(max-width: 640px) 300px, (max-width: 768px) 500px, 780px"
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 md:group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  
                  {/* Remove Button */}
                  <button
                    onClick={(e) => handleRemove(item, e)}
                    className="absolute top-1.5 md:top-2 right-1.5 md:right-2 z-10 p-1.5 md:p-2 rounded-full 
                             bg-black/60 backdrop-blur-sm hover:bg-black/80 active:scale-90 
                             transition-all duration-200 opacity-0 group-hover:opacity-100"
                    aria-label="Remove from keep watching"
                  >
                    <FaTimes className="text-white text-xs md:text-sm" />
                  </button>
                  
                  {/* Rating Badge */}
                  {item.vote_average && (
                    <div className="absolute top-1.5 md:top-2 left-1.5 md:left-2 glass-effect rounded-full px-1.5 md:px-2 py-0.5 md:py-1 flex items-center space-x-1">
                      <FaStar className="text-yellow-400 text-[10px] md:text-xs" />
                      <span className="text-[10px] md:text-xs font-semibold">{item.vote_average.toFixed(1)}</span>
                    </div>
                  )}

                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3">
                    <h3 className="font-bold text-white text-sm md:text-base line-clamp-1 mb-1">{item.title}</h3>
                    
                    {item.mediaType === 'tv' && item.season && item.episode && (
                      <p className="text-primary text-xs md:text-sm font-semibold mb-1">
                        Continue S{item.season}E{item.episode}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-1 text-gray-400 text-[10px] md:text-xs">
                      <FaClock className="text-[8px] md:text-[10px]" />
                      <span>{formatDistanceToNow(new Date(item.lastWatchedAt))}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

