import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FaStar, FaCalendar, FaClock, FaArrowLeft, FaInfoCircle } from 'react-icons/fa'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { VideoPlayer } from '../components/VideoPlayer'
import { ServerSelector } from '../components/ServerSelector'
import {
  fetchMovieDetails,
  fetchSimilarMovies,
  getImageUrl,
  fetchMovieContentRatings,
} from '../services/tmdb'
import { getMovieEmbedUrl } from '../utils/vidsrc'
import { addToWatchHistory } from '../utils/watchHistory'
import { getRatingColor, getRatingLabel } from '../utils/rating'
import type { MovieDetails, Movie } from '../types/tmdb'

interface StreamingServer {
  id: string
  name: string
  description: string
  isActive: boolean
  getMovieUrl: (tmdbId: number) => string
  getTVUrl: (tmdbId: number, season: number, episode: number) => string
}

const WatchMoviePage = () => {
  const { id } = useParams<{ id: string }>()
  const [movie, setMovie] = useState<MovieDetails | null>(null)
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [embedUrl, setEmbedUrl] = useState<string>('')
  const [rating, setRating] = useState<string | null>(null)

  useEffect(() => {
    const loadMovieData = async () => {
      if (!id) return

      setLoading(true)
      try {
        const [movieData, similar, ratingData] = await Promise.all([
          fetchMovieDetails(Number(id)),
          fetchSimilarMovies(Number(id)),
          fetchMovieContentRatings(Number(id)),
        ])

        setMovie(movieData)
        setSimilarMovies(similar)

        // Process rating
        const usRating = ratingData.results.find(r => r.iso_3166_1 === 'US')
        if (usRating && usRating.release_dates.length > 0) {
          setRating(usRating.release_dates[0].certification)
        } else if (ratingData.results.length > 0 && ratingData.results[0].release_dates.length > 0) {
          setRating(ratingData.results[0].release_dates[0].certification)
        }

        // Add to watch history
        addToWatchHistory({
          id: movieData.id,
          title: movieData.title,
          poster_path: movieData.poster_path,
          backdrop_path: movieData.backdrop_path,
          mediaType: 'movie',
          vote_average: movieData.vote_average
        })
      } catch (error) {
        console.error('Failed to load movie data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMovieData()
  }, [id])

  // Handle server change
  const handleServerChange = (server: StreamingServer) => {
    if (id) {
      const url = server.getMovieUrl(Number(id))
      setEmbedUrl(url)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!movie) return <div className="text-center py-20">Movie not found</div>

  const runtime = `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
  const releaseYear = new Date(movie.release_date).getFullYear()

  return (
    <div className="min-h-screen pt-20 pb-12 bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header: Back Button & Server Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <Link
            to={`/movie/${id}`}
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
        <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 mb-8 relative z-0">
          <VideoPlayer
            embedUrl={embedUrl || getMovieEmbedUrl(movie.id)}
            title={movie.title}
          />
        </div>

        {/* Movie Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 leading-tight">{movie.title}</h1>
            {movie.tagline && (
              <p className="text-lg text-gray-400 italic mb-4">"{movie.tagline}"</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-6">
              {rating && (
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded border ${getRatingColor(rating)}`}>
                  <span className="font-bold">{getRatingLabel(rating)}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
                <FaStar />
                <span className="font-bold">{movie.vote_average.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FaCalendar className="text-gray-500" />
                <span>{releaseYear}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FaClock className="text-gray-500" />
                <span>{runtime}</span>
              </div>
            </div>

            <div className="glass-effect-strong rounded-xl p-6 border border-white/5">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FaInfoCircle className="text-primary" />
                Overview
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {movie.overview}
              </p>

              <div className="flex flex-wrap gap-2 mt-6">
                {movie.genres.map((genre) => (
                  <Link
                    key={genre.id}
                    to={`/genre/movie?genre=${genre.id}`}
                    className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-gray-300 transition-colors"
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar (Similar Movies) */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 rounded-xl border border-white/10 p-4">
              <h3 className="text-lg font-bold mb-4 px-2 border-l-4 border-primary">
                You May Also Like
              </h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
                {similarMovies.slice(0, 5).map((similar) => (
                  <Link
                    key={similar.id}
                    to={`/movie/${similar.id}`}
                    className="flex gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <div className="w-16 aspect-[2/3] flex-shrink-0 rounded overflow-hidden bg-gray-800">
                      <img
                        src={getImageUrl(similar.poster_path, 'w185')}
                        alt={similar.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                      <h4 className="font-medium text-sm text-gray-200 group-hover:text-primary truncate transition-colors">
                        {similar.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                        <FaStar className="text-yellow-500/80" />
                        <span>{similar.vote_average.toFixed(1)}</span>
                        <span>•</span>
                        <span>{new Date(similar.release_date).getFullYear()}</span>
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

export default WatchMoviePage

