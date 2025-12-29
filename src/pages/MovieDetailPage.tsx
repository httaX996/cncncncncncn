import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DetailsLayout } from '../components/DetailsLayout'
import { CastList } from '../components/CastList'
import { Carousel } from '../components/Carousel'
import { CollectionSection } from '../components/CollectionSection'
import { CompanyCard } from '../components/CompanyCard'
import { MediaGallery } from '../components/MediaGallery'
import { ReviewsSection } from '../components/ReviewsSection'
import { Modal } from '../components/Modal'
import {
  fetchMovieDetails,
  fetchMovieVideos,
  fetchMovieCredits,
  fetchSimilarMovies,
  fetchCollection,
  fetchMovieImages,
  fetchExternalIds,
  fetchReviews,
  fetchKeywords,
  fetchMovieContentRatings
} from '../services/tmdb'
import { isInWatchlist, toggleWatchlist } from '../utils/watchlist'
import type { MovieDetails, Video, Credits, Movie, CollectionDetails, Keyword } from '../types/tmdb'
import { FaImdb, FaInstagram, FaTwitter, FaFacebook, FaLink } from 'react-icons/fa'

const MovieDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // State
  const [movie, setMovie] = useState<MovieDetails | null>(null)
  const [trailer, setTrailer] = useState<Video | null>(null)
  const [credits, setCredits] = useState<Credits | null>(null)
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([])
  const [collection, setCollection] = useState<CollectionDetails | null>(null)
  const [images, setImages] = useState<{ backdrops: any[], posters: any[], logos: any[] } | null>(null)
  const [externalIds, setExternalIds] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [rating, setRating] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)
  const [showTrailer, setShowTrailer] = useState(false)
  const [inWatchlist, setInWatchlist] = useState(false)

  useEffect(() => {
    const loadMovieDetails = async () => {
      if (!id) return

      setLoading(true)
      try {
        const movieId = Number(id)
        const [
          movieData,
          videos,
          creditsData,
          similar,
          imagesData,
          idsData,
          reviewsData,
          keywordsData,
          ratingsData
        ] = await Promise.all([
          fetchMovieDetails(movieId),
          fetchMovieVideos(movieId),
          fetchMovieCredits(movieId),
          fetchSimilarMovies(movieId),
          fetchMovieImages(movieId),
          fetchExternalIds(movieId, 'movie'),
          fetchReviews(movieId, 'movie'),
          fetchKeywords(movieId, 'movie'),
          fetchMovieContentRatings(movieId)
        ])

        setMovie(movieData)
        setSimilarMovies(similar)
        setCredits(creditsData)
        setImages(imagesData)
        setExternalIds(idsData)
        setReviews(reviewsData)
        setKeywords(keywordsData)
        setInWatchlist(isInWatchlist(movieId, 'movie'))

        // Find trailer
        const youtubeTrailer = videos.find(
          (v) => v.type === 'Trailer' && v.site === 'YouTube'
        )
        setTrailer(youtubeTrailer || videos[0] || null)

        // Set Rating
        const usRating = ratingsData.results.find(r => r.iso_3166_1 === 'US')
        if (usRating && usRating.release_dates.length > 0) {
          setRating(usRating.release_dates[0].certification)
        }

        // Fetch collection
        if (movieData.belongs_to_collection) {
          try {
            const collectionData = await fetchCollection(movieData.belongs_to_collection.id)
            setCollection(collectionData)
          } catch (error) {
            console.error('Failed to load collection:', error)
          }
        }
      } catch (error) {
        console.error('Failed to load movie details:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMovieDetails()

    const handleWatchlistUpdate = () => {
      if (id) setInWatchlist(isInWatchlist(Number(id), 'movie'))
    }

    window.addEventListener('watchlist-updated', handleWatchlistUpdate)
    return () => window.removeEventListener('watchlist-updated', handleWatchlistUpdate)
  }, [id])

  return (
    <DetailsLayout
      item={movie}
      type="movie"
      trailer={trailer}
      loading={loading}
      onPlay={() => navigate(`/movie/${id}/watch`)}
      onTrailer={() => setShowTrailer(true)}
      inWatchlist={inWatchlist}
      onToggleWatchlist={() => movie && toggleWatchlist(movie, 'movie')}
      onDownload={() => window.open(`https://dl.vidsrc.vip/movie/${id}`, '_blank')}
      rating={rating}
    >
      {/* Overview Section */}
      <section id="overview" className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Storyline</h2>
            <p className="text-gray-300 text-lg leading-relaxed">{movie?.overview}</p>
          </div>

          {/* Keywords */}
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {keywords.map(keyword => (
                <span key={keyword.id} className="px-3 py-1 bg-white/5 rounded-full text-sm text-gray-400 border border-white/5">
                  #{keyword.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-6">
            <div>
              <h3 className="text-gray-400 text-sm font-medium mb-1">Status</h3>
              <p className="text-white font-semibold">{movie?.status}</p>
            </div>
            <div>
              <h3 className="text-gray-400 text-sm font-medium mb-1">Original Language</h3>
              <p className="text-white font-semibold uppercase">{movie?.original_language}</p>
            </div>
            <div>
              <h3 className="text-gray-400 text-sm font-medium mb-1">Budget</h3>
              <p className="text-white font-semibold">
                {movie?.budget ? `$${(movie.budget / 1000000).toFixed(1)}M` : 'N/A'}
              </p>
            </div>
            <div>
              <h3 className="text-gray-400 text-sm font-medium mb-1">Revenue</h3>
              <p className="text-white font-semibold">
                {movie?.revenue ? `$${(movie.revenue / 1000000).toFixed(1)}M` : 'N/A'}
              </p>
            </div>
          </div>

          {/* Social Links */}
          {externalIds && (
            <div className="flex gap-4">
              {externalIds.imdb_id && (
                <a href={`https://www.imdb.com/title/${externalIds.imdb_id}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-full text-yellow-500 hover:bg-white/10 transition-colors">
                  <FaImdb className="text-2xl" />
                </a>
              )}
              {externalIds.facebook_id && (
                <a href={`https://facebook.com/${externalIds.facebook_id}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-full text-blue-500 hover:bg-white/10 transition-colors">
                  <FaFacebook className="text-xl" />
                </a>
              )}
              {externalIds.instagram_id && (
                <a href={`https://instagram.com/${externalIds.instagram_id}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-full text-pink-500 hover:bg-white/10 transition-colors">
                  <FaInstagram className="text-xl" />
                </a>
              )}
              {externalIds.twitter_id && (
                <a href={`https://twitter.com/${externalIds.twitter_id}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-full text-blue-400 hover:bg-white/10 transition-colors">
                  <FaTwitter className="text-xl" />
                </a>
              )}
              {movie?.homepage && (
                <a href={movie.homepage} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-full text-gray-400 hover:bg-white/10 transition-colors">
                  <FaLink className="text-xl" />
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Cast Section */}
      <section id="cast">
        {credits && credits.cast.length > 0 && (
          <CastList cast={credits.cast} showButton />
        )}
      </section>

      {/* Media Section */}
      {images && (
        <MediaGallery
          posters={images.posters}
          backdrops={images.backdrops}
          videos={trailer ? [trailer] : []}
          title={movie?.title || ''}
        />
      )}

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <ReviewsSection reviews={reviews} />
      )}

      {/* Collection Section */}
      {collection && collection.parts.length > 1 && (
        <CollectionSection collection={collection} />
      )}

      {/* Production Companies */}
      {movie?.production_companies && movie.production_companies.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Production Companies</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {movie.production_companies.slice(0, 5).map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        </section>
      )}

      {/* Related Section */}
      <section id="related">
        {similarMovies.length > 0 && (
          <Carousel title="More Like This" items={similarMovies} mediaType="movie" />
        )}
      </section>

      {/* Trailer Modal */}
      {trailer && (
        <Modal
          isOpen={showTrailer}
          onClose={() => setShowTrailer(false)}
          title={`${movie?.title} - Trailer`}
        >
          <div className="p-4">
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}`}
                title={trailer.name}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </Modal>
      )}
    </DetailsLayout>
  )
}

export default MovieDetailPage
