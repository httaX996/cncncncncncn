import { useEffect, useState } from 'react'
import { SEO } from '../components/SEO'
import { SportsHero } from '../components/SportsHero'
import { SportsCarousel } from '../components/SportsCarousel'
import { SkeletonHero } from '../components/SkeletonHero'
import { SkeletonCard } from '../components/SkeletonCard'
import {
  fetchPopularLiveMatches,
  fetchUpcomingMatches,
  fetchMatchesBySport,
  fetchAllSports,
} from '../services/sports'
import type { Match, Sport } from '../types/sports'

const SportsHomePage = () => {
  const [popularLiveMatches, setPopularLiveMatches] = useState<Match[]>([])
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([])
  const [footballMatches, setFootballMatches] = useState<Match[]>([])
  const [cricketMatches, setCricketMatches] = useState<Match[]>([])
  const [otherSportsMatches, setOtherSportsMatches] = useState<{ sport: Sport; matches: Match[] }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadContent = async () => {
      try {
        // Load all data in parallel
        const [popularLive, upcoming, football, cricket, allSports] = await Promise.all([
          fetchPopularLiveMatches(),
          fetchUpcomingMatches(),
          fetchMatchesBySport('football'),
          fetchMatchesBySport('cricket'),
          fetchAllSports(),
        ])

        setPopularLiveMatches(popularLive)
        setUpcomingMatches(upcoming)
        setFootballMatches(football)
        setCricketMatches(cricket)

        // Fetch matches for other sports (excluding football and cricket)
        const otherSports = allSports.filter(
          (sport) => sport.id !== 'football' && sport.id !== 'cricket'
        )

        const otherSportsData = await Promise.all(
          otherSports.map(async (sport) => {
            const matches = await fetchMatchesBySport(sport.id)
            return { sport, matches }
          })
        )

        // Filter out sports with no matches
        setOtherSportsMatches(otherSportsData.filter((item) => item.matches.length > 0))
      } catch (error) {
        console.error('Failed to load sports content:', error)
      } finally {
        setLoading(false)
      }
    }

    loadContent()
  }, [])

  // Ensure homepage starts at top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <SkeletonHero />

        <div className="max-w-7xl mx-auto py-6 md:py-12 space-y-6 md:space-y-12 px-4 sm:px-6 lg:px-8">
          {/* Skeleton Carousels */}
          {[...Array(7)].map((_, index) => (
            <div key={index} className="space-y-4">
              <div className="h-6 md:h-8 bg-gray-800/50 rounded w-48 shimmer" />
              <div className="flex space-x-3 md:space-x-4 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-32 sm:w-40 md:w-48">
                    <SkeletonCard />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-20 md:pb-0">
      <SEO
        title="Sports - SanuFlix"
        description="Watch live sports matches, upcoming games, and follow your favorite teams. Live streaming for football, cricket, and more."
      />

      {/* Featured Hero Section */}
      {popularLiveMatches.length > 0 && (
        <SportsHero matches={popularLiveMatches.slice(0, 5)} />
      )}

      <div className="max-w-7xl mx-auto py-6 md:py-12 space-y-6 md:space-y-12">
        {/* Popular Live Matches Carousel */}
        {popularLiveMatches.length > 0 && (
          <SportsCarousel
            title="Popular Live Matches"
            matches={popularLiveMatches}
            categoryPath="/sports/category/live-popular"
          />
        )}

        {/* Upcoming Matches Carousel */}
        {upcomingMatches.length > 0 && (
          <SportsCarousel
            title="Upcoming Matches"
            matches={upcomingMatches}
            categoryPath="/sports/category/upcoming"
          />
        )}

        {/* Football Matches Carousel */}
        {footballMatches.length > 0 && (
          <SportsCarousel
            title="Football"
            matches={footballMatches}
            categoryPath="/sports/category/football"
          />
        )}

        {/* Cricket Matches Carousel */}
        {cricketMatches.length > 0 && (
          <SportsCarousel
            title="Cricket"
            matches={cricketMatches}
            categoryPath="/sports/category/cricket"
          />
        )}

        {/* Other Sports Carousels */}
        {otherSportsMatches.map(({ sport, matches }) => (
          matches.length > 0 && (
            <SportsCarousel
              key={sport.id}
              title={sport.name}
              matches={matches}
              categoryPath={`/sports/category/${sport.id}`}
            />
          )
        ))}
      </div>
    </div>
  )
}

export default SportsHomePage
