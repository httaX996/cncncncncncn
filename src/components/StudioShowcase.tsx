import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const studios = [
    { id: 33, name: 'Universal', logo: 'https://image.tmdb.org/t/p/original/8lvHyhjr8oUKOOy2dKXoALwkdp0.png' },
    { id: 34, name: 'Sony', logo: 'https://image.tmdb.org/t/p/original/GagSvqWlyPdkFHMfQ3pNq6ix9P.png' },
    { id: 420, name: 'Marvel', logo: 'https://image.tmdb.org/t/p/original/hUzeosd33nzE5MCNsZxCGEKTXaQ.png' },
    { id: 2, name: 'Disney', logo: 'https://image.tmdb.org/t/p/original/wdrCwmRnLFJhEoH8GSfymY85qDb.png' },
    { id: 174, name: 'Warner Bros', logo: 'https://image.tmdb.org/t/p/original/IuAlhI9eVC9Z8UQWOIDdWRKSEJ.png' },
    { id: 4, name: 'Paramount', logo: 'https://image.tmdb.org/t/p/original/fycMZt242LVjagMByZOLUGbCvv3.png' },
]

export const StudioShowcase = () => {
    return (
        <div className="py-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 px-4 md:px-0 text-center md:text-left">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                    Production Powerhouses
                </span>
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 px-4 md:px-0">
                {studios.map((studio, index) => (
                    <motion.div
                        key={studio.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 flex items-center justify-center aspect-video group cursor-pointer hover:bg-white/10 transition-colors"
                    >
                        <Link to={`/studio/${studio.id}`} className="w-full h-full flex items-center justify-center">
                            <img
                                src={studio.logo}
                                alt={studio.name}
                                className="max-w-full max-h-full object-contain filter grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                            />
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
