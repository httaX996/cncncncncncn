import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DetailsLayout } from '../components/DetailsLayout'
import { CastList } from '../components/CastList'
import { Carousel } from '../components/Carousel'
import { CompanyCard } from '../components/CompanyCard'
import { MediaGallery } from '../components/MediaGallery'
import { ReviewsSection } from '../components/ReviewsSection'
import { Modal } from '../components/Modal'
import { DownloadModal } from '../components/DownloadModal'
import {
  fetchTVShowDetails,
  fetchTVShowVideos,
  fetchTVShowCredits,
  fetchSimilarTVShows,
  fetchTVImages,
  fetchExternalIds,
  fetchReviews,
  fetchKeywords,
  fetchTVContentRatings
} from '../services/tmdb'
import { isInWatchlist, toggleWatchlist } from '../utils/watchlist'
import type { TVShowDetails, Video, Credits, TVShow, Keyword } from '../types/tmdb'
import { FaImdb, FaInstagram, FaTwitter, FaFacebook, FaLink } from 'react-icons/fa'

const TVShowDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // State
  const [show, setShow] = useState<TVShowDetails | null>(null)
  const [trailer, setTrailer] = useState<Video | null>(null)
  const [credits, setCredits] = useState<Credits | null>(null)
  const [similarShows, setSimilarShows] = useState<TVShow[]>([])
  const [images, setImages] = useState<{ backdrops: any[], posters: any[], logos: any[] } | null>(null)
  const [externalIds, setExternalIds] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [rating, setRating] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)
  const [showTrailer, setShowTrailer] = useState(false)
  const [showDownload, setShowDownload] = useState(false)
  const [inWatchlist, setInWatchlist] = useState(false)

  useEffect(() => {
    const loadShowDetails = async () => {
      if (!id) return

      setLoading(true)
      try {
        const tvId = Number(id)
        const [
          showData,
          videos,
          creditsData,
          similar,
          imagesData,
          idsData,
          reviewsData,
          keywordsData,
          ratingsData
        ] = await Promise.all([
          fetchTVShowDetails(tvId),
          fetchTVShowVideos(tvId),
          fetchTVShowCredits(tvId),
          fetchSimilarTVShows(tvId),
          fetchTVImages(tvId),
          fetchExternalIds(tvId, 'tv'),
          fetchReviews(tvId, 'tv'),
          fetchKeywords(tvId, 'tv'),
          fetchTVContentRatings(tvId)
        ])

        setShow(showData)
        setSimilarShows(similar)
        setCredits(creditsData)
        setImages(imagesData)
        setExternalIds(idsData)
        setReviews(reviewsData)
        setKeywords(keywordsData)
        setInWatchlist(isInWatchlist(tvId, 'tv'))

        // Find trailer
        const youtubeTrailer = videos.find(
          (v) => v.type === 'Trailer' && v.site === 'YouTube'
        )
        setTrailer(youtubeTrailer || videos[0] || null)

        // Set Rating
        const usRating = ratingsData.results.find(r => r.iso_3166_1 === 'US')
        if (usRating) {
          setRating(usRating.rating)
        } else if (ratingsData.results.length > 0) {
          setRating(ratingsData.results[0].rating)
        }

      } catch (error) {
        console.error('Failed to load TV show details:', error)
      } finally {
        setLoading(false)
      }
    }

    loadShowDetails()

    const handleWatchlistUpdate = () => {
      if (id) setInWatchlist(isInWatchlist(Number(id), 'tv'))
    }

    window.addEventListener('watchlist-updated', handleWatchlistUpdate)
    return () => window.removeEventListener('watchlist-updated', handleWatchlistUpdate)
  }, [id])

  return (
    <DetailsLayout
      item={show}
      type="tv"
      trailer={trailer}
      loading={loading}
      onPlay={() => navigate(`/tv/${id}/watch?season=1&episode=1`)}
      onTrailer={() => setShowTrailer(true)}
      inWatchlist={inWatchlist}
      onToggleWatchlist={() => show && toggleWatchlist(show, 'tv')}
      onDownload={() => setShowDownload(true)}
      rating={rating}
    >
      {/* Overview Section */}
      <section id="overview" className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Storyline</h2>
            <p className="text-gray-300 text-lg leading-relaxed">{show?.overview}</p>
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
              <p className="text-white font-semibold">{show?.status}</p>
            </div>
            <div>
              <h3 className="text-gray-400 text-sm font-medium mb-1">Original Language</h3>
              <p className="text-white font-semibold uppercase">{show?.original_language}</p>
            </div>
            <div>
              <h3 className="text-gray-400 text-sm font-medium mb-1">Type</h3>
              <p className="text-white font-semibold">{show?.type}</p>
            </div>
            <div>
              <h3 className="text-gray-400 text-sm font-medium mb-1">Seasons</h3>
              <p className="text-white font-semibold">{show?.number_of_seasons}</p>
            </div>
            <div>
              <h3 className="text-gray-400 text-sm font-medium mb-1">Episodes</h3>
              <p className="text-white font-semibold">{show?.number_of_episodes}</p>
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
              {show?.homepage && (
                <a href={show.homepage} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-full text-gray-400 hover:bg-white/10 transition-colors">
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
          title={show?.name || ''}
        />
      )}

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <ReviewsSection reviews={reviews} />
      )}

      {/* Production Companies */}
      {show?.production_companies && show.production_companies.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Production Companies</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {show.production_companies.slice(0, 5).map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        </section>
      )}

      {/* Related Section */}
      <section id="related">
        {similarShows.length > 0 && (
          <Carousel title="More Like This" items={similarShows} mediaType="tv" />
        )}
      </section>

      {/* Trailer Modal */}
      {trailer && (
        <Modal
          isOpen={showTrailer}
          onClose={() => setShowTrailer(false)}
          title={`${show?.name} - Trailer`}
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

      {/* Download Modal */}
      {show && (
        <DownloadModal
          isOpen={showDownload}
          onClose={() => setShowDownload(false)}
          showId={show.id}
          totalSeasons={show.number_of_seasons}
          showName={show.name}
        />
      )}
    </DetailsLayout>
  )
}

export default TVShowDetailPage
