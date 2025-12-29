import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { discoverMovies, getImageUrl } from '../services/tmdb'
import type { Movie } from '../types/tmdb'
import { FaPlay } from 'react-icons/fa'

const PROVIDERS = [
    { id: 8, name: 'Netflix', color: 'bg-red-600' },
    { id: 337, name: 'Disney+', color: 'bg-blue-600' },
    { id: 9, name: 'Prime Video', color: 'bg-blue-400' },
    { id: 15, name: 'Hulu', color: 'bg-green-500' },
]

export const StreamingSpotlight = () => {
    const [activeProvider, setActiveProvider] = useState(PROVIDERS[0])
    const [movies, setMovies] = useState<Movie[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const loadMovies = async () => {
            setLoading(true)
            try {
                const data = await discoverMovies(1, {
                    with_watch_providers: activeProvider.id.toString(),
                    watch_region: 'US',
                    sort_by: 'popularity.desc'
                })
                setMovies(data.results.slice(0, 5))
            } catch (error) {
                console.error('Failed to load streaming movies', error)
            } finally {
                setLoading(false)
            }
        }
        loadMovies()
    }, [activeProvider])

    return (
        <div className="py-8">
            <div className="flex flex-col md:flex-row items-end justify-between px-4 md:px-0 mb-6 gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        Streaming Now
                    </h2>
                    <p className="text-gray-400 text-sm">
                        See what's trending on your favorite platforms.
                    </p>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar w-full md:w-auto">
                    {PROVIDERS.map((provider) => (
                        <button
                            key={provider.id}
                            onClick={() => setActiveProvider(provider)}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeProvider.id === provider.id
                                ? `${provider.color} text-white shadow-lg scale-105`
                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                }`}
                        >
                            {provider.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative min-h-[250px]">
                <AnimatePresence mode='wait'>
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center justify-center h-[250px]"
                        >
                            <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key={activeProvider.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-2 md:grid-cols-5 gap-4 px-4 md:px-0"
                        >
                            {movies.map((movie) => (
                                <Link
                                    key={movie.id}
                                    to={`/movie/${movie.id}`}
                                    className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-900"
                                >
                                    <img
                                        src={getImageUrl(movie.poster_path, 'w500')}
                                        alt={movie.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-100">
                                            <FaPlay className="text-white ml-1" />
                                        </div>
                                    </div>
                                    <div className={`absolute top-2 right-2 px-2 py-1 rounded text-[10px] font-bold text-white ${activeProvider.color}`}>
                                        {activeProvider.name}
                                    </div>
                                </Link>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
