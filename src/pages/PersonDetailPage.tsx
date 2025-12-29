import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FaArrowLeft, FaCalendar, FaMapMarkerAlt, FaFilm, FaTv } from 'react-icons/fa'
import { SEO } from '../components/SEO'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { MediaCard } from '../components/MediaCard'
import {
  fetchPersonDetails,
  fetchPersonMovieCredits,
  fetchPersonTVCredits,
  getImageUrl,
} from '../services/tmdb'
import type { PersonDetails, PersonMovieCredits, PersonTVCredits, Movie, TVShow } from '../types/tmdb'

const PersonDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const [person, setPerson] = useState<PersonDetails | null>(null)
  const [movieCredits, setMovieCredits] = useState<PersonMovieCredits | null>(null)
  const [tvCredits, setTVCredits] = useState<PersonTVCredits | null>(null)
  const [loading, setLoading] = useState(true)
  const [showFullBio, setShowFullBio] = useState(false)

  useEffect(() => {
    const loadPersonData = async () => {
      if (!id) return

      setLoading(true)
      try {
        const [personData, movieCreds, tvCreds] = await Promise.all([
          fetchPersonDetails(Number(id)),
          fetchPersonMovieCredits(Number(id)),
          fetchPersonTVCredits(Number(id)),
        ])

        setPerson(personData)
        setMovieCredits(movieCreds)
        setTVCredits(tvCreds)
      } catch (error) {
        console.error('Failed to load person details:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPersonData()
  }, [id])

  // Ensure page starts at top
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  if (loading) return <LoadingSpinner />
  if (!person) return <div className="text-center py-20">Person not found</div>

  // Get top 8 known for items (sorted by popularity)
  const knownForMovies = movieCredits?.cast
    .filter(m => m.poster_path)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 4) || []
  
  const knownForTV = tvCredits?.cast
    .filter(t => t.poster_path)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 4) || []

  const knownFor = [...knownForMovies, ...knownForTV]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 8)

  // All movies and TV shows (sorted by release date, most recent first)
  const allMovies = movieCredits?.cast
    .filter(m => m.release_date)
    .sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime()) || []

  const allTVShows = tvCredits?.cast
    .filter(t => t.first_air_date)
    .sort((a, b) => new Date(b.first_air_date).getTime() - new Date(a.first_air_date).getTime()) || []

  const age = person.birthday 
    ? Math.floor((new Date().getTime() - new Date(person.birthday).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null

  const bioText = person.biography || 'No biography available.'
  const shouldTruncate = bioText.length > 500
  const displayBio = showFullBio || !shouldTruncate ? bioText : bioText.slice(0, 500) + '...'

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-20 md:pt-24">
      <SEO
        title={person.name}
        description={person.biography ? person.biography.slice(0, 155) + '...' : `View ${person.name}'s filmography and biography on SanuFlix`}
        image={getImageUrl(person.profile_path, 'h632')}
        type="profile"
      />
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 md:mb-6">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-gray-300 hover:text-primary transition-colors"
        >
          <FaArrowLeft />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Person Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 md:mb-12">
        <div className="flex flex-col md:flex-row items-start gap-6 md:gap-10">
          {/* Profile Photo */}
          <div className="flex-shrink-0 w-48 sm:w-64 md:w-80 rounded-lg overflow-hidden shadow-lg mx-auto md:mx-0">
            <img
              src={getImageUrl(person.profile_path, 'h632')}
              alt={person.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              {person.name}
            </h1>

            <div className="space-y-3 mb-6">
              {person.known_for_department && (
                <p className="text-lg text-gray-300">
                  <span className="text-primary font-semibold">Known For:</span>{' '}
                  {person.known_for_department}
                </p>
              )}

              {person.birthday && (
                <div className="flex items-center space-x-2 text-gray-300">
                  <FaCalendar className="text-primary" />
                  <span>
                    {new Date(person.birthday).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                    {age && ` (${age} years old)`}
                  </span>
                </div>
              )}

              {person.place_of_birth && (
                <div className="flex items-center space-x-2 text-gray-300">
                  <FaMapMarkerAlt className="text-primary" />
                  <span>{person.place_of_birth}</span>
                </div>
              )}
            </div>

            {/* Biography */}
            <div className="glass-effect rounded-lg p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold mb-3">Biography</h2>
              <p className="text-gray-200 text-sm md:text-base leading-relaxed whitespace-pre-line">
                {displayBio}
              </p>
              {shouldTruncate && (
                <button
                  onClick={() => setShowFullBio(!showFullBio)}
                  className="text-primary hover:text-primary-dark font-semibold mt-3 transition-colors"
                >
                  {showFullBio ? 'Show Less' : 'Read More'}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Known For Section */}
      {knownFor.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Known For</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4 lg:gap-6">
            {knownFor.map((item: any) => {
              const mediaType = 'title' in item ? 'movie' : 'tv'
              return (
                <MediaCard
                  key={`${mediaType}-${item.id}`}
                  item={item}
                  mediaType={mediaType}
                />
              )
            })}
          </div>
        </section>
      )}

      {/* Movies Section */}
      {allMovies.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 md:mb-12">
          <div className="flex items-center space-x-3 mb-4 md:mb-6">
            <FaFilm className="text-primary text-2xl md:text-3xl" />
            <h2 className="text-2xl md:text-3xl font-bold">Movies ({allMovies.length})</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
            {allMovies.map((movie) => (
              <MediaCard
                key={movie.id}
                item={movie as Movie}
                mediaType="movie"
              />
            ))}
          </div>
        </section>
      )}

      {/* TV Shows Section */}
      {allTVShows.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 md:mb-12">
          <div className="flex items-center space-x-3 mb-4 md:mb-6">
            <FaTv className="text-primary text-2xl md:text-3xl" />
            <h2 className="text-2xl md:text-3xl font-bold">TV Shows ({allTVShows.length})</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
            {allTVShows.map((show) => (
              <MediaCard
                key={show.id}
                item={show as TVShow}
                mediaType="tv"
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default PersonDetailPage

