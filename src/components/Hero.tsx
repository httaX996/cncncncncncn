import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { FaPlay, FaInfoCircle, FaStar, FaChevronRight, FaChevronLeft, FaVideo, FaVideoSlash, FaVolumeUp, FaVolumeMute } from 'react-icons/fa'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { getImageUrl, fetchMovieVideos } from '../services/tmdb'
import type { Movie } from '../types/tmdb'

interface HeroProps {
  movies: Movie[]
}

export const Hero = ({ movies }: HeroProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [direction, setDirection] = useState(0)
  const [videoKey, setVideoKey] = useState<string | null>(null)
  const [isTrailerEnabled, setIsTrailerEnabled] = useState(true)
  const [isMuted, setIsMuted] = useState(true)

  const containerRef = useRef<HTMLDivElement>(null)
  const videoTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Auto-play logic
  useEffect(() => {
    if (!isAutoPlaying || movies.length === 0) return

    const interval = setInterval(() => {
      handleNext()
    }, 12000) // 12s slide duration

    return () => clearInterval(interval)
  }, [isAutoPlaying, currentIndex, movies.length, isTrailerEnabled]) // Added isTrailerEnabled to retrigger timer

  // Preload next images
  useEffect(() => {
    if (movies.length === 0) return
    const nextIdx = (currentIndex + 1) % movies.length
    const img = new Image()
    img.src = getImageUrl(movies[nextIdx].backdrop_path, 'original')
  }, [currentIndex, movies])

  // Fetch Trailer Logic
  useEffect(() => {
    setVideoKey(null)
    setIsMuted(true) // Always start muted
    if (videoTimeoutRef.current) clearTimeout(videoTimeoutRef.current)

    if (!isTrailerEnabled || !movies[currentIndex]) return

    // Delay fetching/playing to optimize performance
    videoTimeoutRef.current = setTimeout(async () => {
      try {
        const videos = await fetchMovieVideos(movies[currentIndex].id)
        const trailer = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer') ||
          videos.find(v => v.site === 'YouTube' && v.type === 'Teaser')

        if (trailer) {
          setVideoKey(trailer.key)
        }
      } catch (error) {
        console.error('Failed to fetch trailer', error)
      }
    }, 2000)

    return () => {
      if (videoTimeoutRef.current) clearTimeout(videoTimeoutRef.current)
    }
  }, [currentIndex, movies, isTrailerEnabled])

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

  const handleNext = useCallback(() => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % movies.length)
  }, [movies.length])

  const handlePrev = useCallback(() => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length)
  }, [movies.length])

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50
    if (info.offset.x < -swipeThreshold) {
      handleNext()
    } else if (info.offset.x > swipeThreshold) {
      handlePrev()
    }
  }

  if (!movies.length) return null

  const currentMovie = movies[currentIndex]
  const nextMovies = [
    movies[(currentIndex + 1) % movies.length],
    movies[(currentIndex + 2) % movies.length],
    movies[(currentIndex + 3) % movies.length]
  ]

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 1.1
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
        scale: { duration: 8, ease: "linear" }
      }
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 }
      }
    })
  }

  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.1 + 0.3, duration: 0.6, ease: "easeOut" }
    }),
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  }

  return (
    <section
      ref={containerRef}
      className="relative h-[90vh] md:h-screen w-full overflow-hidden bg-black group"
      aria-label="Featured movie"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Main Carousel Slider */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 w-full h-full"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={handleDragEnd}
        >
          {/* Background Image & Video */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Static Image */}
            <img
              src={getImageUrl(currentMovie.backdrop_path, 'original')}
              alt={currentMovie.title}
              className={`w-full h-full object-cover transition-opacity duration-1000 ${videoKey ? 'opacity-0' : 'opacity-100'}`}
              loading="eager"
              decoding="async"
            />

            {/* YouTube Background Video */}
            {videoKey && (
              <div className="absolute inset-0 w-full h-full pointer-events-none scale-[2] md:scale-[1.35]">
                <iframe
                  ref={iframeRef}
                  src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&mute=1&controls=0&start=10&loop=1&playlist=${videoKey}&enablejsapi=1&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`}
                  className="w-full h-full object-cover"
                  allow="autoplay; encrypted-media"
                  title="Background Video"
                />
              </div>
            )}

            {/* Cinematic Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1014] via-[#0f1014]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Content Layer */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end pb-24 md:pb-0 md:justify-center">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-end md:items-center">

          {/* Text Content */}
          <div className="lg:col-span-7 xl:col-span-8 max-w-4xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMovie.id}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-4 md:space-y-6"
              >
                {/* Badges / Metadata */}
                <motion.div custom={0} variants={textVariants} className="flex flex-wrap items-center gap-3 md:gap-4">
                  <div className="px-2 py-1 md:px-3 md:py-1 rounded bg-white/10 backdrop-blur-md border border-white/20 text-[10px] md:text-xs font-bold text-white uppercase tracking-wider">
                    Featured
                  </div>
                  <div className="flex items-center gap-2 text-yellow-400">
                    <FaStar className="text-sm md:text-base" />
                    <span className="text-white font-bold text-sm md:text-base">{currentMovie.vote_average.toFixed(1)}</span>
                  </div>
                  <span className="text-gray-300 text-sm md:text-base font-medium">
                    {new Date(currentMovie.release_date).getFullYear()}
                  </span>
                </motion.div>

                {/* Title */}
                <motion.h1
                  custom={1}
                  variants={textVariants}
                  className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-tight drop-shadow-2xl"
                >
                  {currentMovie.title}
                </motion.h1>

                {/* Overview */}
                <motion.p
                  custom={2}
                  variants={textVariants}
                  className="text-base sm:text-lg md:text-xl text-gray-200/90 line-clamp-3 md:line-clamp-4 max-w-2xl font-light leading-relaxed drop-shadow-lg"
                >
                  {currentMovie.overview}
                </motion.p>

                {/* Buttons */}
                <motion.div custom={3} variants={textVariants} className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4">
                  <Link
                    to={`/movie/${currentMovie.id}/watch`}
                    className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-base md:text-lg flex items-center justify-center gap-3 overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <FaPlay className="relative z-10 text-sm md:text-base group-hover:text-white transition-colors" />
                    <span className="relative z-10 group-hover:text-white transition-colors">Watch Now</span>
                  </Link>

                  <Link
                    to={`/movie/${currentMovie.id}`}
                    className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-full font-bold text-base md:text-lg flex items-center justify-center gap-3 hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
                  >
                    <FaInfoCircle className="text-lg" />
                    <span>More Info</span>
                  </Link>

                  <div className="flex items-center gap-3">
                    {/* Trailer Toggle Button */}
                    <button
                      onClick={() => setIsTrailerEnabled(!isTrailerEnabled)}
                      className={`p-3 md:px-4 md:py-4 rounded-full border border-white/10 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${isTrailerEnabled ? 'bg-pink-500/20 text-pink-500 border-pink-500/50' : 'bg-white/10 text-white hover:bg-white/20'}`}
                      title={isTrailerEnabled ? "Disable Background Trailer" : "Enable Background Trailer"}
                    >
                      {isTrailerEnabled ? <FaVideoSlash className="text-lg" /> : <FaVideo className="text-lg" />}
                    </button>

                    {/* Mute Toggle Button */}
                    {isTrailerEnabled && videoKey && (
                      <button
                        onClick={toggleMute}
                        className="p-3 md:px-4 md:py-4 rounded-full border border-white/10 bg-white/10 text-white hover:bg-white/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
                        title={isMuted ? "Unmute" : "Mute"}
                      >
                        {isMuted ? <FaVolumeMute className="text-lg" /> : <FaVolumeUp className="text-lg" />}
                      </button>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* "Up Next" Sidebar (Desktop) */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-4">
            <div className="bg-black/20 backdrop-blur-xl border border-white/5 rounded-3xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-white/90 font-bold text-lg">Up Next</h3>
                <div className="flex gap-2">
                  <button onClick={handlePrev} className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
                    <FaChevronLeft />
                  </button>
                  <button onClick={handleNext} className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
                    <FaChevronRight />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {nextMovies.map((movie, idx) => (
                  <button
                    key={`${movie.id}-${idx}`}
                    onClick={() => {
                      setDirection(1)
                      setCurrentIndex((currentIndex + 1 + idx) % movies.length)
                    }}
                    className="group flex items-center gap-4 w-full p-2 rounded-xl hover:bg-white/5 transition-all text-left"
                  >
                    <div className="relative w-28 aspect-video rounded-lg overflow-hidden shadow-lg">
                      <img
                        src={getImageUrl(movie.backdrop_path, 'w300')}
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold text-sm line-clamp-1 group-hover:text-pink-400 transition-colors">
                        {movie.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                        <FaStar className="text-yellow-500" />
                        <span>{movie.vote_average.toFixed(1)}</span>
                        <span>•</span>
                        <span>{new Date(movie.release_date).getFullYear()}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Indicators & Progress */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        {/* Mobile Dots */}
        <div className="flex lg:hidden justify-center gap-2 mb-6">
          {movies.slice(0, 5).map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDirection(idx > currentIndex ? 1 : -1)
                setCurrentIndex(idx)
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/30'
                }`}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="h-1 w-full bg-white/10">
          <motion.div
            key={currentIndex}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 12, ease: "linear" }}
            className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 shadow-[0_0_15px_rgba(236,72,153,0.7)]"
          />
        </div>
      </div>
    </section>
  )
}
