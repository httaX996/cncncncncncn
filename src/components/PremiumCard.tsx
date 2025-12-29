import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useState, useRef } from 'react'
import { FaDownload, FaStar } from 'react-icons/fa'
import { LoadingSpinner } from './LoadingSpinner'
import { getImageUrl } from '../services/tmdb'
import type { Movie, TVShow } from '../types/tmdb'

interface PremiumCardProps {
    item: Movie | TVShow
    onClick: (item: Movie | TVShow) => void
    isLoading?: boolean
    index: number
}

export const PremiumCard = ({ item, onClick, isLoading, index }: PremiumCardProps) => {
    const ref = useRef<HTMLDivElement>(null)
    const [isHovered, setIsHovered] = useState(false)

    // Mouse position for spotlight and parallax
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    // Smooth spring physics for mouse movement
    const mouseX = useSpring(x, { stiffness: 500, damping: 100 })
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 })

    // Parallax effect for image (moves opposite to mouse)
    const imageX = useTransform(mouseX, [-0.5, 0.5], ["10%", "-10%"])
    const imageY = useTransform(mouseY, [-0.5, 0.5], ["10%", "-10%"])

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return
        const rect = ref.current.getBoundingClientRect()
        const width = rect.width
        const height = rect.height
        const mouseXFromCenter = e.clientX - rect.left - width / 2
        const mouseYFromCenter = e.clientY - rect.top - height / 2

        // Normalize coordinates to -0.5 to 0.5
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
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            onClick={() => onClick(item)}
            className={`relative aspect-[2/3] rounded-none overflow-hidden bg-[#0a0a0a] cursor-pointer group ${isLoading ? 'pointer-events-none' : ''}`}
        >
            {/* Image Container with Parallax */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="w-[120%] h-[120%] absolute -top-[10%] -left-[10%]"
                    style={{ x: imageX, y: imageY }}
                >
                    <img
                        src={getImageUrl(item.poster_path, 'w500')}
                        alt={title}
                        className="w-full h-full object-cover filter grayscale-[30%] group-hover:grayscale-0 transition-all duration-700 ease-out"
                        loading="lazy"
                    />
                </motion.div>
            </div>

            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />

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
            <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                {/* Top Badges - Slide Down Reveal */}
                <div className="flex justify-between items-start overflow-hidden">
                    <motion.div
                        initial={{ y: -50 }}
                        animate={{ y: isHovered ? 0 : -50 }}
                        transition={{ duration: 0.4, ease: "circOut" }}
                        className="bg-white/10 backdrop-blur-md px-3 py-1 text-xs font-bold text-white uppercase tracking-widest"
                    >
                        {item.media_type === 'movie' ? 'Movie' : 'TV'}
                    </motion.div>

                    {item.vote_average > 0 && (
                        <motion.div
                            initial={{ y: -50 }}
                            animate={{ y: isHovered ? 0 : -50 }}
                            transition={{ duration: 0.4, delay: 0.1, ease: "circOut" }}
                            className="bg-white/10 backdrop-blur-md px-3 py-1 text-xs font-bold text-yellow-400 flex items-center gap-1"
                        >
                            <FaStar className="text-[10px]" />
                            <span>{item.vote_average.toFixed(1)}</span>
                        </motion.div>
                    )}
                </div>

                {/* Center Action */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {isLoading ? (
                        <LoadingSpinner className="w-12 h-12 text-white drop-shadow-lg" />
                    ) : (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: isHovered ? 1 : 0.8, opacity: isHovered ? 1 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="w-16 h-16 rounded-full border border-white/30 flex items-center justify-center backdrop-blur-sm"
                        >
                            <FaDownload className="text-2xl text-white" />
                        </motion.div>
                    )}
                </div>

                {/* Bottom Info - Mask Reveal */}
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <div className="overflow-hidden mb-1">
                        <motion.h3
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-white font-black text-2xl leading-none uppercase tracking-tighter"
                        >
                            {title}
                        </motion.h3>
                    </div>
                    <div className="overflow-hidden">
                        <motion.p
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="text-gray-400 text-sm font-medium tracking-wide"
                        >
                            {year}
                        </motion.p>
                    </div>
                </div>
            </div>

            {/* Border Reveal */}
            <div className="absolute inset-0 border border-white/0 group-hover:border-white/20 transition-colors duration-500 pointer-events-none" />
        </motion.div>
    )
}
