import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaPlay, FaInfoCircle, FaCalendar } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import { getBadgeUrl } from '../services/sports'

import type { Match } from '../types/sports'

interface SportsHeroProps {
  matches: Match[]
}

export const SportsHero = ({ matches }: SportsHeroProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)


  // Preload next images/badges logic could be added here if we had backdrop images
  // For now, we rely on badge caching

  useEffect(() => {
    if (matches.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % matches.length)
    }, 10000)

    return () => clearInterval(interval)
  }, [matches.length])

  if (!matches.length) return null

  const currentMatch = matches[currentIndex]
  const nextMatches = [
    matches[(currentIndex + 1) % matches.length],
    matches[(currentIndex + 2) % matches.length],
    matches[(currentIndex + 3) % matches.length]
  ]

  const hasBadges = currentMatch.teams?.home?.badge || currentMatch.teams?.away?.badge
  const homeBadgeUrl = currentMatch.teams?.home?.badge ? getBadgeUrl(currentMatch.teams.home.badge) : null
  const awayBadgeUrl = currentMatch.teams?.away?.badge ? getBadgeUrl(currentMatch.teams.away.badge) : null
  const isLive = currentMatch.date && Date.now() >= currentMatch.date && Date.now() <= currentMatch.date + 7200000

  const matchDate = currentMatch.date ? new Date(currentMatch.date) : null
  const formattedDate = matchDate ? matchDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : ''

  return (
    <section className="relative h-[85vh] md:h-screen w-full overflow-hidden group" aria-label="Featured match">
      {/* Dynamic Background with Ken Burns Effect */}
      <div className="absolute inset-0 bg-gray-900 overflow-hidden">
        <AnimatePresence>
          <motion.div
            key={currentMatch.id}
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 1.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* Abstract Sports Background or Team Colors */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />

            {/* Large Faded Badges as Background */}
            {hasBadges && (
              <div className="absolute inset-0 flex items-center justify-center opacity-10 blur-sm scale-150">
                <div className="flex items-center gap-32">
                  {homeBadgeUrl && (
                    <img
                      src={homeBadgeUrl}
                      alt=""
                      className="w-96 h-96 object-contain"
                    />
                  )}
                  {awayBadgeUrl && (
                    <img
                      src={awayBadgeUrl}
                      alt=""
                      className="w-96 h-96 object-contain"
                    />
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/30 to-transparent" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/40" />
      </div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end sm:items-center pb-24 sm:pb-0">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">

          {/* Main Info */}
          <div className="lg:col-span-8 max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMatch.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-3 md:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 leading-tight drop-shadow-2xl">
                  {currentMatch.title}
                </h1>

                <div className="flex flex-wrap items-center gap-x-4 md:gap-x-6 gap-y-2 mb-6 md:mb-10">
                  {isLive && (
                    <div className="flex items-center space-x-2 glass-effect rounded-full px-3 md:px-4 py-2 bg-red-600/80 border border-red-500/50 shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      <span className="text-white text-sm md:text-base font-bold tracking-wider">LIVE</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 glass-effect rounded-full px-3 md:px-4 py-2 bg-white/10 border border-white/10">
                    <FaCalendar className="text-gray-300 text-sm md:text-base" />
                    <span className="text-gray-200 text-sm md:text-base font-medium">
                      {formattedDate}
                    </span>
                  </div>
                  <div className="glass-effect rounded-full px-3 md:px-4 py-2 bg-white/5 border border-white/10">
                    <span className="text-gray-300 text-sm md:text-base font-semibold capitalize tracking-wide">
                      {currentMatch.category}
                    </span>
                  </div>
                </div>

                {/* Team Matchup Display */}
                {currentMatch.teams?.home?.name && currentMatch.teams?.away?.name && (
                  <div className="flex items-center gap-6 mb-8 md:mb-12">
                    <div className="flex flex-col items-center gap-3 group/team">
                      <div className="w-20 h-20 md:w-24 md:h-24 p-4 glass-effect rounded-2xl flex items-center justify-center bg-white/5 transition-transform group-hover/team:scale-110 duration-300">
                        {homeBadgeUrl ? (
                          <img src={homeBadgeUrl} alt={currentMatch.teams.home.name} className="w-full h-full object-contain drop-shadow-md" />
                        ) : (
                          <div className="w-full h-full bg-gray-700 rounded-full" />
                        )}
                      </div>
                      <span className="text-white font-bold text-sm md:text-lg text-center max-w-[120px] leading-tight">{currentMatch.teams.home.name}</span>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                      <span className="text-3xl md:text-5xl font-black text-white/20 italic">VS</span>
                    </div>

                    <div className="flex flex-col items-center gap-3 group/team">
                      <div className="w-20 h-20 md:w-24 md:h-24 p-4 glass-effect rounded-2xl flex items-center justify-center bg-white/5 transition-transform group-hover/team:scale-110 duration-300">
                        {awayBadgeUrl ? (
                          <img src={awayBadgeUrl} alt={currentMatch.teams.away.name} className="w-full h-full object-contain drop-shadow-md" />
                        ) : (
                          <div className="w-full h-full bg-gray-700 rounded-full" />
                        )}
                      </div>
                      <span className="text-white font-bold text-sm md:text-lg text-center max-w-[120px] leading-tight">{currentMatch.teams.away.name}</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full sm:w-auto">
                  <Link
                    to={`/sports/match/${currentMatch.id}`}
                    className="group relative px-8 py-4 bg-white text-black rounded-xl font-bold text-lg flex items-center justify-center gap-3 overflow-hidden transition-transform hover:scale-105 active:scale-95"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-violet-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                    <FaPlay className="text-base" />
                    <span>Watch Now</span>
                  </Link>

                  <Link
                    to={`/sports/match/${currentMatch.id}`}
                    className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-white/20 transition-colors"
                  >
                    <FaInfoCircle className="text-base" />
                    <span>View Info</span>
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Thumbnail Navigation (Desktop Only) */}
          <div className="hidden lg:flex lg:col-span-4 flex-col gap-4 justify-end pb-8">
            <h3 className="text-white/80 font-medium text-sm uppercase tracking-widest mb-2">Up Next</h3>
            <div className="flex flex-col gap-3">
              {nextMatches.map((match, idx) => {
                const nextHomeBadge = match.teams?.home?.badge ? getBadgeUrl(match.teams.home.badge) : null
                const nextAwayBadge = match.teams?.away?.badge ? getBadgeUrl(match.teams.away.badge) : null

                return (
                  <button
                    key={match.id}
                    onClick={() => setCurrentIndex((currentIndex + 1 + idx) % matches.length)}
                    className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/10 transition-colors text-left w-full border border-transparent hover:border-white/10"
                  >
                    <div className="relative w-20 h-14 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center gap-1 p-1">
                      {nextHomeBadge && <img src={nextHomeBadge} className="w-6 h-6 object-contain" alt="" />}
                      <span className="text-white/40 text-xs font-bold">VS</span>
                      {nextAwayBadge && <img src={nextAwayBadge} className="w-6 h-6 object-contain" alt="" />}

                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <FaPlay className="text-white text-xs drop-shadow-md" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium text-sm line-clamp-1 group-hover:text-pink-400 transition-colors">
                        {match.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                        <span className="capitalize">{match.category}</span>
                        <span>•</span>
                        <span>{new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-50">
        <motion.div
          key={currentIndex}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 10, ease: "linear" }}
          className="h-full bg-gradient-to-r from-pink-500 to-violet-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]"
        />
      </div>

      {/* Mobile Slide Indicators */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 lg:hidden">
        {matches.slice(0, 5).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${index === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/30'
              }`}
          />
        ))}
      </div>
    </section>
  )
}
