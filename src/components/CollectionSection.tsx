import { Link } from 'react-router-dom'
import { FaStar, FaFilm } from 'react-icons/fa'
import { getImageUrl } from '../services/tmdb'
import type { CollectionDetails } from '../types/tmdb'

interface CollectionSectionProps {
  collection: CollectionDetails
}

export const CollectionSection = ({ collection }: CollectionSectionProps) => {
  // Sort movies chronologically by release date
  const sortedMovies = [...collection.parts].sort(
    (a, b) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime()
  )

  return (
    <section className="mb-8 md:mb-12">
      {/* Collection Header */}
      <div className="relative rounded-xl overflow-hidden mb-6 md:mb-8">
        <div className="relative h-48 md:h-64 overflow-hidden">
          <img
            src={getImageUrl(collection.backdrop_path, 'original')}
            alt={collection.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 flex items-end p-4 md:p-6">
            <div className="flex items-center space-x-3 md:space-x-4">
              <FaFilm className="text-primary text-2xl md:text-3xl" />
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">{collection.name}</h2>
                <p className="text-sm md:text-base text-gray-300 mt-1">
                  {sortedMovies.length} {sortedMovies.length === 1 ? 'Movie' : 'Movies'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collection Overview */}
      {collection.overview && (
        <p className="text-gray-300 text-sm md:text-base mb-6 md:mb-8 leading-relaxed">
          {collection.overview}
        </p>
      )}

      {/* Movies Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
        {sortedMovies.map((movie, index) => {
          const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'
          
          return (
            <Link
              key={movie.id}
              to={`/movie/${movie.id}`}
              className="group relative block rounded-lg md:rounded-xl overflow-hidden hover-glow transform active:scale-95 md:hover:scale-105 
                       transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {/* Poster */}
              <div className="aspect-[2/3] relative overflow-hidden bg-gray-800">
                <img
                  src={getImageUrl(movie.poster_path, 'w342')}
                  alt={movie.title}
                  className="w-full h-full object-cover transition-transform duration-500 md:group-hover:scale-110"
                  loading="lazy"
                />
                
                {/* Part Badge */}
                <div className="absolute top-2 left-2 bg-gradient-primary rounded-full px-2 md:px-3 py-1 text-xs md:text-sm font-bold">
                  #{index + 1}
                </div>
                
                {/* Rating */}
                <div className="absolute top-2 right-2 glass-effect rounded-full px-1.5 md:px-2 py-0.5 md:py-1 flex items-center space-x-1">
                  <FaStar className="text-yellow-400 text-[10px] md:text-xs" />
                  <span className="text-[10px] md:text-xs font-semibold">{movie.vote_average.toFixed(1)}</span>
                </div>

                {/* Info */}
                <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3 bg-gradient-to-t from-black via-black/80 to-transparent">
                  <h3 className="font-bold text-white text-xs md:text-sm line-clamp-2 mb-0.5">{movie.title}</h3>
                  <p className="text-gray-300 text-[10px] md:text-xs">{year}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

