import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { getBadgeUrl } from '../services/sports'
import type { Match } from '../types/sports'
import { useMobileDetection, useMobilePerformance } from '../hooks/useMobileDetection'
import { useState, useRef } from 'react'
import { FaPlay, FaInfoCircle } from 'react-icons/fa'

interface SportsMatchCardProps {
  match: Match
}

export const SportsMatchCard = ({ match }: SportsMatchCardProps) => {
  const isMobile = useMobileDetection()
  const { isLowEndDevice } = useMobilePerformance()
  const enableAnimations = !isLowEndDevice && !isMobile
  const [isHovered, setIsHovered] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Mouse position for spotlight and parallax
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseX = useSpring(x, { stiffness: 500, damping: 100 })
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 })

  const imageX = useTransform(mouseX, [-0.5, 0.5], ["5%", "-5%"])
  const imageY = useTransform(mouseY, [-0.5, 0.5], ["5%", "-5%"])

  const hasBadges = match.teams?.home?.badge || match.teams?.away?.badge
  const homeBadgeUrl = match.teams?.home?.badge ? getBadgeUrl(match.teams.home.badge) : null
  const awayBadgeUrl = match.teams?.away?.badge ? getBadgeUrl(match.teams.away.badge) : null
  const isLive = match.date && Date.now() >= match.date && Date.now() <= match.date + 7200000 // 2 hours window

  // Format date
  const matchDate = match.date ? new Date(match.date) : null
  const formattedDate = matchDate ? matchDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : ''

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
    // Mobile / Low-end version
    return (
      <Link
        to={`/sports/match/${match.id}`}
        className="block relative flex-shrink-0 w-full"
      >
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 shadow-md">
          {hasBadges ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
              {homeBadgeUrl && <img src={homeBadgeUrl} alt="" className="w-12 h-12 object-contain" />}
              <span className="text-white/50 text-xs font-bold">VS</span>
              {awayBadgeUrl && <img src={awayBadgeUrl} alt="" className="w-12 h-12 object-contain" />}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-primary/20">
              <span className="text-primary font-bold capitalize">{match.category}</span>
            </div>
          )}

          {isLive && (
            <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-red-600 text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold animate-pulse">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              LIVE
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
            <h3 className="text-white text-xs font-medium line-clamp-2">{match.title}</h3>
            <p className="text-gray-400 text-[10px] mt-0.5">{formattedDate}</p>
          </div>
        </div>
      </Link>
    )
  }

  // Premium Desktop Version
  return (
    <motion.div
      ref={ref}
      className="relative flex-shrink-0 w-full aspect-[2/3] rounded-xl overflow-hidden bg-[#0a0a0a] cursor-pointer group"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <Link to={`/sports/match/${match.id}`} className="block w-full h-full">
        {/* Parallax Content Container */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="w-[110%] h-[110%] absolute -top-[5%] -left-[5%] flex items-center justify-center"
            style={{ x: imageX, y: imageY }}
          >
            {hasBadges ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                {homeBadgeUrl && (
                  <img src={homeBadgeUrl} alt="" className="w-20 h-20 object-contain drop-shadow-2xl transform group-hover:scale-110 transition-transform duration-500" />
                )}
                <span className="text-white/20 text-xl font-black italic tracking-widest">VS</span>
                {awayBadgeUrl && (
                  <img src={awayBadgeUrl} alt="" className="w-20 h-20 object-contain drop-shadow-2xl transform group-hover:scale-110 transition-transform duration-500" />
                )}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 via-primary/5 to-primary/20">
                <div className="text-center transform group-hover:scale-110 transition-transform duration-500">
                  <div className="text-3xl font-black text-primary/50 mb-1 capitalize tracking-tighter">{match.category}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-widest">Match Day</div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

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

        {/* Live Badge */}
        {isLive && (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-red-600 text-white px-2.5 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg">
            <span className="w-2 h-2 bg-white rounded-full"></span>
            LIVE
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex gap-3 pointer-events-auto"
              >
                <button
                  className="p-3 rounded-full bg-white text-black hover:bg-pink-500 hover:text-white transition-colors shadow-lg transform hover:scale-110"
                  title="Watch Now"
                >
                  <FaPlay className="text-sm" />
                </button>
                <button
                  className="p-3 rounded-full border-2 border-white text-white hover:bg-white/20 transition-colors shadow-lg transform hover:scale-110"
                  title="More Info"
                >
                  <FaInfoCircle className="text-sm" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Info - Mask Reveal */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <div className="overflow-hidden mb-1">
            <motion.h3
              initial={{ y: "100%" }}
              animate={{ y: isHovered ? 0 : "100%" }}
              transition={{ duration: 0.4 }}
              className="text-white font-bold text-lg leading-tight line-clamp-2"
            >
              {match.title}
            </motion.h3>
            {/* Fallback title */}
            <h3 className={`text-white font-medium text-sm line-clamp-2 absolute bottom-6 left-4 right-4 transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
              {match.title}
            </h3>
          </div>

          <div className="overflow-hidden flex justify-between items-center">
            <motion.p
              initial={{ y: "100%" }}
              animate={{ y: isHovered ? 0 : "100%" }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-gray-300 text-xs font-medium"
            >
              {formattedDate}
            </motion.p>
            {/* Fallback date */}
            <p className={`text-gray-400 text-xs absolute bottom-2 left-4 transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
              {formattedDate}
            </p>
          </div>
        </div>

        {/* Border Reveal */}
        <div className="absolute inset-0 border border-white/0 group-hover:border-white/20 transition-colors duration-500 pointer-events-none" />
      </Link>
    </motion.div>
  )
}
