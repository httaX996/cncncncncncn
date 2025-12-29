import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { FaSearch, FaFire } from 'react-icons/fa'
import { searchMulti, fetchTVShowDetails, fetchTrendingMovies, fetchTrendingTVShows } from '../services/tmdb'
import { DownloadModal } from '../components/DownloadModal'
import { SEO } from '../components/SEO'
import { LoadingSpinner } from '../components/LoadingSpinner'
import type { Movie, TVShow, TVShowDetails } from '../types/tmdb'
import debounce from 'lodash.debounce'
import ThreeBackground from '../components/ThreeBackground'
import { PremiumCard } from '../components/PremiumCard'

const SplitText = ({ text, className = "" }: { text: string, className?: string }) => {
    return (
        <span className={`inline-block overflow-hidden ${className}`}>
            <motion.span
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block"
            >
                {text}
            </motion.span>
        </span>
    )
}

const SkeletonCard = () => (
    <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-white/5 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
    </div>
)

const DownloaderPage = () => {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<(Movie | TVShow)[]>([])
    const [trendingContent, setTrendingContent] = useState<(Movie | TVShow)[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedShow, setSelectedShow] = useState<TVShowDetails | null>(null)
    const [showDownloadModal, setShowDownloadModal] = useState(false)
    const [loadingDetails, setLoadingDetails] = useState(false)
    const [loadingId, setLoadingId] = useState<number | null>(null)
    const [isFocused, setIsFocused] = useState(false)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [isFetchingMore, setIsFetchingMore] = useState(false)
    const { ref: loadMoreRef, inView } = useInView()
    const inputRef = useRef<HTMLInputElement>(null)

    const handleSearch = useCallback(
        debounce(async (searchQuery: string) => {
            if (!searchQuery.trim()) {
                setResults([])
                setLoading(false)
                return
            }

            setLoading(true)
            setPage(1)
            try {
                const data = await searchMulti(searchQuery, 1)
                const filteredResults = data.results.filter(
                    (item) =>
                        (item.media_type === 'movie' || item.media_type === 'tv') &&
                        (item.poster_path || item.backdrop_path)
                ) as (Movie | TVShow)[]
                setResults(filteredResults)
                setHasMore(data.page < data.total_pages)
            } catch (error) {
                console.error('Search failed:', error)
            } finally {
                setLoading(false)
            }
        }, 500),
        []
    )

    const loadMore = async () => {
        if (isFetchingMore || !hasMore) return

        setIsFetchingMore(true)
        const nextPage = page + 1
        try {
            if (query.trim()) {
                const data = await searchMulti(query, nextPage)
                const newResults = data.results.filter(
                    (item) =>
                        (item.media_type === 'movie' || item.media_type === 'tv') &&
                        (item.poster_path || item.backdrop_path)
                ) as (Movie | TVShow)[]

                setResults(prev => [...prev, ...newResults])
                setHasMore(data.page < data.total_pages)
            } else {
                const [movies, tvShows] = await Promise.all([
                    fetchTrendingMovies(nextPage),
                    fetchTrendingTVShows(nextPage)
                ])

                const topMovies = movies.map(m => ({ ...m, media_type: 'movie' as const }))
                const topTV = tvShows.map(t => ({ ...t, media_type: 'tv' as const }))
                const mixed = [...topMovies, ...topTV].sort(() => Math.random() - 0.5)

                setTrendingContent(prev => [...prev, ...mixed])
                // Assume trending always has more for now, or check response if available
                setHasMore(true)
            }
            setPage(nextPage)
        } catch (error) {
            console.error('Failed to load more:', error)
        } finally {
            setIsFetchingMore(false)
        }
    }

    useEffect(() => {
        if (inView) {
            loadMore()
        }
    }, [inView])

    useEffect(() => {
        if (query.trim()) {
            setLoading(true)
            handleSearch(query)
        } else {
            setResults([])
            setLoading(false)
        }
    }, [query, handleSearch])

    useEffect(() => {
        const loadTrending = async () => {
            try {
                const [movies, tvShows] = await Promise.all([
                    fetchTrendingMovies(),
                    fetchTrendingTVShows()
                ])

                const topMovies = movies.slice(0, 10).map(m => ({ ...m, media_type: 'movie' as const }))
                const topTV = tvShows.slice(0, 10).map(t => ({ ...t, media_type: 'tv' as const }))

                const mixed = [...topMovies, ...topTV].sort(() => Math.random() - 0.5)
                setTrendingContent(mixed)
            } catch (error) {
                console.error('Failed to load trending content', error)
            }
        }

        loadTrending()
    }, [])

    const handleDownload = async (item: Movie | TVShow) => {
        if (loadingDetails) return

        if (item.media_type === 'movie') {
            window.open(`https://dl.vidsrc.vip/movie/${item.id}`, '_blank')
        } else {
            setLoadingDetails(true)
            setLoadingId(item.id)
            try {
                const details = await fetchTVShowDetails(item.id)
                setSelectedShow(details)
                setShowDownloadModal(true)
            } catch (error) {
                console.error('Failed to fetch TV show details:', error)
            } finally {
                setLoadingDetails(false)
                setLoadingId(null)
            }
        }
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    }

    const displayContent = query.trim() ? results : trendingContent
    const showTrendingTitle = !query.trim() && trendingContent.length > 0

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30 selection:text-white overflow-x-hidden">
            <SEO
                title="Downloader - SanuFlix"
                description="Premium download experience for movies and TV shows."
            />

            <ThreeBackground />

            <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen flex flex-col">

                {/* Header Section */}
                <div className="flex flex-col items-center justify-center pt-12 pb-16 space-y-8">
                    <div className="text-center space-y-2 z-20">
                        <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] mix-blend-difference">
                            <div className="flex flex-col items-center">
                                <SplitText text="SANUFLIX" className="text-white" />
                                <SplitText text="DOWNLOADER" className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-pink-500" />
                            </div>
                        </h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8, duration: 1 }}
                            className="text-xl md:text-2xl text-gray-400 font-light max-w-2xl mx-auto mt-8 tracking-wide"
                        >
                            CINEMA QUALITY. <span className="text-white font-medium">UNLIMITED.</span>
                        </motion.p>
                    </div>

                    {/* Search Input */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className={`relative w-full max-w-3xl transition-all duration-300 ${isFocused ? 'scale-105' : 'scale-100'}`}
                    >
                        <div className={`absolute -inset-1 bg-gradient-to-r from-primary via-purple-600 to-pink-600 rounded-2xl blur-xl transition-opacity duration-500 ${isFocused ? 'opacity-40' : 'opacity-20'}`} />
                        <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                            <div className="flex items-center px-6 py-5">
                                <FaSearch className={`text-2xl transition-colors duration-300 ${isFocused ? 'text-primary' : 'text-gray-500'}`} />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    placeholder="What would you like to download?"
                                    className="w-full bg-transparent border-none outline-none text-white text-xl px-6 focus:ring-0 placeholder-gray-600 font-medium tracking-wide"
                                    autoFocus
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Results Section */}
                <div className="flex-1 w-full min-h-[50vh]">
                    {showTrendingTitle && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 mb-8"
                        >
                            <FaFire className="text-2xl text-orange-500" />
                            <h2 className="text-2xl font-bold text-white">Trending Now</h2>
                        </motion.div>
                    )}

                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    ) : (
                        <>
                            {displayContent.length > 0 ? (
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
                                >
                                    {displayContent.map((item, index) => (
                                        <PremiumCard
                                            key={`${item.id}-${index}`} // Use index to avoid duplicate key errors in mixed lists
                                            item={item}
                                            index={index % 20} // Reset index for staggering every page
                                            onClick={handleDownload}
                                            isLoading={loadingId === item.id}
                                        />
                                    ))}

                                    {/* Infinite Scroll Loader */}
                                    {hasMore && (
                                        <div ref={loadMoreRef} className="col-span-full flex justify-center py-12">
                                            <LoadingSpinner className="w-10 h-10 text-primary" />
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                query && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex flex-col items-center justify-center py-20 text-center"
                                    >
                                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                            <FaSearch className="text-4xl text-gray-600" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-2">No results found</h3>
                                        <p className="text-gray-400">We couldn't find anything matching "{query}"</p>
                                    </motion.div>
                                )
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Download Modal */}
            {selectedShow && (
                <DownloadModal
                    isOpen={showDownloadModal}
                    onClose={() => setShowDownloadModal(false)}
                    showId={selectedShow.id}
                    totalSeasons={selectedShow.number_of_seasons}
                    showName={selectedShow.name}
                />
            )}
        </div>
    )
}

export default DownloaderPage
