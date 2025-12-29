import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaUsers } from 'react-icons/fa'
import { getImageUrl } from '../services/tmdb'
import type { Cast } from '../types/tmdb'

interface CastListProps {
  cast: Cast[]
  showButton?: boolean
}

export const CastList = ({ cast, showButton = false }: CastListProps) => {
  const [showCast, setShowCast] = useState(!showButton)

  if (!cast.length) return null

  if (showButton && !showCast) {
    return (
      <div className="flex justify-center">
        <button
          onClick={() => setShowCast(true)}
          className="px-6 md:px-8 py-3 md:py-4 glass-effect rounded-lg font-semibold text-sm md:text-base
                   hover:bg-primary/20 active:scale-95 transition-all duration-300 
                   flex items-center space-x-2 md:space-x-3"
        >
          <FaUsers className="text-lg md:text-xl" />
          <span>View Cast</span>
        </button>
      </div>
    )
  }

  return (
    <section className="animate-slide-up" aria-labelledby="cast-heading">
      <h2 id="cast-heading" className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Cast & Crew</h2>
      
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {cast.map((person) => (
            <Link
              key={person.id}
              to={`/person/${person.id}`}
              className="glass-effect rounded-lg overflow-hidden hover-glow transform active:scale-95 md:hover:scale-105 
                       transition-all duration-300 cursor-pointer block"
            >
              <div className="aspect-[2/3] relative overflow-hidden bg-gray-800">
                <img
                  src={getImageUrl(person.profile_path, 'w185')}
                  alt={person.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm md:text-base line-clamp-1 mb-1">{person.name}</h3>
                <p className="text-xs md:text-sm text-gray-400 line-clamp-2">{person.character}</p>
              </div>
            </Link>
          ))}
        </div>
    </section>
  )
}

