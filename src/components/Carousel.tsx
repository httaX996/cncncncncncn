import { useRef, useState } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { MediaCard } from './MediaCard'
import type { Movie, TVShow } from '../types/tmdb'
import { useMobilePerformance } from '../hooks/useMobileDetection'

interface CarouselProps {
  title: string
  items: (Movie | TVShow)[]
  mediaType: 'movie' | 'tv'
  categoryPath?: string
}

export const Carousel = ({ title, items, mediaType, categoryPath }: CarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  const [showLeftFade, setShowLeftFade] = useState(false)
  const [showRightFade, setShowRightFade] = useState(true)
  const { isLowEndDevice } = useMobilePerformance()

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef
      const scrollAmount = current.clientWidth * 0.8
      current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: isLowEndDevice ? 'auto' : 'smooth'
      })
    }
  }

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
      setShowLeftFade(scrollLeft > 0)
      setShowRightFade(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current && !isLowEndDevice) {
      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      containerRef.current.style.setProperty('--x', `${x}px`)
      containerRef.current.style.setProperty('--y', `${y}px`)
    }
  }

  if (items.length === 0) return null

  return (
    <div
      ref={containerRef}
      className="relative py-8 group/section spotlight"
      onMouseMove={handleMouseMove}
    >
      {/* Header */}
      <div className="px-4 md:px-12 mb-4 flex items-end justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-pink-500 to-violet-500 rounded-full" />
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            {title}
          </h2>
        </div>
        {categoryPath && (
          <Link
            to={categoryPath}
            className="text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 px-3 py-1 rounded-full transition-all duration-300 flex items-center gap-1 group/link"
          >
            View All
            <FaChevronRight className="text-xs transition-transform group-hover/link:translate-x-1" />
          </Link>
        )}
      </div>

      <div className="relative group">
        {/* Scroll Fades */}
        <div className={`absolute left-0 top-0 bottom-0 w-12 md:w-24 bg-gradient-to-r from-bg-primary to-transparent z-30 pointer-events-none transition-opacity duration-300 ${showLeftFade ? 'opacity-100' : 'opacity-0'}`} />
        <div className={`absolute right-0 top-0 bottom-0 w-12 md:w-24 bg-gradient-to-l from-bg-primary to-transparent z-30 pointer-events-none transition-opacity duration-300 ${showRightFade ? 'opacity-100' : 'opacity-0'}`} />

        {/* Navigation Buttons (Desktop) */}
        <div className="hidden md:block">
          <button
            onClick={() => scroll('left')}
            disabled={!showLeftArrow}
            className={`absolute left-0 top-0 bottom-0 z-40 w-12 bg-black/50 hover:bg-black/70 flex items-center justify-center transition-all duration-300
              ${showLeftArrow ? 'opacity-0 group-hover:opacity-100 translate-x-0' : 'opacity-0 -translate-x-full pointer-events-none'}`}
            aria-label="Scroll left"
          >
            <FaChevronLeft className="text-2xl text-white" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!showRightArrow}
            className={`absolute right-0 top-0 bottom-0 z-40 w-12 bg-black/50 hover:bg-black/70 flex items-center justify-center transition-all duration-300
              ${showRightArrow ? 'opacity-0 group-hover:opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'}`}
            aria-label="Scroll right"
          >
            <FaChevronRight className="text-2xl text-white" />
          </button>
        </div>

        {/* Carousel Container */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto gap-3 md:gap-4 px-4 md:px-12 pb-8 scrollbar-hide snap-x snap-mandatory"
          style={{
            scrollBehavior: isLowEndDevice ? 'auto' : 'smooth',
            contentVisibility: isLowEndDevice ? 'auto' : 'visible'
          }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[200px] lg:w-[240px] snap-start"
            >
              <MediaCard item={item} mediaType={mediaType} />
            </div>
          ))}
          {/* Spacer */}
          <div className="flex-shrink-0 w-4 md:w-12" />
        </div>
      </div>
    </div>

  )
}

