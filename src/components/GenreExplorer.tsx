import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaFire, FaLaugh, FaSkull, FaRocket, FaHeart, FaFistRaised, FaMagic, FaGhost } from 'react-icons/fa'

const genres = [
    { id: 28, name: 'Action', icon: FaFistRaised, color: 'from-red-500 to-orange-500' },
    { id: 35, name: 'Comedy', icon: FaLaugh, color: 'from-yellow-400 to-orange-400' },
    { id: 27, name: 'Horror', icon: FaSkull, color: 'from-gray-900 to-black' },
    { id: 878, name: 'Sci-Fi', icon: FaRocket, color: 'from-blue-600 to-cyan-500' },
    { id: 10749, name: 'Romance', icon: FaHeart, color: 'from-pink-500 to-rose-500' },
    { id: 14, name: 'Fantasy', icon: FaMagic, color: 'from-purple-600 to-indigo-600' },
    { id: 53, name: 'Thriller', icon: FaGhost, color: 'from-emerald-600 to-teal-600' },
    { id: 12, name: 'Adventure', icon: FaFire, color: 'from-orange-500 to-red-600' },
]

export const GenreExplorer = () => {
    return (
        <div className="py-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 px-4 md:px-0">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500">
                    Explore Universes
                </span>
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 md:px-0">
                {genres.map((genre, index) => (
                    <motion.div
                        key={genre.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        className="relative h-24 rounded-xl overflow-hidden cursor-pointer group"
                    >
                        <Link to={`/genre/movie?genre=${genre.id}`} className="block w-full h-full">
                            <div className={`absolute inset-0 bg-gradient-to-br ${genre.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
                            <div className="absolute inset-0 flex items-center justify-center gap-3">
                                <genre.icon className="text-white text-2xl drop-shadow-md" />
                                <span className="text-white font-bold text-lg drop-shadow-md">{genre.name}</span>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
