import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaChevronLeft, FaChevronRight, FaArrowRight } from 'react-icons/fa'
import { SportsMatchCard } from './SportsMatchCard'
import { SkeletonCard } from './SkeletonCard'
import { useMobilePerformance } from '../hooks/useMobileDetection'
import type { Match } from '../types/sports'

interface SportsCarouselProps {
  title: string
  matches: Match[]
  categoryPath?: string
  loading?: boolean
}

export const SportsCarousel = ({ title, matches, categoryPath, loading = false }: SportsCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { isMobile, isLowEndDevice } = useMobilePerformance()

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  // Limit to 20 matches per carousel
  const displayMatches = matches.slice(0, 20)

  if (loading) {
    return (
      <section className="mb-8 md:mb-12 carousel-section" aria-labelledby={`${title}-heading`}>
        <div className="flex items-center justify-between mb-4 md:mb-6 px-4 md:px-0">
          <h2 id={`${title}-heading`} className="text-xl md:text-2xl lg:text-3xl font-bold text-gradient">
            {title}
          </h2>
        </div>
        <div className="flex space-x-3 md:space-x-4 overflow-x-scroll overflow-y-hidden scrollbar-hide pb-4 px-4 md:px-0">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-36 sm:w-40 md:w-48 lg:w-56">
              <SkeletonCard />
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (!displayMatches.length) return null

  return (
    <section className="mb-8 md:mb-12 carousel-section" aria-labelledby={`${title}-heading`}>
      <div className="flex items-center justify-between mb-4 md:mb-6 px-4 md:px-0">
        <h2 id={`${title}-heading`} className="text-xl md:text-2xl lg:text-3xl font-bold text-gradient">
          {title}
        </h2>
        
        <div className="flex items-center space-x-2">
          {/* View More Button */}
          {categoryPath && (
            <button
              onClick={() => navigate(categoryPath)}
              className="px-3 md:px-4 py-1.5 md:py-2 glass-effect rounded-lg font-semibold text-xs md:text-sm
                       hover:bg-primary/20 active:scale-95 transition-all duration-300 
                       flex items-center space-x-1 md:space-x-2"
            >
              <span>View More</span>
              <FaArrowRight className="text-xs" />
            </button>
          )}
          
          {/* Navigation Buttons */}
          <div className="hidden md:flex space-x-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-full glass-effect hover:bg-primary/20 transition-colors"
              aria-label="Scroll left"
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-full glass-effect hover:bg-primary/20 transition-colors"
              aria-label="Scroll right"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex space-x-3 md:space-x-4 overflow-x-scroll overflow-y-hidden scrollbar-hide scroll-smooth pb-4 px-4 md:px-0
                   snap-x snap-mandatory"
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorX: 'contain',
          touchAction: 'pan-y pan-x',
          willChange: 'scroll-position',
          // Enable virtual scrolling for large lists only on mobile
          ...(displayMatches.length > 20 && isMobile && {
            contain: 'layout style paint',
            contentVisibility: 'auto'
          }),
          // Disable smooth scrolling on low-end devices
          scrollBehavior: isLowEndDevice ? 'auto' : 'smooth'
        }}
      >
        {displayMatches.map((match) => (
          <div 
            key={match.id} 
            className="flex-shrink-0 w-36 sm:w-40 md:w-48 lg:w-56 snap-start"
            style={{
              // Optimize rendering for large lists only on mobile
              ...(displayMatches.length > 20 && isMobile && {
                contain: 'layout style paint'
              })
            }}
          >
            <SportsMatchCard match={match} />
          </div>
        ))}
      </div>
    </section>
  )
}

