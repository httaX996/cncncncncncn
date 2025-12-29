import { useState, useEffect, memo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { getImageUrl } from '../services/tmdb'
import { isFavoriteStudio, toggleFavoriteStudio } from '../utils/favoriteStudios'
import type { ProductionCompany } from '../types/tmdb'
import { useMobileDetection, useMobilePerformance } from '../hooks/useMobileDetection'

interface CompanyCardProps {
  company: ProductionCompany
  contentCount?: number
  onFavoriteChange?: () => void
}

export const CompanyCard = memo(({ company, contentCount, onFavoriteChange }: CompanyCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false)
  const isMobile = useMobileDetection()
  const { isLowEndDevice } = useMobilePerformance()
  const enableAnimations = !isLowEndDevice && !isMobile
  const ref = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  // Mouse position for spotlight and parallax
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseX = useSpring(x, { stiffness: 500, damping: 100 })
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 })

  const imageX = useTransform(mouseX, [-0.5, 0.5], ["10%", "-10%"])
  const imageY = useTransform(mouseY, [-0.5, 0.5], ["10%", "-10%"])

  useEffect(() => {
    setIsFavorite(isFavoriteStudio(company.id))
  }, [company.id])

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const newState = toggleFavoriteStudio({
      id: company.id,
      name: company.name,
      logo_path: company.logo_path
    })

    setIsFavorite(newState)
    onFavoriteChange?.()
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || !enableAnimations) return
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

  if (!enableAnimations) {
    return (
      <Link
        to={`/studio/${company.id}`}
        className="group relative block glass-effect rounded-lg md:rounded-xl p-4 md:p-6 
                   hover-glow transform active:scale-95 md:hover:scale-105 
                   transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label={`View ${company.name} content`}
      >
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 z-10 p-2 rounded-full bg-black/50 backdrop-blur-sm
                     opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300
                     hover:bg-black/70 hover:scale-110 active:scale-95"
        >
          {isFavorite ? (
            <FaHeart className="text-primary text-sm md:text-base" />
          ) : (
            <FaRegHeart className="text-white text-sm md:text-base" />
          )}
        </button>
        <div className="flex flex-col items-center space-y-3 md:space-y-4">
          <div className="w-full aspect-[3/2] flex items-center justify-center bg-white/5 rounded-lg overflow-hidden">
            {company.logo_path ? (
              <img
                src={getImageUrl(company.logo_path, 'w200')}
                alt={company.name}
                className="max-w-full max-h-full object-contain p-2 md:p-4
                           transition-transform duration-500 md:group-hover:scale-110"
                loading="lazy"
              />
            ) : (
              <div className="text-center p-4">
                <span className="text-sm md:text-base font-bold text-gray-400">
                  {company.name}
                </span>
              </div>
            )}
          </div>
          <h3 className="font-bold text-sm md:text-base text-center line-clamp-2 min-h-[2.5rem]">
            {company.name}
          </h3>
          {contentCount !== undefined && contentCount > 0 && (
            <div className="glass-effect rounded-full px-3 py-1 text-xs md:text-sm">
              <span className="text-gray-400">{contentCount} titles</span>
            </div>
          )}
        </div>
      </Link>
    )
  }

  // Premium Desktop Version
  return (
    <motion.div
      ref={ref}
      className="relative flex-shrink-0 w-full rounded-xl overflow-hidden bg-[#0a0a0a] cursor-pointer group"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        to={`/studio/${company.id}`}
        className="block relative p-6"
      >
        {/* Parallax Background/Logo Container */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="w-[120%] h-[120%] absolute -top-[10%] -left-[10%] bg-gradient-to-br from-gray-900 via-black to-gray-900"
            style={{ x: imageX, y: imageY }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center space-y-4">
          {/* Logo with Parallax */}
          <div className="w-full aspect-[3/2] flex items-center justify-center relative">
            <motion.div
              className="w-full h-full flex items-center justify-center"
              style={{ x: imageX, y: imageY }}
            >
              {company.logo_path ? (
                <img
                  src={getImageUrl(company.logo_path, 'w200')}
                  alt={company.name}
                  className="max-w-full max-h-full object-contain p-2 filter drop-shadow-2xl group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
              ) : (
                <span className="text-xl font-bold text-gray-500 group-hover:text-white transition-colors duration-300">
                  {company.name}
                </span>
              )}
            </motion.div>
          </div>

          {/* Text Reveal */}
          <div className="text-center w-full overflow-hidden">
            <motion.h3
              initial={{ y: 0 }}
              animate={{ y: isHovered ? -5 : 0 }}
              className="font-bold text-lg text-white group-hover:text-primary transition-colors duration-300 line-clamp-1"
            >
              {company.name}
            </motion.h3>

            {contentCount !== undefined && contentCount > 0 && (
              <motion.div
                initial={{ opacity: 0.5 }}
                animate={{ opacity: isHovered ? 1 : 0.5 }}
                className="text-xs text-gray-400 mt-1"
              >
                {contentCount} titles
              </motion.div>
            )}
          </div>
        </div>

        {/* Favorite Button */}
        <motion.button
          onClick={handleFavoriteClick}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: isHovered || isFavorite ? 1 : 0, scale: isHovered || isFavorite ? 1 : 0.8 }}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-primary hover:text-white transition-colors duration-300"
        >
          {isFavorite ? (
            <FaHeart className="text-primary hover:text-white text-sm" />
          ) : (
            <FaRegHeart className="text-white text-sm" />
          )}
        </motion.button>

        {/* Spotlight / Glare Effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: useTransform(
              [mouseX, mouseY] as any,
              ([latestX, latestY]: number[]) => `radial-gradient(circle at ${50 + latestX * 100}% ${50 + latestY * 100}%, rgba(255,255,255,0.1) 0%, transparent 50%)`
            )
          }}
        />

        {/* Border Reveal */}
        <div className="absolute inset-0 border border-white/5 group-hover:border-white/20 rounded-xl transition-colors duration-500 pointer-events-none" />
      </Link>
    </motion.div>
  )
}, (prevProps, nextProps) => {
  return (
    prevProps.company.id === nextProps.company.id &&
    prevProps.contentCount === nextProps.contentCount
  )
})

