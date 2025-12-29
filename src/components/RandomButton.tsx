import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaDice } from 'react-icons/fa'
import { fetchTrendingMovies, fetchTrendingTVShows } from '../services/tmdb'

interface RandomButtonProps {
  variant?: 'navbar' | 'floating'
}

export const RandomButton = ({ variant = 'navbar' }: RandomButtonProps) => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const getRandomContent = async () => {
    setLoading(true)
    try {
      // Randomly choose between movies and TV shows
      const isMovie = Math.random() > 0.5
      
      const results = isMovie 
        ? await fetchTrendingMovies()
        : await fetchTrendingTVShows()
      
      if (results.length > 0) {
        const randomIndex = Math.floor(Math.random() * results.length)
        const randomItem = results[randomIndex]
        const mediaType = isMovie ? 'movie' : 'tv'
        
        navigate(`/${mediaType}/${randomItem.id}`)
      }
    } catch (error) {
      console.error('Failed to get random content:', error)
    } finally {
      setLoading(false)
    }
  }

  if (variant === 'floating') {
    return (
      <button
        onClick={getRandomContent}
        disabled={loading}
        className="fixed bottom-24 right-6 z-50 p-3 md:p-4 glass-effect rounded-full
                 shadow-lg hover:shadow-xl hover:bg-white/20
                 transform hover:scale-110 active:scale-95 transition-all duration-300
                 group disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Random movie or show"
      >
        <FaDice className={`text-primary text-lg md:text-xl ${loading ? 'animate-spin' : 'group-hover:animate-bounce'}`} />
      </button>
    )
  }

  return (
    <button
      onClick={getRandomContent}
      disabled={loading}
      className="px-3 md:px-4 py-2 glass-effect rounded-lg font-semibold text-sm md:text-base
               hover:bg-white/20 active:scale-95 transition-all duration-300
               flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Random movie or show"
    >
      <FaDice className={loading ? 'animate-spin' : ''} />
      <span className="hidden lg:inline">Random</span>
    </button>
  )
}

