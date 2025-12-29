import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaPlay, FaCalendar } from 'react-icons/fa'
import { SEO } from '../components/SEO'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ShareButton } from '../components/ShareButton'
import { SportsStreamSelector } from '../components/SportsStreamSelector'
import { getBadgeUrl, fetchMatchDetail } from '../services/sports'
import type { MatchDetail, Stream } from '../types/sports'

const SportsMatchDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [matchDetail, setMatchDetail] = useState<MatchDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null)

  useEffect(() => {
    const loadMatchDetails = async () => {
      if (!id) return

      setLoading(true)
      try {
        const detail = await fetchMatchDetail(id)
        if (detail) {
          setMatchDetail(detail)
          // Set first stream as default
          if (detail.sources && detail.sources.length > 0) {
            setSelectedStream(detail.sources[0])
          }
        }
      } catch (error) {
        console.error('Failed to load match details:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMatchDetails()
  }, [id])

  if (loading) return <LoadingSpinner />
  if (!matchDetail) return <div className="text-center py-20">Match not found</div>

  const match = matchDetail
  const hasBadges = match.teams?.home?.badge || match.teams?.away?.badge
  const homeBadgeUrl = match.teams?.home?.badge ? getBadgeUrl(match.teams.home.badge) : null
  const awayBadgeUrl = match.teams?.away?.badge ? getBadgeUrl(match.teams.away.badge) : null
  const isLive = match.date && Date.now() >= match.date && Date.now() <= match.date + 7200000
  
  const matchDate = match.date ? new Date(match.date) : null
  const formattedDate = matchDate ? matchDate.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : ''

  const handleStreamCardClick = (stream: Stream) => {
    navigate(`/sports/match/${id}/watch?streamId=${stream.id}`)
  }

  return (
    <div className="min-h-screen pt-16">
      <SEO
        title={match.title}
        description={`Watch ${match.title} live. ${match.category} match.`}
        type="article"
      />
      
      {/* Hero Section */}
      <section className="relative min-h-[60vh] md:h-[70vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          {hasBadges && (
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <div className="flex items-center gap-8">
                {homeBadgeUrl && (
                  <img
                    src={homeBadgeUrl}
                    alt={match.teams?.home?.name || 'Home team'}
                    className="w-32 h-32 md:w-48 md:h-48 object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                )}
                {awayBadgeUrl && (
                  <img
                    src={awayBadgeUrl}
                    alt={match.teams?.away?.name || 'Away team'}
                    className="w-32 h-32 md:w-48 md:h-48 object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                )}
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end md:items-center py-8 md:py-0">
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start w-full max-w-6xl">
            {/* Team Badges */}
            {hasBadges && (
              <div className="flex-shrink-0 flex items-center gap-4 md:gap-8">
                {homeBadgeUrl && (
                  <div className="w-24 sm:w-32 md:w-40 lg:w-48 text-center">
                    <img
                      src={homeBadgeUrl}
                      alt={match.teams?.home?.name || 'Home team'}
                      className="w-full rounded-lg md:rounded-xl shadow-2xl hover-glow mb-2"
                    />
                    {match.teams?.home?.name && (
                      <p className="text-sm md:text-base font-semibold text-white">{match.teams.home.name}</p>
                    )}
                  </div>
                )}
                {awayBadgeUrl && (
                  <div className="w-24 sm:w-32 md:w-40 lg:w-48 text-center">
                    <img
                      src={awayBadgeUrl}
                      alt={match.teams?.away?.name || 'Away team'}
                      className="w-full rounded-lg md:rounded-xl shadow-2xl hover-glow mb-2"
                    />
                    {match.teams?.away?.name && (
                      <p className="text-sm md:text-base font-semibold text-white">{match.teams.away.name}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Info */}
            <div className="flex-1 w-full">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2">{match.title}</h1>

              <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-4 md:mb-6">
                {isLive && (
                  <div className="flex items-center space-x-2 glass-effect rounded-full px-3 md:px-4 py-1 md:py-2 bg-red-600/80">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    <span className="text-white text-xs md:text-sm font-bold">LIVE</span>
                  </div>
                )}
                <div className="flex items-center space-x-1 md:space-x-2 text-gray-300 text-xs md:text-base">
                  <FaCalendar className="text-xs md:text-base" />
                  <span>{formattedDate}</span>
                </div>
                <div className="glass-effect rounded-full px-3 md:px-4 py-1 md:py-2 text-xs md:text-base">
                  <span className="text-gray-300 font-semibold capitalize">{match.category}</span>
                </div>
              </div>

              {match.teams?.home?.name && match.teams?.away?.name && (
                <div className="mb-4 md:mb-6">
                  <div className="text-xl md:text-2xl font-bold text-white mb-2">
                    {match.teams.home.name} <span className="text-gray-400 mx-2">VS</span> {match.teams.away.name}
                  </div>
                </div>
              )}

              {/* Stream Selector */}
              {matchDetail.sources && matchDetail.sources.length > 0 && (
                <div className="mb-4 md:mb-6">
                  <SportsStreamSelector
                    streams={matchDetail.sources}
                    matchId={id || ''}
                    selectedStreamId={selectedStream?.id}
                    onStreamSelect={setSelectedStream}
                  />
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
                {selectedStream && (
                  <button
                    onClick={() => navigate(`/sports/match/${id}/watch?streamId=${selectedStream.id}`)}
                    className="btn-primary flex items-center justify-center space-x-2 text-sm md:text-base px-4 md:px-6 py-2 md:py-3"
                  >
                    <FaPlay className="text-xs md:text-base" />
                    <span>Watch Now</span>
                  </button>
                )}
                <ShareButton
                  title={match.title}
                  text={`Watch ${match.title} on SanuFlix`}
                  url={window.location.href}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Streams Section */}
      {matchDetail.sources && matchDetail.sources.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Available Streams</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {matchDetail.sources.map((stream) => (
              <button
                key={stream.id}
                onClick={() => handleStreamCardClick(stream)}
                className={`p-4 md:p-6 glass-effect rounded-lg hover:bg-white/20 transition-all duration-300
                         text-left focus:outline-none focus:ring-2 focus:ring-primary
                         ${selectedStream?.id === stream.id ? 'ring-2 ring-primary bg-primary/20' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <FaPlay className="text-primary text-sm" />
                    <span className="font-semibold text-sm md:text-base">Stream {stream.streamNo}</span>
                  </div>
                  {stream.hd && (
                    <span className="bg-primary text-white text-xs px-2 py-1 rounded font-bold">HD</span>
                  )}
                </div>
                <div className="text-sm md:text-base font-medium text-white mb-1">{stream.language}</div>
                <div className="text-xs md:text-sm text-gray-400">Source: {stream.source}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SportsMatchDetailPage

