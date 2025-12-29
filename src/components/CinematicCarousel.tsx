import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaChevronLeft, FaChevronRight, FaPlay, FaInfoCircle } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import { Movie, TVShow } from '../types/tmdb'
import { getImageUrl } from '../services/tmdb'
import { useMobileDetection } from '../hooks/useMobileDetection'

interface CinematicCarouselProps {
    title: string
    items: (Movie | TVShow)[]
    type: 'movie' | 'tv'
}

export const CinematicCarousel = ({ title, items, type }: CinematicCarouselProps) => {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [showLeftArrow, setShowLeftArrow] = useState(false)
    const [showRightArrow, setShowRightArrow] = useState(true)
    const isMobile = useMobileDetection()

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef
            const scrollAmount = current.clientWidth * 0.8
            current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            })
        }
    }

    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
            setShowLeftArrow(scrollLeft > 0)
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
        }
    }

    return (
        <div className="relative py-8 group/section">
            <div className="px-4 md:px-12 mb-4 flex items-end justify-between">
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
                        {title}
                    </span>
                </h2>
            </div>

            <div className="relative group">
                {/* Navigation Buttons (Desktop) */}
                {!isMobile && (
                    <>
                        <AnimatePresence>
                            {showLeftArrow && (
                                <motion.button
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onClick={() => scroll('left')}
                                    className="absolute left-0 top-0 bottom-0 z-40 w-16 bg-gradient-to-r from-black/80 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                >
                                    <FaChevronLeft className="text-3xl text-white hover:text-pink-500 transition-colors" />
                                </motion.button>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {showRightArrow && (
                                <motion.button
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    onClick={() => scroll('right')}
                                    className="absolute right-0 top-0 bottom-0 z-40 w-16 bg-gradient-to-l from-black/80 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                >
                                    <FaChevronRight className="text-3xl text-white hover:text-pink-500 transition-colors" />
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </>
                )}

                {/* Carousel Container */}
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex overflow-x-auto gap-4 px-4 md:px-12 pb-8 scrollbar-hide snap-x snap-mandatory"
                    style={{ scrollBehavior: 'smooth' }}
                >
                    {items.map((item) => (
                        <CinematicCard key={item.id} item={item} type={type} />
                    ))}
                </div>
            </div>
        </div>
    )
}

const CinematicCard = ({ item, type }: { item: Movie | TVShow; type: 'movie' | 'tv' }) => {
    const [isHovered, setIsHovered] = useState(false)
    const backdropUrl = getImageUrl(item.backdrop_path || item.poster_path, 'w780')
    const title = 'title' in item ? item.title : item.name

    return (
        <motion.div
            className="relative flex-shrink-0 w-[280px] md:w-[400px] aspect-video snap-center rounded-xl overflow-hidden cursor-pointer"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            whileHover={{ scale: 1.05, zIndex: 20 }}
            transition={{ duration: 0.3 }}
        >
            <Link to={`/${type}/${item.id}`} className="block w-full h-full">
                <img
                    src={backdropUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                />

                <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-90' : 'opacity-60'}`} />

                <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-bold text-lg md:text-xl mb-2 line-clamp-1">{title}</h3>

                    <AnimatePresence>
                        {isHovered && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex gap-3"
                            >
                                <button className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full font-bold text-sm hover:bg-pink-500 hover:text-white transition-colors">
                                    <FaPlay /> Play
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-full font-bold text-sm hover:bg-white/30 transition-colors backdrop-blur-sm">
                                    <FaInfoCircle /> Info
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </Link>
        </motion.div>
    )
}
