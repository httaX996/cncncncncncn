import { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { FaStar, FaCalendar, FaTv, FaArrowLeft, FaInfoCircle } from 'react-icons/fa'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { VideoPlayer } from '../components/VideoPlayer'
import { ServerSelector } from '../components/ServerSelector'
import { EpisodeSelector } from '../components/EpisodeSelector'
import {
  fetchTVShowDetails,
  fetchSimilarTVShows,
  getImageUrl,
  fetchTVContentRatings,
} from '../services/tmdb'
import { getTVShowEmbedUrl } from '../utils/vidsrc'
import { addToWatchHistory } from '../utils/watchHistory'
import { getRatingColor, getRatingLabel } from '../utils/rating'
import type { TVShowDetails, TVShow } from '../types/tmdb'

interface StreamingServer {
  id: string
  name: string
  description: string
  isActive: boolean
  getMovieUrl: (tmdbId: number) => string
  getTVUrl: (tmdbId: number, season: number, episode: number) => string
}

const WatchTVShowPage = () => {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const [show, setShow] = useState<TVShowDetails | null>(null)
  const [similarShows, setSimilarShows] = useState<TVShow[]>([])
  const [loading, setLoading] = useState(true)
  const [embedUrl, setEmbedUrl] = useState<string>('')
  const [rating, setRating] = useState<string | null>(null)

  const [selectedServer, setSelectedServer] = useState<StreamingServer | null>(null)

  // Get last watched episode from localStorage or default to S1E1
  const getLastWatched = () => {
    if (!id) return { season: 1, episode: 1 }
    const stored = localStorage.getItem(`lastWatched_${id}`)
    if (stored) {
      const { season, episode } = JSON.parse(stored)
      return { season, episode }
    }
    return { season: 1, episode: 1 }
  }

  const urlSeason = Number(searchParams.get('season'))
  const urlEpisode = Number(searchParams.get('episode'))
  const lastWatched = getLastWatched()

  const currentSeason = urlSeason || lastWatched.season
  const currentEpisode = urlEpisode || lastWatched.episode

  useEffect(() => {
    const loadShowData = async () => {
      if (!id) return

      setLoading(true)
      try {
        const [showData, similar, ratingData] = await Promise.all([
          fetchTVShowDetails(Number(id)),
          fetchSimilarTVShows(Number(id)),
          fetchTVContentRatings(Number(id)),
        ])

        setShow(showData)
        setSimilarShows(similar)

        // Process rating
        const usRating = ratingData.results.find(r => r.iso_3166_1 === 'US')
        if (usRating) {
          setRating(usRating.rating)
        } else if (ratingData.results.length > 0) {
          setRating(ratingData.results[0].rating)
        }
      } catch (error) {
        console.error('Failed to load TV show data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadShowData()
  }, [id])

  // Track episode viewing in watch history
  useEffect(() => {
    if (show && currentSeason && currentEpisode) {
      addToWatchHistory({
        id: show.id,
        title: show.name,
        poster_path: show.poster_path,
        backdrop_path: show.backdrop_path,
        mediaType: 'tv',
        season: currentSeason,
        episode: currentEpisode,
        vote_average: show.vote_average
      })
    }
  }, [show, currentSeason, currentEpisode])

  const handleEpisodeSelect = (season: number, episode: number) => {
    // Save to localStorage
    if (id) {
      localStorage.setItem(`lastWatched_${id}`, JSON.stringify({ season, episode }))
    }
    setSearchParams({ season: season.toString(), episode: episode.toString() })
  }

  // Handle server change
  const handleServerChange = (server: StreamingServer) => {
    setSelectedServer(server)
  }

  // Update embed URL when episode or server changes
  useEffect(() => {
    if (id && currentSeason && currentEpisode) {
      // Save current episode
      localStorage.setItem(`lastWatched_${id}`, JSON.stringify({
        season: currentSeason,
        episode: currentEpisode
      }))

      // Update embed URL
      if (selectedServer) {
        const url = selectedServer.getTVUrl(Number(id), currentSeason, currentEpisode)
        setEmbedUrl(url)
      } else {
        // Default fallback if no server selected yet (though ServerSelector should select one)
        setEmbedUrl(getTVShowEmbedUrl(Number(id), currentSeason, currentEpisode))
      }
    }
  }, [id, currentSeason, currentEpisode, selectedServer])

  if (loading) return <LoadingSpinner />
  if (!show) return <div className="text-center py-20">TV Show not found</div>

  const firstAirYear = new Date(show.first_air_date).getFullYear()

  return (
    <div className="min-h-screen pt-20 pb-12 bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header: Back Button & Server Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <Link
            to={`/tv/${id}`}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group self-start"
          >
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
              <FaArrowLeft className="text-sm group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="font-medium">Back to Details</span>
          </Link>

          <div className="w-full md:w-auto">
            <ServerSelector onServerChange={handleServerChange} />
          </div>
        </div>

        {/* Video Player */}
        <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 mb-6 relative z-0">
          <VideoPlayer
            embedUrl={embedUrl || getTVShowEmbedUrl(show.id, currentSeason, currentEpisode)}
            title={`${show.name} - S${currentSeason}E${currentEpisode}`}
          />
        </div>

        {/* Episode Navigation Bar */}
        <div className="flex items-center justify-between gap-4 bg-white/5 p-4 rounded-xl border border-white/10 mb-8">
          <button
            onClick={() => {
              if (currentEpisode > 1) {
                handleEpisodeSelect(currentSeason, currentEpisode - 1)
              } else if (currentSeason > 1) {
                handleEpisodeSelect(currentSeason - 1, 20) // Simplified logic
              }
            }}
            disabled={currentSeason === 1 && currentEpisode === 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            <FaArrowLeft className="text-xs" />
            <span>Previous</span>
          </button>

          <div className="text-center">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Now Playing</div>
            <div className="font-bold text-primary">S{currentSeason} : E{currentEpisode}</div>
          </div>

          <button
            onClick={() => handleEpisodeSelect(currentSeason, currentEpisode + 1)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium"
          >
            <span>Next</span>
            <FaArrowLeft className="text-xs rotate-180" />
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 leading-tight">{show.name}</h1>
              {show.tagline && (
                <p className="text-lg text-gray-400 italic mb-4">"{show.tagline}"</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-6">
                {rating && (
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded border ${getRatingColor(rating)}`}>
                    <span className="font-bold">{getRatingLabel(rating)}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
                  <FaStar />
                  <span className="font-bold">{show.vote_average.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FaCalendar className="text-gray-500" />
                  <span>{firstAirYear}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FaTv className="text-gray-500" />
                  <span>{show.number_of_seasons} Seasons</span>
                </div>
              </div>

              <div className="glass-effect-strong rounded-xl p-6 border border-white/5">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <FaInfoCircle className="text-primary" />
                  Overview
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {show.overview}
                </p>

                <div className="flex flex-wrap gap-2 mt-6">
                  {show.genres.map((genre) => (
                    <Link
                      key={genre.id}
                      to={`/genre/tv?genre=${genre.id}`}
                      className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-gray-300 transition-colors"
                    >
                      {genre.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Episode Selector */}
            <div className="glass-effect-strong rounded-xl p-6 border border-white/5">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FaTv className="text-primary" />
                Episodes
              </h3>
              <EpisodeSelector
                tvId={show.id}
                seasonCount={show.number_of_seasons}
                onEpisodeSelect={handleEpisodeSelect}
                currentSeason={currentSeason}
                currentEpisode={currentEpisode}
              />
            </div>
          </div>

          {/* Sidebar (Similar Shows) */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 rounded-xl border border-white/10 p-4">
              <h3 className="text-lg font-bold mb-4 px-2 border-l-4 border-primary">
                Similar Shows
              </h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
                {similarShows.slice(0, 5).map((similar) => (
                  <Link
                    key={similar.id}
                    to={`/tv/${similar.id}`}
                    className="flex gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <div className="w-16 aspect-[2/3] flex-shrink-0 rounded overflow-hidden bg-gray-800">
                      <img
                        src={getImageUrl(similar.poster_path, 'w185')}
                        alt={similar.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                      <h4 className="font-medium text-sm text-gray-200 group-hover:text-primary truncate transition-colors">
                        {similar.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                        <FaStar className="text-yellow-500/80" />
                        <span>{similar.vote_average.toFixed(1)}</span>
                        <span>•</span>
                        <span>{new Date(similar.first_air_date).getFullYear()}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WatchTVShowPage

