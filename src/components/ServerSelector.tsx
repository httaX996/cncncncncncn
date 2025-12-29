import { useState, useEffect, useMemo } from 'react'
import { FaChevronDown, FaServer, FaCheck } from 'react-icons/fa'
import { useTheme } from '../contexts/ThemeContext'
import { colorThemes } from '../config/themes'
import { STREAMING_SERVERS, buildMovieUrl, buildTVUrl, type StreamingServer } from '../config/servers'

// Runtime server object that includes built URL functions
interface RuntimeServer {
  id: string
  name: string
  description: string
  isActive: boolean
  getMovieUrl: (tmdbId: number) => string
  getTVUrl: (tmdbId: number, season: number, episode: number) => string
}

interface ServerSelectorProps {
  onServerChange: (server: RuntimeServer) => void
}

export const ServerSelector = ({
  onServerChange
}: ServerSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedServer, setSelectedServer] = useState<RuntimeServer | null>(null)
  const { colorTheme } = useTheme()

  // Get current theme color in hex format (without #)
  const getThemeColor = () => {
    const theme = colorThemes[colorTheme]
    return theme.primary.replace('#', '')
  }

  // Build runtime servers from config with URL builders
  const servers: RuntimeServer[] = useMemo(() => {
    const themeColor = getThemeColor()
    return STREAMING_SERVERS.filter(s => s.isActive).map((configServer: StreamingServer) => ({
      id: configServer.id,
      name: configServer.name,
      description: configServer.description,
      isActive: configServer.isActive,
      getMovieUrl: (tmdbId: number) => buildMovieUrl(configServer, tmdbId, themeColor),
      getTVUrl: (tmdbId: number, season: number, episode: number) =>
        buildTVUrl(configServer, tmdbId, season, episode, themeColor),
    }))
  }, [colorTheme])

  // Initialize with saved server or first available
  useEffect(() => {
    const savedServerId = localStorage.getItem('streamflix_selected_server')
    let serverToUse = servers.find(server => server.id === savedServerId)

    // Fallback to first server if saved one not found
    if (!serverToUse && servers.length > 0) {
      serverToUse = servers[0]
    }

    if (serverToUse && !selectedServer) {
      setSelectedServer(serverToUse)
      onServerChange(serverToUse)
    }
  }, [servers])

  // Update server when theme changes (to rebuild URLs with new color)
  useEffect(() => {
    if (selectedServer) {
      const updatedServer = servers.find(s => s.id === selectedServer.id)
      if (updatedServer) {
        setSelectedServer(updatedServer)
        onServerChange(updatedServer)
      }
    }
  }, [colorTheme])

  const handleServerSelect = (server: RuntimeServer) => {
    setSelectedServer(server)
    onServerChange(server)
    localStorage.setItem('streamflix_selected_server', server.id)
    setIsOpen(false)
  }

  return (
    <div className="relative z-50">
      {/* Server Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 glass-effect rounded-xl 
                   hover:bg-white/10 transition-all duration-300 border border-white/10
                   focus:outline-none focus:ring-2 focus:ring-primary/50 w-full md:w-auto min-w-[240px]"
        aria-label="Select streaming server"
      >
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
          <FaServer className="text-primary text-lg" />
        </div>
        <div className="flex-1 text-left">
          <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Current Server</div>
          <div className="text-sm font-bold text-white truncate">{selectedServer?.name || 'Select Server'}</div>
        </div>
        <FaChevronDown className={`text-gray-400 text-sm transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[90]"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute top-full left-0 mt-2 w-full md:w-80 bg-[#0a0a0a]/95 backdrop-blur-xl rounded-xl shadow-2xl z-[100] overflow-hidden animate-slide-up border border-white/10 ring-1 ring-white/5">
            <div className="p-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2 px-3 py-2">Available Servers</div>

              <div className="space-y-1">
                {servers.map((server) => (
                  <button
                    key={server.id}
                    onClick={() => handleServerSelect(server)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200
                               hover:bg-white/10 focus:outline-none group
                               ${selectedServer?.id === server.id ? 'bg-primary/20 border border-primary/20' : 'border border-transparent'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors
                                    ${selectedServer?.id === server.id ? 'bg-primary text-white' : 'bg-white/5 text-gray-400 group-hover:bg-white/10'}`}>
                        <FaServer className="text-xs" />
                      </div>
                      <div className="text-left">
                        <div className={`font-semibold text-sm ${selectedServer?.id === server.id ? 'text-primary' : 'text-gray-200'}`}>
                          {server.name}
                        </div>
                        <div className="text-xs text-gray-400 line-clamp-1">{server.description}</div>
                      </div>
                    </div>

                    {selectedServer?.id === server.id && (
                      <FaCheck className="text-primary text-sm" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 p-3 bg-black/20">
              <div className="text-xs text-gray-400 text-center">
                Server selection affects streaming quality
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
