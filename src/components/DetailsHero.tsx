import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaStar, FaPlay, FaCalendar, FaClock, FaTv, FaHeart, FaRegHeart, FaShareAlt, FaDownload } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { getImageUrl, fetchMovieContentRatings, fetchTVContentRatings } from '../services/tmdb'
import { ShareButton } from './ShareButton'
import { getRatingColor, getRatingLabel } from '../utils/rating'
import type { MovieDetails, TVShowDetails, Video } from '../types/tmdb'

interface DetailsHeroProps {
    item: MovieDetails | TVShowDetails
    type: 'movie' | 'tv'
    trailer: Video | null
    onPlay: () => void
    onTrailer: () => void
    inWatchlist: boolean
    onToggleWatchlist: () => void
    onDownload?: () => void
}

export const DetailsHero = ({
    item,
    type,
    trailer,
    onPlay,
    onTrailer,
    inWatchlist,
    onToggleWatchlist,
    onDownload,
}: DetailsHeroProps) => {
    const [rating, setRating] = useState<string | null>(null)
    const isMovie = type === 'movie'
    const title = isMovie ? (item as MovieDetails).title : (item as TVShowDetails).name
    const releaseDate = isMovie ? (item as MovieDetails).release_date : (item as TVShowDetails).first_air_date
    const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A'

    const runtime = isMovie
        ? `${Math.floor((item as MovieDetails).runtime / 60)}h ${(item as MovieDetails).runtime % 60}m`
        : (item as TVShowDetails).episode_run_time?.[0]
            ? `${(item as TVShowDetails).episode_run_time[0]} min`
            : 'N/A'

    const backdropUrl = getImageUrl(item.backdrop_path, 'original')
    const posterUrl = getImageUrl(item.poster_path, 'w500')

    useEffect(() => {
        const fetchRating = async () => {
            try {
                if (isMovie) {
                    const data = await fetchMovieContentRatings(item.id)
                    // Try to find US rating first, then fallback to first available
                    const usRating = data.results.find(r => r.iso_3166_1 === 'US')
                    if (usRating && usRating.release_dates.length > 0) {
                        setRating(usRating.release_dates[0].certification)
                    } else if (data.results.length > 0 && data.results[0].release_dates.length > 0) {
                        setRating(data.results[0].release_dates[0].certification)
                    }
                } else {
                    const data = await fetchTVContentRatings(item.id)
                    const usRating = data.results.find(r => r.iso_3166_1 === 'US')
                    if (usRating) {
                        setRating(usRating.rating)
                    } else if (data.results.length > 0) {
                        setRating(data.results[0].rating)
                    }
                }
            } catch (error) {
                console.error('Failed to fetch rating:', error)
            }
        }

        fetchRating()
    }, [item.id, isMovie])

    return (
        <div className="relative min-h-[85vh] md:min-h-[80vh] w-full overflow-hidden">
            {/* Backdrop Image */}
            <div className="absolute inset-0">
                <motion.div
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="w-full h-full"
                >
                    <img
                        src={backdropUrl}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                </motion.div>
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
            </div>

            {/* Content Container */}
            <div className="absolute inset-0 flex items-end pb-12 md:pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="flex flex-col md:flex-row gap-8 items-end md:items-center">

                        {/* Poster (Hidden on mobile, visible on tablet+) */}
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="hidden md:block flex-shrink-0 w-64 lg:w-72 rounded-xl overflow-hidden shadow-2xl border border-white/10"
                        >
                            <img
                                src={posterUrl}
                                alt={title}
                                className="w-full h-full object-cover"
                            />
                        </motion.div>

                        {/* Text Content */}
                        <div className="flex-1 w-full space-y-6">
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                            >
                                {/* Title */}
                                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-2 leading-tight tracking-tight">
                                    {title}
                                </h1>

                                {/* Tagline */}
                                {item.tagline && (
                                    <p className="text-lg md:text-xl text-gray-300 italic font-light mb-4 opacity-90">
                                        "{item.tagline}"
                                    </p>
                                )}

                                {/* Metadata Badges */}
                                <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-6 text-sm md:text-base font-medium">
                                    {rating && (
                                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border backdrop-blur-sm ${getRatingColor(rating)}`}>
                                            <span>{getRatingLabel(rating)}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5 text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20 backdrop-blur-sm">
                                        <FaStar />
                                        <span>{item.vote_average.toFixed(1)}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-gray-300 bg-white/5 px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm">
                                        <FaCalendar className="text-gray-400" />
                                        <span>{releaseYear}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-gray-300 bg-white/5 px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm">
                                        {isMovie ? <FaClock className="text-gray-400" /> : <FaTv className="text-gray-400" />}
                                        <span>{isMovie ? runtime : `${(item as TVShowDetails).number_of_seasons} Seasons`}</span>
                                    </div>
                                </div>

                                {/* Genres */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {item.genres.map((genre) => (
                                        <Link
                                            key={genre.id}
                                            to={`/genre/${type}?genre=${genre.id}`}
                                            className="px-3 py-1 text-xs md:text-sm text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors duration-300"
                                        >
                                            {genre.name}
                                        </Link>
                                    ))}
                                </div>

                                {/* Overview (Desktop) */}
                                <p className="hidden md:block text-gray-300 text-lg leading-relaxed max-w-3xl mb-8 line-clamp-3">
                                    {item.overview}
                                </p>

                                {/* Overview (Mobile - Collapsed/Shortened) */}
                                <p className="md:hidden text-gray-300 text-sm leading-relaxed mb-6 line-clamp-3">
                                    {item.overview}
                                </p>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full">
                                    <button
                                        onClick={onPlay}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-primary/25 min-w-[160px]"
                                    >
                                        <FaPlay className="text-sm" />
                                        <span>Watch Now</span>
                                    </button>

                                    {trailer && (
                                        <button
                                            onClick={onTrailer}
                                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-xl font-semibold backdrop-blur-md border border-white/10 transition-all duration-300 min-w-[120px]"
                                        >
                                            <span>Trailer</span>
                                        </button>
                                    )}

                                    <button
                                        onClick={onToggleWatchlist}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-xl font-semibold backdrop-blur-md border border-white/10 transition-all duration-300 min-w-[120px]"
                                    >
                                        {inWatchlist ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                                        <span>List</span>
                                    </button>

                                    <ShareButton
                                        title={title}
                                        text={`Check out ${title} on SanuFlix`}
                                        url={window.location.href}
                                        className="flex-none flex items-center justify-center w-[60px] h-[60px] bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-md border border-white/10 transition-all duration-300"
                                    >
                                        <FaShareAlt className="text-lg" />
                                    </ShareButton>

                                    {onDownload && (
                                        <button
                                            onClick={onDownload}
                                            className="flex-none flex items-center justify-center w-[60px] h-[60px] bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-md border border-white/10 transition-all duration-300"
                                            title="Download"
                                        >
                                            <FaDownload className="text-lg" />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
