import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaFilm, FaTv, FaFire, FaLaugh, FaHeart, FaGhost, FaBolt, FaDragon, FaTheaterMasks } from 'react-icons/fa'
import { fetchMovieGenres, fetchTVGenres } from '../services/tmdb'
import { SkeletonCard } from '../components/SkeletonCard'
import type { Genre } from '../types/tmdb'

// Icon mapping for common genres
const genreIcons: Record<number, any> = {
  28: FaBolt,        // Action
  12: FaDragon,      // Adventure
  16: FaTheaterMasks, // Animation
  35: FaLaugh,       // Comedy
  80: FaGhost,       // Crime
  18: FaTheaterMasks, // Drama
  14: FaDragon,      // Fantasy
  27: FaGhost,       // Horror
  10749: FaHeart,    // Romance
  878: FaBolt,       // Science Fiction
  53: FaFire,        // Thriller
}

const getGenreIcon = (genreId: number) => {
  return genreIcons[genreId] || FaFilm
}

// Color gradients for genres
const gradients = [
  'from-pink-500 to-rose-500',
  'from-purple-500 to-indigo-500',
  'from-blue-500 to-cyan-500',
  'from-green-500 to-emerald-500',
  'from-yellow-500 to-orange-500',
  'from-red-500 to-pink-500',
  'from-indigo-500 to-purple-500',
  'from-cyan-500 to-blue-500',
]

const GenreBrowsePage = () => {
  const [movieGenres, setMovieGenres] = useState<Genre[]>([])
  const [tvGenres, setTVGenres] = useState<Genre[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const [movies, tv] = await Promise.all([
          fetchMovieGenres(),
          fetchTVGenres(),
        ])
        setMovieGenres(movies.genres)
        setTVGenres(tv.genres)
      } catch (error) {
        console.error('Failed to load genres:', error)
      } finally {
        setLoading(false)
      }
    }

    loadGenres()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen pt-20 md:pt-24 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="h-10 md:h-12 bg-gray-700/50 rounded w-64 mb-8 shimmer" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {[...Array(10)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const GenreCard = ({ genre, mediaType, index }: { genre: Genre; mediaType: 'movie' | 'tv'; index: number }) => {
    const Icon = getGenreIcon(genre.id)
    const gradient = gradients[index % gradients.length]

    return (
      <Link
        to={`/genre/${mediaType}?genre=${genre.id}`}
        className="group relative overflow-hidden rounded-xl aspect-[3/2] glass-effect hover-glow 
                 transform active:scale-95 md:hover:scale-105 transition-all duration-300"
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20 group-hover:opacity-30 transition-opacity`} />
        
        <div className="relative h-full flex flex-col items-center justify-center p-4 md:p-6">
          <Icon className="text-4xl md:text-5xl lg:text-6xl mb-2 md:mb-3 text-white/90 group-hover:scale-110 transition-transform" />
          <h3 className="text-base md:text-lg lg:text-xl font-bold text-center text-white">
            {genre.name}
          </h3>
        </div>
      </Link>
    )
  }

  return (
    <div className="min-h-screen pt-20 md:pt-24 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient mb-2">
            Browse by Genre
          </h1>
          <p className="text-sm md:text-base text-gray-400">
            Explore movies and TV shows by your favorite genres
          </p>
        </div>

        {/* Movie Genres */}
        <section className="mb-10 md:mb-16">
          <div className="flex items-center space-x-3 mb-4 md:mb-6">
            <FaFilm className="text-primary text-2xl md:text-3xl" />
            <h2 className="text-2xl md:text-3xl font-bold">Movie Genres</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
            {movieGenres.map((genre, index) => (
              <GenreCard key={genre.id} genre={genre} mediaType="movie" index={index} />
            ))}
          </div>
        </section>

        {/* TV Show Genres */}
        <section>
          <div className="flex items-center space-x-3 mb-4 md:mb-6">
            <FaTv className="text-primary text-2xl md:text-3xl" />
            <h2 className="text-2xl md:text-3xl font-bold">TV Show Genres</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
            {tvGenres.map((genre, index) => (
              <GenreCard key={genre.id} genre={genre} mediaType="tv" index={index} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default GenreBrowsePage

