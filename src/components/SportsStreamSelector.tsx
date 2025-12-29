import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaChevronDown, FaCheck, FaPlay, FaHdd } from 'react-icons/fa'
import type { Stream } from '../types/sports'

interface SportsStreamSelectorProps {
  streams: Stream[]
  matchId: string
  selectedStreamId?: string
  onStreamSelect?: (stream: Stream) => void
}

export const SportsStreamSelector = ({ 
  streams, 
  matchId, 
  selectedStreamId,
  onStreamSelect 
}: SportsStreamSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null)
  const navigate = useNavigate()

  // Initialize with first stream or selected stream
  useEffect(() => {
    if (streams.length > 0) {
      const stream = selectedStreamId 
        ? streams.find(s => s.id === selectedStreamId) || streams[0]
        : streams[0]
      setSelectedStream(stream)
      if (onStreamSelect) {
        onStreamSelect(stream)
      }
    }
  }, [streams, selectedStreamId, onStreamSelect])

  const handleStreamSelect = (stream: Stream) => {
    setSelectedStream(stream)
    setIsOpen(false)
    if (onStreamSelect) {
      onStreamSelect(stream)
    }
    // Navigate to watch page with stream ID
    navigate(`/sports/match/${matchId}/watch?streamId=${stream.id}`)
  }

  if (streams.length === 0) return null

  return (
    <div className="relative">
      {/* Stream Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 glass-effect rounded-lg 
                 hover:bg-white/20 transition-all duration-300
                 focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Select stream"
      >
        <FaPlay className="text-sm" />
        <div className="text-left">
          <div className="text-sm font-semibold">
            {selectedStream 
              ? `Stream ${selectedStream.streamNo} - ${selectedStream.language}${selectedStream.hd ? ' (HD)' : ''}`
              : 'Select Stream'}
          </div>
          <div className="text-xs text-gray-400">
            {selectedStream ? `Source: ${selectedStream.source}` : `${streams.length} streams available`}
          </div>
        </div>
        <FaChevronDown className={`text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute top-full left-0 mt-2 w-80 glass-effect rounded-lg shadow-2xl z-[9999] overflow-hidden animate-slide-up">
            <div className="p-2">
              <div className="text-xs text-gray-400 mb-2 px-2">Available Streams</div>
              
              {streams.map((stream) => (
                <button
                  key={stream.id}
                  onClick={() => handleStreamSelect(stream)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200
                           hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary
                           ${selectedStream?.id === stream.id ? 'bg-primary/20' : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <FaPlay className="text-primary text-sm" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm">
                        Stream {stream.streamNo} - {stream.language}
                        {stream.hd && (
                          <span className="ml-2 inline-flex items-center gap-1">
                            <FaHdd className="text-primary text-xs" />
                            <span className="text-xs text-primary">HD</span>
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">Source: {stream.source}</div>
                    </div>
                  </div>
                  
                  {selectedStream?.id === stream.id && (
                    <FaCheck className="text-primary text-sm" />
                  )}
                </button>
              ))}
            </div>
            
            {/* Footer */}
            <div className="border-t border-white/10 p-3">
              <div className="text-xs text-gray-400 text-center">
                Select a stream to start watching
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

