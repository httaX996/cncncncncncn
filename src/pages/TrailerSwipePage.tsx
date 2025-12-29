import { useState, useEffect, useRef, useCallback, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaHeart, FaRegHeart, FaPlay, FaTimes, FaVolumeUp, FaVolumeMute, FaStar, FaArrowDown, FaChevronDown } from 'react-icons/fa'
import { TrailerDetailOverlay } from '../components/TrailerDetailOverlay'
import { toggleWatchlist, isInWatchlist } from '../utils/watchlist'
import {
  fetchTrendingMovies,
  fetchPopularMovies,
  fetchTopRatedMovies,
  fetchNowPlayingMovies,
  fetchMovieVideos,
  fetchMovieDetails,
  discoverMovies,
  fetchTrendingTVShows,
  fetchPopularTVShows,
  fetchTopRatedTVShows,
  fetchOnTheAirTVShows,
  fetchTVShowVideos,
  fetchTVShowDetails,
  discoverTVShows,
} from '../services/tmdb'
import { SourcesDialog } from '../components/SourcesDialog'
import type { Movie, Video, MovieDetails, TVShow, TVShowDetails } from '../types/tmdb'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'

// --- Types ---

declare global {
  interface Window {
    YT: {
      Player: new (elementId: string, options: any) => any
      PlayerState: {
        PLAYING: number
        ENDED: number
        PAUSED: number
        BUFFERING: number
        CUED: number
      }
    }
    onYouTubeIframeAPIReady: () => void
  }
}

type MediaType = 'movie' | 'tv'

interface MediaWithTrailer {
  item: Movie | TVShow
  trailer: Video
  details?: MovieDetails | TVShowDetails
  type: MediaType
}

interface TrailerSlideProps {
  data: MediaWithTrailer
  isActive: boolean
  shouldLoad: boolean
  isMuted: boolean
  onMuteToggle: () => void
}

// --- Helper Functions ---

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// --- Components ---

// Individual Slide Component - Encapsulates Player Logic
const TrailerSlide = memo(({ data, isActive, shouldLoad, isMuted, onMuteToggle }: TrailerSlideProps) => {
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isReady = useRef(false)

  const { item, trailer, details, type } = data
  const title = (item as Movie).title || (item as TVShow).name
  const overview = item.overview

  // Initialize Player
  useEffect(() => {
    if (!shouldLoad || !window.YT || !window.YT.Player) return
    if (playerRef.current) return

    const playerId = `trailer-player-${item.id}`
    if (!containerRef.current) return
    containerRef.current.innerHTML = `<div id="${playerId}" style="width: 100%; height: 100%;"></div>`

    playerRef.current = new window.YT.Player(playerId, {
      videoId: trailer.key,
      playerVars: {
        autoplay: isActive ? 1 : 0,
        mute: isMuted ? 1 : 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        loop: 1,
        playlist: trailer.key,
        playsinline: 1,
      },
      events: {
        onReady: (event: any) => {
          isReady.current = true
          if (isActive) event.target.playVideo()
        },
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.ENDED) event.target.playVideo()
        }
      }
    })

    return () => {
      if (playerRef.current) {
        try { playerRef.current.destroy() } catch (e) { }
        playerRef.current = null
        isReady.current = false
      }
    }
  }, [shouldLoad, trailer.key, item.id])

  // Control Playback & Mute
  useEffect(() => {
    if (!playerRef.current || !isReady.current) return
    try {
      if (isActive) {
        const player = playerRef.current
        player.playVideo()
        const retryPlay = setInterval(() => {
          if (player && player.getPlayerState() !== window.YT.PlayerState.PLAYING) {
            if (!isMuted) {
              player.mute()
              if (!isMuted) player.unMute()
            }
            player.playVideo()
          } else {
            clearInterval(retryPlay)
          }
        }, 800)
        return () => clearInterval(retryPlay)
      } else {
        playerRef.current.pauseVideo()
      }
    } catch (e) { }
  }, [isActive, isMuted, onMuteToggle])

  // Sync Mute State
  useEffect(() => {
    if (!playerRef.current || !isReady.current) return
    try {
      if (isMuted) playerRef.current.mute()
      else playerRef.current.unMute()
    } catch (e) { }
  }, [isMuted])

  // Extract Metadata
  const releaseDate = (item as Movie).release_date || (item as TVShow).first_air_date
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null

  let rating = null
  if (type === 'movie' && (details as MovieDetails)?.release_dates) {
    const data = (details as MovieDetails).release_dates
    const usRating = data?.results?.find(r => r.iso_3166_1 === 'US')
    if (usRating && usRating.release_dates.length > 0) {
      rating = usRating.release_dates[0].certification
    } else if (data?.results && data.results.length > 0 && data.results[0].release_dates.length > 0) {
      rating = data.results[0].release_dates[0].certification
    }
  } else if (type === 'tv' && (details as TVShowDetails)?.content_ratings) {
    const data = (details as TVShowDetails).content_ratings
    const usRating = data?.results?.find(r => r.iso_3166_1 === 'US')
    if (usRating) {
      rating = usRating.rating
    } else if (data?.results && data.results.length > 0) {
      rating = data.results[0].rating
    }
  }

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden cursor-pointer" onClick={onMuteToggle}>
      <div ref={containerRef} className="w-full h-full absolute inset-0 pointer-events-none scale-[1.65] md:scale-[1.35]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-16 p-6 pb-24 z-10 pointer-events-none">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">
            {type === 'movie' ? 'Movie' : 'TV Show'}
          </span>
          {year && (
            <span className="px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-md text-[10px] font-bold text-white border border-white/10">
              {year}
            </span>
          )}
          {rating && (
            <span className="px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-md text-[10px] font-bold text-white border border-white/10">
              {rating}
            </span>
          )}
          {details?.vote_average && (
            <span className="flex items-center gap-1 text-yellow-400 text-xs font-bold">
              <FaStar /> {details.vote_average.toFixed(1)}
            </span>
          )}
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight drop-shadow-lg">{title}</h2>
        <p className="text-gray-200 text-sm md:text-base line-clamp-2 font-medium drop-shadow-md max-w-xl">{overview}</p>
      </div>
    </div>
  )
})

