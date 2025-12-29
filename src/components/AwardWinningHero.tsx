import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaPlay, FaStar, FaCalendar, FaClock, FaHeart, FaRegHeart, FaShareAlt, FaDownload, FaVideo, FaVideoSlash, FaVolumeUp, FaVolumeMute } from 'react-icons/fa'
import { getImageUrl } from '../services/tmdb'
import { ShareButton } from './ShareButton'
import { getRatingColor, getRatingLabel } from '../utils/rating'
import type { MovieDetails, TVShowDetails, Video } from '../types/tmdb'

interface AwardWinningHeroProps {
    item: MovieDetails | TVShowDetails
    type: 'movie' | 'tv'
    trailer: Video | null
    onPlay: () => void
    onTrailer: () => void
    inWatchlist: boolean
    onToggleWatchlist: () => void
    onDownload?: () => void
    rating?: string | null
}

export const AwardWinningHero = ({
    item,
    type,
    trailer,
    onPlay,
    onTrailer,
    inWatchlist,
    onToggleWatchlist,
    onDownload,
    rating
}: AwardWinningHeroProps) => {
    const [isTrailerEnabled, setIsTrailerEnabled] = useState(true)
    const [isMuted, setIsMuted] = useState(true)
    const [showVideo, setShowVideo] = useState(false)
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const videoTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

    // Handle Video Autoplay
    useEffect(() => {
        if (videoTimeoutRef.current) clearTimeout(videoTimeoutRef.current)
        setShowVideo(false)
        setIsMuted(true)

        if (isTrailerEnabled && trailer) {
            videoTimeoutRef.current = setTimeout(() => {
                setShowVideo(true)
            }, 2000) // Delay start to allow image to load first
        }

        return () => {
            if (videoTimeoutRef.current) clearTimeout(videoTimeoutRef.current)
        }
    }, [trailer, isTrailerEnabled, item.id])

    const toggleMute = () => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
            const action = isMuted ? 'unMute' : 'mute'
            iframeRef.current.contentWindow.postMessage(JSON.stringify({
                event: 'command',
                func: action,
                args: []
            }), '*')
            setIsMuted(!isMuted)
        }
    }

    return (
        <div className="relative h-[85vh] md:h-[90vh] w-full overflow-hidden group">
            {/* Background Layer */}
            <div className="absolute inset-0 bg-black">
                <AnimatePresence mode="wait">
                    {/* Video Background */}
                    {showVideo && trailer ? (
                        <motion.div
                            key="video"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                            className="absolute inset-0 w-full h-full"
                        >
                            <div className="absolute inset-0 pointer-events-none scale-[1.35] md:scale-110">
                                <iframe
                                    ref={iframeRef}
                                    src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&controls=0&start=10&loop=1&playlist=${trailer.key}&enablejsapi=1&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`}
                                    className="w-full h-full object-cover"
                                    allow="autoplay; encrypted-media"
                                    title="Background Video"
                                />
                            </div>
                        </motion.div>
                    ) : (
                        /* Image Background */
                        <motion.div
                            key="image"
                            initial={{ scale: 1.1, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8 }}
                            className="absolute inset-0"
                        >
                            <img
                                src={backdropUrl}
                                alt={title}
                                className="w-full h-full object-cover"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Cinematic Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/30 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
            </div>

            {/* Content Layer */}
            <div className="absolute inset-0 flex flex-col justify-end pb-12 md:pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">

                    {/* Poster (Desktop Only) */}
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="hidden lg:block lg:col-span-3 xl:col-span-3"
                    >
                        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10 group-hover:shadow-[0_0_60px_rgba(236,72,153,0.3)] transition-all duration-500">
                            <img src={posterUrl} alt={title} className="w-full h-full object-cover" />
                        </div>
                    </motion.div>

                    {/* Text Content */}
                    <div className="lg:col-span-9 xl:col-span-8 space-y-6">
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                        >
                            {/* Badges */}
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                {rating && (
                                    <span className={`px-3 py-1 rounded-md text-xs font-bold border backdrop-blur-md ${getRatingColor(rating)}`}>
                                        {getRatingLabel(rating)}
                                    </span>
                                )}
                                <span className="px-3 py-1 rounded-md text-xs font-bold bg-white/10 border border-white/10 text-white backdrop-blur-md uppercase tracking-wider">
                                    {isMovie ? 'Movie' : 'TV Series'}
                                </span>
                                {item.status && (
                                    <span className="px-3 py-1 rounded-md text-xs font-bold bg-pink-500/20 border border-pink-500/30 text-pink-400 backdrop-blur-md uppercase tracking-wider">
                                        {item.status}
                                    </span>
                                )}
                            </div>

                            {/* Title */}
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[0.9] tracking-tight mb-2 drop-shadow-2xl">
                                {title}
                            </h1>

                            {/* Tagline */}
                            {item.tagline && (
                                <p className="text-lg md:text-2xl text-gray-300 font-light italic mb-6 opacity-90 drop-shadow-lg">
                                    "{item.tagline}"
                                </p>
                            )}

                            {/* Metadata */}
                            <div className="flex flex-wrap items-center gap-4 md:gap-8 text-sm md:text-base text-gray-300 font-medium mb-8">
                                <div className="flex items-center gap-2">
                                    <FaStar className="text-yellow-400" />
                                    <span className="text-white">{item.vote_average.toFixed(1)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaCalendar className="text-pink-400" />
                                    <span>{releaseYear}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaClock className="text-violet-400" />
                                    <span>{isMovie ? runtime : `${(item as TVShowDetails).number_of_seasons} Seasons`}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap items-center gap-4">
                                <button
                                    onClick={onPlay}
                                    className="flex-1 sm:flex-none px-8 py-4 bg-white text-black rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)] group/btn"
                                >
                                    <FaPlay className="text-pink-600 group-hover/btn:text-black transition-colors" />
                                    <span>Watch Now</span>
                                </button>

                                <button
                                    onClick={onTrailer}
                                    className="px-6 py-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-white font-semibold flex items-center gap-2 hover:bg-white/20 hover:scale-105 active:scale-95 transition-all"
                                >
                                    <span>Trailer</span>
                                </button>

                                <button
                                    onClick={onToggleWatchlist}
                                    className="px-6 py-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-white font-semibold flex items-center gap-2 hover:bg-white/20 hover:scale-105 active:scale-95 transition-all"
                                >
                                    {inWatchlist ? <FaHeart className="text-red-500 text-xl" /> : <FaRegHeart className="text-xl" />}
                                </button>

                                <ShareButton
                                    title={title}
                                    text={`Check out ${title} on SanuFlix`}
                                    url={window.location.href}
                                    className="px-6 py-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-white/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                                >
                                    <FaShareAlt className="text-xl" />
                                </ShareButton>

                                {onDownload && (
                                    <button
                                        onClick={onDownload}
                                        className="px-6 py-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-white/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                                    >
                                        <FaDownload className="text-xl" />
                                    </button>
                                )}

                                {/* Video Controls */}
                                <div className="flex items-center gap-2 ml-auto sm:ml-4">
                                    <button
                                        onClick={() => setIsTrailerEnabled(!isTrailerEnabled)}
                                        className={`p-4 rounded-full border border-white/10 transition-all hover:scale-105 active:scale-95 flex items-center justify-center ${isTrailerEnabled ? 'bg-pink-500/20 text-pink-500 border-pink-500/50' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                        title={isTrailerEnabled ? "Disable Background Trailer" : "Enable Background Trailer"}
                                    >
                                        {isTrailerEnabled ? <FaVideoSlash className="text-lg" /> : <FaVideo className="text-lg" />}
                                    </button>

                                    {showVideo && (
                                        <button
                                            onClick={toggleMute}
                                            className="p-4 rounded-full border border-white/10 bg-white/10 text-white hover:bg-white/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
                                            title={isMuted ? "Unmute" : "Mute"}
                                        >
                                            {isMuted ? <FaVolumeMute className="text-lg" /> : <FaVolumeUp className="text-lg" />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}
