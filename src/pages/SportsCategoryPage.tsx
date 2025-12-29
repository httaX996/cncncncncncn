import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'
import { SportsMatchCard } from '../components/SportsMatchCard'
import { SkeletonCard } from '../components/SkeletonCard'
import {
  fetchPopularLiveMatches,
  fetchUpcomingMatches,
  fetchMatchesBySport,
} from '../services/sports'
import type { Match } from '../types/sports'

const categoryConfig: Record<string, {
  title: string
  fetchFn: () => Promise<Match[]>
}> = {
  'live-popular': {
    title: 'Popular Live Matches',
    fetchFn: fetchPopularLiveMatches,
  },
  'upcoming': {
    title: 'Upcoming Matches',
    fetchFn: fetchUpcomingMatches,
  },
  'football': {
    title: 'Football Matches',
    fetchFn: () => fetchMatchesBySport('football'),
  },
  'cricket': {
    title: 'Cricket Matches',
    fetchFn: () => fetchMatchesBySport('cricket'),
  },
}

const SportsCategoryPage = () => {
  const { category } = useParams<{ category: string }>()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadContent = async () => {
      if (!category) return

      setLoading(true)
      try {
        // Check if it's a configured category
        const config = categoryConfig[category]
        if (config) {
          const data = await config.fetchFn()
          setMatches(data)
        } else {
          // Assume it's a sport ID
          const data = await fetchMatchesBySport(category)
          setMatches(data)
        }
      } catch (error) {
        console.error('Failed to load category content:', error)
      } finally {
        setLoading(false)
      }
    }

    loadContent()
  }, [category])

  // Get category title
  const getCategoryTitle = () => {
    if (!category) return 'Sports Matches'
    const config = categoryConfig[category]
    if (config) return config.title
    // Capitalize sport ID
    return `${category.charAt(0).toUpperCase() + category.slice(1)} Matches`
  }

  if (!category) return <div className="text-center py-20">Category not found</div>

  return (
    <div className="min-h-screen pt-20 md:pt-24 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <Link
            to="/sports"
            className="inline-flex items-center space-x-2 text-gray-300 hover:text-primary transition-colors mb-4"
          >
            <FaArrowLeft />
            <span>Back to Sports</span>
          </Link>
          {loading ? (
            <>
              <div className="h-10 md:h-12 bg-gray-700/50 rounded w-64 mb-2 shimmer" />
              <div className="h-4 md:h-5 bg-gray-700/50 rounded w-48 shimmer" />
            </>
          ) : (
            <>
              <div className="mb-4">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient">
                  {getCategoryTitle()}
                </h1>
                <p className="text-sm md:text-base text-gray-400 mt-2">
                  {matches.length} {matches.length === 1 ? 'match' : 'matches'} available
                </p>
              </div>
            </>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
          {loading ? (
            [...Array(18)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-full">
                <SkeletonCard />
              </div>
            ))
          ) : matches.length > 0 ? (
            matches.map((match) => (
              <div key={match.id} className="flex-shrink-0 w-full">
                <SportsMatchCard match={match} />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 text-gray-400">
              <p>No matches found in this category</p>
            </div>
          )}
        </div>

        {/* End Message */}
        {!loading && matches.length > 0 && (
          <div className="text-center mt-8 md:mt-12 text-gray-400">
            <p>Showing all {matches.length} {matches.length === 1 ? 'match' : 'matches'} 🏆</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SportsCategoryPage