TrailerSlide.displayName = 'TrailerSlide'

// Main Page Component
const TrailerSwipePage = () => {
  const navigate = useNavigate()

  // State
  const [mediaList, setMediaList] = useState<MediaWithTrailer[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [showSwipeHint, setShowSwipeHint] = useState(true)
  const [isDesktop, setIsDesktop] = useState(false)
  const [inWatchlist, setInWatchlist] = useState(false)
  const [mediaType, setMediaType] = useState<MediaType>('movie')

  // Sources Filter State
  const [showSources, setShowSources] = useState(false)
  const [selectedSources, setSelectedSources] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('reeailer_sources')
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('reeailer_sources', JSON.stringify(selectedSources))
  }, [selectedSources])

  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStart = useRef<number | null>(null)
  const isTransitioning = useRef(false)
  const pageRef = useRef({ trending: 1, popular: 1, topRated: 1, nowPlaying: 1, discover: 1 })
  const isFetchingMore = useRef(false)
  const hasMore = useRef(true)

  // --- Caching Logic ---
  const getWatchedTrailers = (): Set<number> => {
    try {
      const stored = localStorage.getItem(`watched_trailers_${mediaType}`)
      return stored ? new Set(JSON.parse(stored).map((id: any) => Number(id))) : new Set()
    } catch { return new Set() }
  }

  const saveWatchedTrailer = (id: number) => {
    try {
      const watched = getWatchedTrailers()
      watched.add(id)
      localStorage.setItem(`watched_trailers_${mediaType}`, JSON.stringify(Array.from(watched)))
    } catch (e) { }
  }

  // Load Media (Infinite Scroll)
  const fetchMoreMedia = useCallback(async (isInitial = false, retryCount = 0) => {
    if (isFetchingMore.current || !hasMore.current) return
    isFetchingMore.current = true

    if (isInitial && retryCount === 0) {
      setLoading(true)
      setLoadingProgress(10)
    }

    try {
      if (!isInitial || retryCount > 0) {
        if (selectedSources.length > 0) {
          pageRef.current.discover++
        } else {
          pageRef.current.trending++
          pageRef.current.popular++
          pageRef.current.topRated++
          pageRef.current.nowPlaying++
        }
      }

      let newItems: (Movie | TVShow)[] = []

      if (mediaType === 'movie') {
        if (selectedSources.length > 0) {
          const discoverRes = await discoverMovies(pageRef.current.discover, {
            with_watch_providers: selectedSources.join('|'),
            watch_region: 'US',
            sort_by: 'popularity.desc'
          })
          newItems = discoverRes.results
        } else {
          const [trending, popular, topRated, nowPlaying] = await Promise.all([
            fetchTrendingMovies(pageRef.current.trending),
            fetchPopularMovies(pageRef.current.popular),
            fetchTopRatedMovies(pageRef.current.topRated),
            fetchNowPlayingMovies(pageRef.current.nowPlaying),
          ])
          newItems = [...trending, ...popular, ...topRated, ...nowPlaying]
        }
      } else {
        // TV Shows
        if (selectedSources.length > 0) {
          const discoverRes = await discoverTVShows(pageRef.current.discover, {
            with_watch_providers: selectedSources.join('|'),
            watch_region: 'US',
            sort_by: 'popularity.desc'
          })
          newItems = discoverRes.results
        } else {
          const [trending, popular, topRated, onTheAir] = await Promise.all([
            fetchTrendingTVShows(pageRef.current.trending),
            fetchPopularTVShows(pageRef.current.popular),
            fetchTopRatedTVShows(pageRef.current.topRated),
            fetchOnTheAirTVShows(pageRef.current.nowPlaying),
          ])
          // Note: Some TV fetch functions in tmdb.ts might not accept page param yet, but we'll use what we have.
          // Ideally we update tmdb.ts to accept page for all TV functions.
          // For now, let's assume they return results.
          newItems = [...trending, ...popular, ...topRated, ...onTheAir]
        }
      }

      if (newItems.length === 0) {
        hasMore.current = false
        isFetchingMore.current = false
        if (isInitial) setLoading(false)
        return
      }

      const watched = getWatchedTrailers()
      const unwatchedItems = newItems.filter(m => !watched.has(Number(m.id)))
      const uniqueItems = Array.from(new Map(unwatchedItems.map(m => [m.id, m])).values())
      const shuffled = shuffleArray(uniqueItems)

      const mediaWithTrailers: MediaWithTrailer[] = []
      for (const item of shuffled) {
        if (mediaWithTrailers.length >= 5) break
        try {
          const videos = mediaType === 'movie'
            ? await fetchMovieVideos(item.id)
            : await fetchTVShowVideos(item.id)

          const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube')
          if (trailer) mediaWithTrailers.push({ item, trailer, type: mediaType })
        } catch (e) { }
      }

      if (mediaWithTrailers.length > 0) {
        setMediaList(prev => {
          const existingIds = new Set(prev.map(m => m.item.id))
          const reallyNew = mediaWithTrailers.filter(m => !existingIds.has(m.item.id))
          return [...prev, ...reallyNew]
        })
        if (isInitial) {
          setLoadingProgress(100)
          setTimeout(() => setLoading(false), 500)
        }
      } else {
        isFetchingMore.current = false
        if (retryCount > 5) {
          console.warn("Max retries reached")
          if (isInitial) setLoading(false)
          return
        }
        setTimeout(() => fetchMoreMedia(isInitial, retryCount + 1), 500)
        return
      }
    } catch (e) {
      console.error("Failed to load media", e)
      if (isInitial) setLoading(false)
    } finally {
      isFetchingMore.current = false
    }
  }, [setLoading, setLoadingProgress, setMediaList, selectedSources, mediaType])

  // Reset when Media Type or Sources change
  useEffect(() => {
    if (loading && mediaList.length === 0 && pageRef.current.trending === 1) {
      // Initial mount, let the other effect handle it or just run it
    } else {
      // Reset
      pageRef.current = { trending: 1, popular: 1, topRated: 1, nowPlaying: 1, discover: 1 }
      hasMore.current = true
      setCurrentIndex(0)
      setMediaList([])
      fetchMoreMedia(true)
    }
  }, [selectedSources, mediaType])

  // Initial Load
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(!('ontouchstart' in window || navigator.maxTouchPoints > 0))
    checkDesktop()
    window.addEventListener('resize', checkDesktop)

    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
    }

    fetchMoreMedia(true)
    return () => window.removeEventListener('resize', checkDesktop)
  }, []) // Run once on mount

  // Infinite Scroll
  useEffect(() => {
    if (mediaList.length > 0 && currentIndex >= mediaList.length - 5) {
      fetchMoreMedia(false)
    }
  }, [currentIndex, mediaList.length, fetchMoreMedia])

  // Navigation
  const goToNext = useCallback(() => {
    if (isTransitioning.current || currentIndex >= mediaList.length - 1) return
    isTransitioning.current = true
    setShowSwipeHint(false)
    saveWatchedTrailer(mediaList[currentIndex].item.id)
    setCurrentIndex(prev => prev + 1)
    setTimeout(() => { isTransitioning.current = false }, 500)
  }, [currentIndex, mediaList])

  const goToPrevious = useCallback(() => {
    if (isTransitioning.current || currentIndex <= 0) return
    isTransitioning.current = true
    setShowSwipeHint(false)
    setCurrentIndex(prev => prev - 1)
    setTimeout(() => { isTransitioning.current = false }, 500)
  }, [currentIndex])

  // Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showDetail) return
      if (e.key === 'ArrowDown') goToNext()
      if (e.key === 'ArrowUp') goToPrevious()
    }
    const handleWheel = (e: WheelEvent) => {
      if (showDetail) return
      if (e.deltaY > 0) goToNext()
      if (e.deltaY < 0) goToPrevious()
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('wheel', handleWheel)
    }
  }, [goToNext, goToPrevious, showDetail])

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientY
    setShowSwipeHint(false)
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return
    const diff = touchStart.current - e.changedTouches[0].clientY
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToNext()
      else goToPrevious()
    }
    touchStart.current = null
  }

  // Watchlist & Details
  useEffect(() => {
    if (mediaList[currentIndex]) {
      const item = mediaList[currentIndex].item
      setInWatchlist(isInWatchlist(item.id, mediaType))

      if (!mediaList[currentIndex].details) {
        const fetchDetails = mediaType === 'movie' ? fetchMovieDetails : fetchTVShowDetails
        fetchDetails(item.id).then((details: any) => {
          setMediaList(prev => {
            const newList = [...prev]
            newList[currentIndex] = { ...newList[currentIndex], details }
            return newList
          })
        })
      }
    }
  }, [currentIndex, mediaList, mediaType])

  const handleFavorite = () => {
    if (mediaList[currentIndex]) {
      setInWatchlist(toggleWatchlist(mediaList[currentIndex].item, mediaType))
    }
  }

  // Render
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
        <div className="w-64 space-y-4">
          <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300 ease-out" style={{ width: `${loadingProgress}%` }} />
          </div>
          <p className="text-center text-sm font-medium text-gray-400 animate-pulse">Optimising SanuFlix Reeailer feed...</p>
        </div>
      </div>
    )
  }

  if (mediaList.length === 0) return <div className="fixed inset-0 bg-black flex items-center justify-center text-white">No trailers found.</div>

  const currentItem = mediaList[currentIndex]

  return (
    <div className="fixed inset-0 bg-black overflow-hidden font-sans select-none">
      {/* Back Button */}
      <button onClick={() => navigate('/')} className="absolute top-6 left-6 z-50 p-3 glass-effect rounded-full hover:bg-white/20 transition-all group">
        <FaTimes className="text-xl text-white/90 group-hover:text-white" />
      </button>

      {/* Controls Container */}
      <div className="absolute top-6 left-20 z-50 flex items-center gap-3">
        {/* Sources Button */}
        <button
          onClick={() => setShowSources(true)}
          className="px-4 py-3 glass-effect rounded-full hover:bg-white/20 transition-all group flex items-center gap-2"
        >
          <span className="text-sm font-bold text-white/90 group-hover:text-white">Sources</span>
          {selectedSources.length > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-black">
              {selectedSources.length}
            </span>
          )}
        </button>

        {/* Media Type Dropdown */}
        <Menu as="div" className="relative inline-block text-left">
          <Menu.Button className="px-4 py-3 glass-effect rounded-full hover:bg-white/20 transition-all group flex items-center gap-2 text-sm font-bold text-white/90 group-hover:text-white">
            {mediaType === 'movie' ? 'Movies' : 'TV Shows'}
            <FaChevronDown className="text-xs" />
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute left-0 mt-2 w-32 origin-top-left rounded-xl bg-[#1a1a1a] border border-white/10 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => setMediaType('movie')}
                    className={`${active ? 'bg-white/10' : ''} group flex w-full items-center px-4 py-3 text-sm text-white font-medium`}
                  >
                    Movies
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => setMediaType('tv')}
                    className={`${active ? 'bg-white/10' : ''} group flex w-full items-center px-4 py-3 text-sm text-white font-medium`}
                  >
                    TV Shows
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>

      <SourcesDialog
        isOpen={showSources}
        onClose={() => setShowSources(false)}
        selectedSources={selectedSources}
        onToggleSource={(id) => {
          setSelectedSources(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
        }}
      />

      {/* Swipe Hint */}
      {showSwipeHint && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center pointer-events-none animate-fade-out-delay">
          <div className="flex flex-col items-center gap-4 bg-black/40 backdrop-blur-md px-8 py-6 rounded-2xl border border-white/10 animate-pulse-subtle">
            {isDesktop ? <FaArrowDown className="text-3xl text-white/80 animate-bounce" /> : <div className="w-1 h-12 rounded-full bg-gradient-to-b from-white/20 to-white/80 animate-swipe-hint" />}
            <p className="text-white/90 font-medium text-sm tracking-wider uppercase">{isDesktop ? 'Press Down Arrow' : 'Swipe to Explore'}</p>
          </div>
        </div>
      )}

      {/* Slides Container */}
      <div
        ref={containerRef}
        className="relative w-full h-full"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {mediaList.map((item, index) => {
          if (Math.abs(index - currentIndex) > 1) return null
          const isActive = index === currentIndex
          const offset = index - currentIndex

          return (
            <div
              key={`${item.item.id}-${item.type}`}
              className="absolute inset-0 transition-transform duration-500 cubic-bezier(0.2, 0.8, 0.2, 1)"
              style={{ transform: `translateY(${offset * 100}%)`, zIndex: isActive ? 10 : 0 }}
            >
              <TrailerSlide
                data={item}
                isActive={isActive}
                shouldLoad={true}
                isMuted={isMuted}
                onMuteToggle={() => setIsMuted(!isMuted)}
              />
            </div>
          )
        })}
      </div>

      {/* Right Controls */}
      <div className="absolute right-4 bottom-24 z-40 flex flex-col gap-6 items-center">
        <div className="flex flex-col items-center gap-1">
          <button onClick={handleFavorite} className={`p-4 rounded-full transition-all duration-300 shadow-lg backdrop-blur-md ${inWatchlist ? 'bg-primary/20 text-primary border border-primary/50' : 'bg-black/40 text-white border border-white/10'}`}>
            {inWatchlist ? <FaHeart className="text-2xl" /> : <FaRegHeart className="text-2xl" />}
          </button>
          <span className="text-[10px] font-medium text-white/80 shadow-black drop-shadow-md">My List</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button onClick={() => navigate(`/${mediaType}/${currentItem.item.id}/watch`)} className="p-4 bg-white text-black rounded-full hover:bg-gray-200 shadow-xl">
            <FaPlay className="text-xl ml-1" />
          </button>
          <span className="text-[10px] font-medium text-white/80 shadow-black drop-shadow-md">Watch</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button onClick={() => setIsMuted(!isMuted)} className="p-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white">
            {isMuted ? <FaVolumeMute className="text-xl" /> : <FaVolumeUp className="text-xl" />}
          </button>
          <span className="text-[10px] font-medium text-white/80 shadow-black drop-shadow-md">{isMuted ? 'Muted' : 'Sound'}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button onClick={() => setShowDetail(true)} className="p-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          </button>
          <span className="text-[10px] font-medium text-white/80 shadow-black drop-shadow-md">Info</span>
        </div>
      </div>

      {currentItem && (
        <TrailerDetailOverlay
          item={currentItem.details || currentItem.item}
          type={mediaType}
          isOpen={showDetail}
          onClose={() => setShowDetail(false)}
        />
      )}
    </div>
  )
}

export default TrailerSwipePage
