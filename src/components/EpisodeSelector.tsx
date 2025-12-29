import { useState, useEffect } from 'react'
import { FaPlay } from 'react-icons/fa'
import { fetchSeasonDetails } from '../services/tmdb'
import type { Episode } from '../types/tmdb'

interface EpisodeSelectorProps {
  tvId: number
  seasonCount: number
  onEpisodeSelect: (season: number, episode: number) => void
  currentSeason: number
  currentEpisode: number
}

export const EpisodeSelector = ({
  tvId,
  seasonCount,
  onEpisodeSelect,
  currentSeason,
  currentEpisode,
}: EpisodeSelectorProps) => {
  const [selectedSeason, setSelectedSeason] = useState(currentSeason)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadEpisodes = async () => {
      setLoading(true)
      try {
        const data = await fetchSeasonDetails(tvId, selectedSeason)
        setEpisodes(data.episodes)
      } catch (error) {
        console.error('Failed to load episodes:', error)
      } finally {
        setLoading(false)
      }
    }

    loadEpisodes()
  }, [tvId, selectedSeason])

  const handleSeasonChange = (season: number) => {
    setSelectedSeason(season)
  }

  const handleEpisodeClick = (episode: number) => {
    onEpisodeSelect(selectedSeason, episode)
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Season Selector */}
      <div className="flex items-center space-x-2 md:space-x-3 overflow-x-auto scrollbar-hide pb-2 px-4 md:px-0">
        <span className="font-semibold text-xs md:text-sm whitespace-nowrap flex-shrink-0">Season:</span>
        <div className="flex space-x-2">
          {Array.from({ length: seasonCount }, (_, i) => i + 1).map((season) => (
            <button
              key={season}
              onClick={() => handleSeasonChange(season)}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-sm md:text-base font-semibold transition-all duration-300 whitespace-nowrap flex-shrink-0
                ${
                  selectedSeason === season
                    ? 'bg-gradient-primary text-white'
                    : 'glass-effect hover:bg-white/20 active:scale-95'
                }`}
              aria-label={`Select season ${season}`}
              aria-current={selectedSeason === season}
            >
              {season}
            </button>
          ))}
        </div>
      </div>

      {/* Episodes Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 px-4 md:px-0">
          {episodes.map((episode) => (
            <button
              key={episode.id}
              onClick={() => handleEpisodeClick(episode.episode_number)}
              className={`glass-effect rounded-lg overflow-hidden text-left 
                        hover:ring-2 active:scale-95 hover:ring-primary transition-all duration-300 group
                        ${
                          currentSeason === selectedSeason &&
                          currentEpisode === episode.episode_number
                            ? 'ring-2 ring-primary'
                            : ''
                        }`}
              aria-label={`Play episode ${episode.episode_number}: ${episode.name}`}
            >
              <div className="relative aspect-video bg-gray-800">
                {episode.still_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                    alt={episode.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-3xl md:text-4xl font-bold text-gray-600">
                      {episode.episode_number}
                    </span>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center 
                              opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary flex items-center justify-center">
                    <FaPlay className="text-white ml-0.5 md:ml-1 text-sm md:text-base" />
                  </div>
                </div>
              </div>

              <div className="p-2.5 md:p-3">
                <h4 className="font-semibold text-xs md:text-sm mb-1 line-clamp-1">
                  {episode.episode_number}. {episode.name}
                </h4>
                <p className="text-[10px] md:text-xs text-gray-400 line-clamp-2">{episode.overview}</p>
                {episode.runtime && (
                  <p className="text-[10px] md:text-xs text-gray-500 mt-1">{episode.runtime} min</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

