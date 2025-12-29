import { Link } from 'react-router-dom'
import { FaStar, FaPlus, FaCheck, FaPlay, FaInfoCircle } from 'react-icons/fa'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useMobileDetection, useMobilePerformance } from '../hooks/useMobileDetection'
import { getImageUrl, fetchMovieContentRatings, fetchTVContentRatings } from '../services/tmdb'
import { Movie, TVShow } from '../types/tmdb'
import { useState, useEffect, useRef } from 'react'
import { isInWatchlist, toggleWatchlist } from '../utils/watchlist'
import { getRatingColor, getRatingShortLabel } from '../utils/rating'

interface MediaCardProps {
  item: Movie | TVShow
  mediaType: 'movie' | 'tv'
  priority?: boolean
}

export const MediaCard = ({ item, mediaType, priority = false }: MediaCardProps) => {
  const isMobile = useMobileDetection()
  const { isLowEndDevice } = useMobilePerformance()
  const enableAnimations = !isLowEndDevice && !isMobile
  const [inWatchlist, setInWatchlist] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [rating, setRating] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  // Mouse position for spotlight and parallax
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Smooth spring physics for mouse movement
  const mouseX = useSpring(x, { stiffness: 500, damping: 100 })
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 })

  // Parallax effect for image (moves opposite to mouse)
  const imageX = useTransform(mouseX, [-0.5, 0.5], ["10%", "-10%"])
  const imageY = useTransform(mouseY, [-0.5, 0.5], ["10%", "-10%"])

  useEffect(() => {
    setInWatchlist(isInWatchlist(item.id, mediaType))

    const handleWatchlistUpdate = () => {
      setInWatchlist(isInWatchlist(item.id, mediaType))
    }

    window.addEventListener('watchlist-updated', handleWatchlistUpdate)
    return () => window.removeEventListener('watchlist-updated', handleWatchlistUpdate)
  }, [item.id, mediaType])

  // Fetch rating on mount
  useEffect(() => {
    let isMounted = true
    const fetchRating = async () => {
      try {
        if (mediaType === 'movie') {
          if ('adult' in item && item.adult) {
            if (isMounted) setRating('18+')
          }

          const data = await fetchMovieContentRatings(item.id)
          if (!isMounted) return

          const usRating = data.results.find(r => r.iso_3166_1 === 'US')
          if (usRating && usRating.release_dates.length > 0) {
            setRating(usRating.release_dates[0].certification)
          } else if (data.results.length > 0 && data.results[0].release_dates.length > 0) {
            setRating(data.results[0].release_dates[0].certification)
          }
        } else {
          const data = await fetchTVContentRatings(item.id)
          if (!isMounted) return

          const usRating = data.results.find(r => r.iso_3166_1 === 'US')
          if (usRating) {
            setRating(usRating.rating)
          } else if (data.results.length > 0) {
            setRating(data.results[0].rating)
          }
        }
      } catch (error) {
        // Silent fail
      }
    }
    fetchRating()
    return () => { isMounted = false }
  }, [item.id, mediaType])

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWatchlist(item, mediaType)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || !enableAnimations) return
    const rect = ref.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseXFromCenter = e.clientX - rect.left - width / 2
    const mouseYFromCenter = e.clientY - rect.top - height / 2

    x.set(mouseXFromCenter / width)
    y.set(mouseYFromCenter / height)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    x.set(0)
    y.set(0)
  }

  const title = 'title' in item ? item.title : item.name
  const date = 'release_date' in item ? item.release_date : item.first_air_date
  const year = date ? new Date(date).getFullYear() : ''
  const posterSize = isMobile ? 'w342' : 'w500'
  const posterUrl = getImageUrl(item.poster_path, posterSize)

  if (!enableAnimations) {
    // Simplified card for mobile/low-end
    return (
      <Link
        to={`/${mediaType}/${item.id}`}
        className="block relative flex-shrink-0 w-full"
      >
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-900 shadow-md">
          <img
            src={posterUrl}
            alt={title}
            className="w-full h-full object-cover"
            loading={priority ? 'eager' : 'lazy'}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

          {rating && (
            <div className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold border ${getRatingColor(rating)}`}>
              {getRatingShortLabel(rating)}
            </div>
          )}

          <div className="absolute bottom-2 left-2 right-2">
            <h3 className="text-white text-sm font-medium line-clamp-1">{title}</h3>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-300">{year}</span>
              <div className="flex items-center text-yellow-400">
                <FaStar className="w-3 h-3 mr-1" />
                <span className="text-xs font-medium">{item.vote_average.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  // Premium Desktop Card
  return (
    <motion.div
      ref={ref}
      className="relative flex-shrink-0 w-full aspect-[2/3] rounded-xl overflow-hidden bg-[#0a0a0a] cursor-pointer group"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <Link to={`/${mediaType}/${item.id}`} className="block w-full h-full">
        {/* Image Container with Parallax */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="w-[120%] h-[120%] absolute -top-[10%] -left-[10%]"
            style={{ x: imageX, y: imageY }}
          >
            <img
              src={posterUrl}
              alt={title}
              className="w-full h-full object-cover filter grayscale-[10%] group-hover:grayscale-0 transition-all duration-700 ease-out"
              loading={priority ? 'eager' : 'lazy'}
            />
          </motion.div>
        </div>

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

        {/* Spotlight / Glare Effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: useTransform(
              [mouseX, mouseY] as any,
              ([latestX, latestY]: number[]) => `radial-gradient(circle at ${50 + latestX * 100}% ${50 + latestY * 100}%, rgba(255,255,255,0.15) 0%, transparent 50%)`
            )
          }}
        />

        {/* Content Overlay */}
        <div className="absolute inset-0 p-4 flex flex-col justify-between z-10">
          {/* Top Badges - Slide Down Reveal */}
          <div className="flex justify-between items-start overflow-hidden">
            {rating && (
              <motion.div
                initial={{ y: -50 }}
                animate={{ y: isHovered ? 0 : -50 }}
                transition={{ duration: 0.4, ease: "circOut" }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRatingColor(rating)} backdrop-blur-md`}
              >
                {getRatingShortLabel(rating)}
              </motion.div>
            )}

            {item.vote_average > 0 && (
              <motion.div
                initial={{ y: -50 }}
                animate={{ y: isHovered ? 0 : -50 }}
                transition={{ duration: 0.4, delay: 0.1, ease: "circOut" }}
                className="ml-auto bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-yellow-400 border border-white/10 flex items-center gap-1"
              >
                <FaStar className="text-[10px]" />
                <span>{item.vote_average.toFixed(1)}</span>
              </motion.div>
            )}
          </div>

          {/* Center Actions */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex gap-3 pointer-events-auto"
                >
                  <button
                    className="p-3 rounded-full bg-white text-black hover:bg-pink-500 hover:text-white transition-colors shadow-lg transform hover:scale-110"
                    title="Play"
                  >
                    <FaPlay className="text-sm" />
                  </button>
                  <button
                    onClick={handleWatchlistClick}
                    className={`p-3 rounded-full border-2 transition-colors shadow-lg transform hover:scale-110 ${inWatchlist
                      ? 'bg-pink-600 border-pink-600 text-white'
                      : 'border-white text-white hover:bg-white/20'
                      }`}
                    title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                  >
                    {inWatchlist ? <FaCheck className="text-sm" /> : <FaPlus className="text-sm" />}
                  </button>
                  <button
                    className="p-3 rounded-full border-2 border-white text-white hover:bg-white/20 transition-colors shadow-lg transform hover:scale-110"
                    title="More Info"
                  >
                    <FaInfoCircle className="text-sm" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Info - Mask Reveal */}
          <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 ease-out">
            <div className="overflow-hidden mb-1">
              <motion.h3
                initial={{ y: "100%" }}
                animate={{ y: isHovered ? 0 : "100%" }}
                transition={{ duration: 0.4 }}
                className="text-white font-bold text-lg leading-tight line-clamp-2"
              >
                {title}
              </motion.h3>
              {/* Fallback title when not hovered */}
              <h3 className={`text-white font-medium text-sm line-clamp-1 absolute top-0 left-0 transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
                {title}
              </h3>
            </div>

            <div className="overflow-hidden flex justify-between items-center">
              <motion.p
                initial={{ y: "100%" }}
                animate={{ y: isHovered ? 0 : "100%" }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="text-gray-300 text-xs font-medium"
              >
                {year} • {mediaType === 'movie' ? 'Movie' : 'TV'}
              </motion.p>
              {/* Fallback year when not hovered */}
              <p className={`text-gray-400 text-xs absolute bottom-0 left-0 transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
                {year}
              </p>
            </div>
          </div>
        </div>

        {/* Border Reveal */}
        <div className="absolute inset-0 border border-white/0 group-hover:border-white/20 transition-colors duration-500 pointer-events-none" />
      </Link>
    </motion.div>
  )
}
