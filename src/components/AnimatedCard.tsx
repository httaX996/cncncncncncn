import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useState, useRef } from 'react'
import { FaDownload, FaStar } from 'react-icons/fa'
import { LoadingSpinner } from './LoadingSpinner'
import { getImageUrl } from '../services/tmdb'
import type { Movie, TVShow } from '../types/tmdb'

interface AnimatedCardProps {
    item: Movie | TVShow
    onClick: (item: Movie | TVShow) => void
    isLoading?: boolean
    index: number
}

export const AnimatedCard = ({ item, onClick, isLoading, index }: AnimatedCardProps) => {
    const ref = useRef<HTMLDivElement>(null)
    const [isHovered, setIsHovered] = useState(false)

    // 3D Tilt Effect
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const mouseX = useSpring(x, { stiffness: 500, damping: 100 })
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 })

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["17.5deg", "-17.5deg"])
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-17.5deg", "17.5deg"])

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return
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

    const title = item.media_type === 'movie' ? (item as Movie).title : (item as TVShow).name
    const date = item.media_type === 'movie' ? (item as Movie).release_date : (item as TVShow).first_air_date
    const year = date ? new Date(date).getFullYear() : 'N/A'

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.05, type: "spring", stiffness: 100 }}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            onClick={() => onClick(item)}
            className={`relative aspect-[2/3] rounded-2xl cursor-pointer group perspective-1000 ${isLoading ? 'pointer-events-none' : ''}`}
        >
            {/* Card Content Container */}
            <div
                className="absolute inset-0 rounded-2xl overflow-hidden bg-[#1a1a1a] shadow-2xl transition-all duration-300 group-hover:shadow-primary/20"
                style={{ transform: "translateZ(0px)" }}
            >
                {/* Image */}
                <img
                    src={getImageUrl(item.poster_path, 'w500')}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                {/* Content Overlay */}
                <div className="absolute inset-0 p-4 flex flex-col justify-between z-10">
                    {/* Top Badges */}
                    <div className="flex justify-between items-start translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-white border border-white/10 uppercase tracking-wider shadow-lg">
                            {item.media_type === 'movie' ? 'Movie' : 'TV'}
                        </div>
                        {item.vote_average > 0 && (
                            <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-yellow-400 border border-white/10 flex items-center gap-1 shadow-lg">
                                <FaStar className="text-[10px]" />
                                <span>{item.vote_average.toFixed(1)}</span>
                            </div>
                        )}
                    </div>

                    {/* Center Action (Download/Loading) */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {isLoading ? (
                            <LoadingSpinner className="w-12 h-12 text-white drop-shadow-lg" />
                        ) : (
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: isHovered ? 1 : 0, opacity: isHovered ? 1 : 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="bg-primary/90 text-white p-4 rounded-full shadow-xl shadow-primary/30 backdrop-blur-sm flex items-center justify-center"
                            >
                                <FaDownload className="text-2xl ml-0.5" />
                            </motion.div>
                        )}
                    </div>

                    {/* Bottom Info */}
                    <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-white font-bold truncate text-lg drop-shadow-md leading-tight mb-1">{title}</h3>
                        <div className="flex items-center justify-between">
                            <p className="text-gray-300 text-xs font-medium drop-shadow-md">{year}</p>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: isHovered ? '100%' : 0 }}
                                className="h-0.5 bg-primary rounded-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Glow Effect behind card */}
            <div
                className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-50 transition duration-500 -z-10"
            />
        </motion.div>
    )
}
