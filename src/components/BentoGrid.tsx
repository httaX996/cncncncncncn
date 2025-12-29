import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaPlay, FaStar } from 'react-icons/fa'
import { getImageUrl } from '../services/tmdb'
import type { Movie, TVShow } from '../types/tmdb'

interface BentoGridProps {
    title: string
    items: (Movie | TVShow)[]
    type: 'movie' | 'tv'
}

export const BentoGrid = ({ title, items, type }: BentoGridProps) => {
    if (!items || items.length < 5) return null

    const featured = items[0]
    const secondary = items.slice(1, 5)

    return (
        <div className="py-8">
            <div className="flex items-end justify-between px-4 md:px-0 mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
                        {title}
                    </span>
                </h2>
                <Link to={`/category/trending-${type}`} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                    View All
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[200px]">
                {/* Featured Large Item */}
                <motion.div
                    className="md:col-span-2 md:row-span-2 relative rounded-2xl overflow-hidden group cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                >
                    <Link to={`/${type}/${featured.id}`} className="block w-full h-full">
                        <img
                            src={getImageUrl(featured.backdrop_path, 'w1280')}
                            alt={'title' in featured ? featured.title : featured.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />

                        <div className="absolute bottom-0 left-0 p-6 w-full">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-1 bg-pink-600 text-white text-xs font-bold rounded-md">
                                    #{1} Trending
                                </span>
                                <div className="flex items-center gap-1 text-yellow-400 text-sm font-bold">
                                    <FaStar />
                                    {featured.vote_average.toFixed(1)}
                                </div>
                            </div>
                            <h3 className="text-2xl md:text-4xl font-bold text-white mb-2 leading-tight">
                                {'title' in featured ? featured.title : featured.name}
                            </h3>
                            <p className="text-gray-300 line-clamp-2 max-w-xl text-sm md:text-base">
                                {featured.overview}
                            </p>
                        </div>
                    </Link>
                </motion.div>

                {/* Secondary Grid Items */}
                {secondary.map((item, index) => (
                    <motion.div
                        key={item.id}
                        className="relative rounded-2xl overflow-hidden group cursor-pointer"
                        whileHover={{ scale: 1.03 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Link to={`/${type}/${item.id}`} className="block w-full h-full">
                            <img
                                src={getImageUrl(item.backdrop_path || item.poster_path, 'w780')}
                                alt={'title' in item ? item.title : item.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <FaPlay className="text-white ml-1" />
                                </div>
                            </div>

                            <div className="absolute bottom-0 left-0 p-4 w-full">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-gray-400">#{index + 2}</span>
                                    <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold">
                                        <FaStar className="w-3 h-3" />
                                        {item.vote_average.toFixed(1)}
                                    </div>
                                </div>
                                <h3 className="text-white font-bold text-lg line-clamp-1">
                                    {'title' in item ? item.title : item.name}
                                </h3>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
