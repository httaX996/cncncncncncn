import { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { FaCalendar, FaArrowLeft, FaPlay } from 'react-icons/fa'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { VideoPlayer } from '../components/VideoPlayer'
import { SportsStreamSelector } from '../components/SportsStreamSelector'
import { getBadgeUrl, fetchMatchDetail } from '../services/sports'
import type { MatchDetail, Stream } from '../types/sports'

const SportsMatchPlayerPage = () => {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const streamId = searchParams.get('streamId')
  const [matchDetail, setMatchDetail] = useState<MatchDetail | null>(null)
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null)
  const [loading, setLoading] = useState(true)
  const [embedUrl, setEmbedUrl] = useState<string>('')

  useEffect(() => {
    const loadMatchData = async () => {
      if (!id) return

      setLoading(true)
      try {
        const detail = await fetchMatchDetail(id)
        if (detail) {
          setMatchDetail(detail)
          
          // Find selected stream or use first stream
          const stream = streamId
            ? detail.sources.find(s => s.id === streamId) || detail.sources[0]
            : detail.sources[0]
          
          if (stream) {
            setSelectedStream(stream)
            setEmbedUrl(stream.embedUrl)
          }
        }
      } catch (error) {
        console.error('Failed to load match data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMatchData()
  }, [id, streamId])

  // Handle stream change
  const handleStreamSelect = (stream: Stream) => {
    setSelectedStream(stream)
    setEmbedUrl(stream.embedUrl)
    // Update URL without navigation
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.set('streamId', stream.id)
    window.history.replaceState({}, '', `?${newSearchParams.toString()}`)
  }

  if (loading) return <LoadingSpinner />
  if (!matchDetail) return <div className="text-center py-20">Match not found</div>
  if (!selectedStream) return <div className="text-center py-20">No stream available</div>

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

  return (
    <div className="min-h-screen pt-16 bg-gray-950">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link
          to={`/sports/match/${id}`}
          className="inline-flex items-center space-x-2 text-gray-300 hover:text-primary transition-colors"
        >
          <FaArrowLeft />
          <span>Back to Details</span>
        </Link>
      </div>

      {/* Stream Selector */}
      {matchDetail.sources && matchDetail.sources.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
          <SportsStreamSelector
            streams={matchDetail.sources}
            matchId={id || ''}
            selectedStreamId={selectedStream.id}
            onStreamSelect={handleStreamSelect}
          />
        </div>
      )}

      {/* Video Player */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-black rounded-lg overflow-hidden">
          <VideoPlayer 
            embedUrl={embedUrl} 
            title={match.title}
          />
        </div>
      </div>

      {/* Match Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="glass-effect rounded-xl p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            {/* Team Badges */}
            {hasBadges && (
              <div className="flex-shrink-0 flex items-center gap-4 md:gap-8">
                {homeBadgeUrl && (
                  <div className="w-24 sm:w-32 md:w-40 text-center">
                    <img
                      src={homeBadgeUrl}
                      alt={match.teams?.home?.name || 'Home team'}
                      className="w-full rounded-lg shadow-xl mb-2"
                    />
                    {match.teams?.home?.name && (
                      <p className="text-sm md:text-base font-semibold text-white">{match.teams.home.name}</p>
                    )}
                  </div>
                )}
                {awayBadgeUrl && (
                  <div className="w-24 sm:w-32 md:w-40 text-center">
                    <img
                      src={awayBadgeUrl}
                      alt={match.teams?.away?.name || 'Away team'}
                      className="w-full rounded-lg shadow-xl mb-2"
                    />
                    {match.teams?.away?.name && (
                      <p className="text-sm md:text-base font-semibold text-white">{match.teams.away.name}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Details */}
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{match.title}</h1>

              <div className="flex flex-wrap items-center gap-3 mb-4">
                {isLive && (
                  <div className="flex items-center space-x-2 glass-effect rounded-full px-3 py-1 bg-red-600/80">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    <span className="text-white text-xs md:text-sm font-bold">LIVE</span>
                  </div>
                )}
                <div className="flex items-center space-x-1 text-gray-300 text-sm">
                  <FaCalendar className="text-xs" />
                  <span>{formattedDate}</span>
                </div>
                <div className="glass-effect rounded-full px-3 py-1 text-sm">
                  <span className="text-gray-300 font-semibold capitalize">{match.category}</span>
                </div>
              </div>

              {match.teams?.home?.name && match.teams?.away?.name && (
                <div className="mb-4">
                  <div className="text-xl md:text-2xl font-bold text-white">
                    {match.teams.home.name} <span className="text-gray-400 mx-2">VS</span> {match.teams.away.name}
                  </div>
                </div>
              )}

              {/* Current Stream Info */}
              <div className="glass-effect rounded-lg px-4 py-3 mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <FaPlay className="text-primary text-sm" />
                  <span className="font-semibold text-sm md:text-base">Current Stream</span>
                </div>
                <div className="text-sm md:text-base text-gray-300">
                  Stream {selectedStream.streamNo} - {selectedStream.language}
                  {selectedStream.hd && <span className="ml-2 text-primary font-bold">HD</span>}
                </div>
                <div className="text-xs md:text-sm text-gray-400 mt-1">
                  Source: {selectedStream.source}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SportsMatchPlayerPage

