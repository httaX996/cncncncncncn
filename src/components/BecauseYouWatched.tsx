import { useState, useEffect } from 'react'
import { Carousel } from './Carousel'
import { getWatchHistory } from '../utils/watchHistory'
import { fetchSimilarMovies, fetchSimilarTVShows } from '../services/tmdb'
import type { Movie, TVShow } from '../types/tmdb'

export const BecauseYouWatched = () => {
  const [recommendations, setRecommendations] = useState<(Movie | TVShow)[]>([])
  const [basedOnTitle, setBasedOnTitle] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRecommendations = async () => {
      setLoading(true)
      try {
        const history = getWatchHistory()
        
        if (history.length === 0) {
          setLoading(false)
          return
        }

        // Get the most recent movie or TV show
        const recentItem = history[0]
        setBasedOnTitle(recentItem.title)

        // Fetch similar content based on the most recent item
        let similarContent: (Movie | TVShow)[] = []
        
        if (recentItem.mediaType === 'movie') {
          similarContent = await fetchSimilarMovies(recentItem.id)
        } else {
          similarContent = await fetchSimilarTVShows(recentItem.id)
        }

        // Remove duplicates from watch history
        const watchedIds = new Set(history.map(h => h.id))
        const filtered = similarContent.filter(item => !watchedIds.has(item.id))

        setRecommendations(filtered)
      } catch (error) {
        console.error('Failed to load recommendations:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRecommendations()

    const handleWatchHistoryUpdate = () => {
      loadRecommendations()
    }

    window.addEventListener('watch-history-updated', handleWatchHistoryUpdate)
    return () => window.removeEventListener('watch-history-updated', handleWatchHistoryUpdate)
  }, [])

  if (loading || recommendations.length === 0) return null

  // Determine media type from first item
  const mediaType = 'title' in recommendations[0] ? 'movie' : 'tv'

  return (
    <div className="max-w-7xl mx-auto py-6 md:py-8">
      <Carousel
        title={`Because You Watched "${basedOnTitle}"`}
        items={recommendations}
        mediaType={mediaType}
      />
    </div>
  )
}

