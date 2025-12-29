import { ReactNode, useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FaSearch, FaTimes } from 'react-icons/fa'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { BackToTopButton } from './BackToTopButton'
import { AnimatedBackground } from './AnimatedBackground'
import { HalloweenTheme } from './HalloweenTheme'
import { EffectsToggle } from './EffectsToggle'
import InstallPWA from './InstallPWA'
import { SettingsModal } from './SettingsModal'

import { CustomCursor } from './CustomCursor'
import { SearchSuggestions } from './SearchSuggestions' // Keep this for Mobile Search Modal
import { getHomeMode, setHomeMode, type HomeMode } from '../utils/homeMode'

interface LayoutProps {
  children: ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [currentMode, setCurrentMode] = useState<HomeMode>(getHomeMode())
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const modeDropdownRef = useRef<HTMLDivElement>(null)

  // Close mode dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isModeDropdownOpen && modeDropdownRef.current && !modeDropdownRef.current.contains(event.target as Node)) {
        setIsModeDropdownOpen(false)
      }
    }

    if (isModeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isModeDropdownOpen])

  // Close settings modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSettingsOpen) {
        const modal = document.querySelector('.settings-modal')
        const backdrop = document.querySelector('.settings-backdrop')
        if (modal && !modal.contains(event.target as Node) && backdrop?.contains(event.target as Node)) {
          setIsSettingsOpen(false)
        }
      }
    }

    if (isSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          setIsSettingsOpen(false)
        }
      })
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', () => { })
    }
  }, [isSettingsOpen])

  // Focus search input when mobile search opens
  useEffect(() => {
    if (isMobileSearchOpen) {
      if (searchInputRef.current) {
        searchInputRef.current.focus()
      }
      // Add escape key listener for mobile search
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsMobileSearchOpen(false)
          setSearchQuery('')
        }
      }
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMobileSearchOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
      setIsMobileMenuOpen(false)
      setIsMobileSearchOpen(false)
      setShowSuggestions(false)
    }
  }

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setShowSuggestions(true)
  }

  const handleSuggestionClick = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`)
    setSearchQuery('')
    setIsMobileMenuOpen(false)
    setIsMobileSearchOpen(false)
    setShowSuggestions(false)
  }

  const handleInputFocus = () => {
    setShowSuggestions(true)
  }

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => setShowSuggestions(false), 200)
  }

  const handleMobileSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch(e as any)
    } else if (e.key === 'Escape') {
      setIsMobileSearchOpen(false)
      setSearchQuery('')
      setShowSuggestions(false)
    }
  }

  const handleModeChange = (mode: HomeMode) => {
    setHomeMode(mode)
    setCurrentMode(mode)
    setIsModeDropdownOpen(false)
    setIsMobileMenuOpen(false)
    // Navigate to appropriate homepage
    if (mode === 'sports') {
      navigate('/sports')
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Seasonal Theme Overlay */}
      <HalloweenTheme />

      {/* Main Content */}
      <div className="relative z-10">
        {!['/downloader', '/reeailer'].includes(location.pathname) && (
          <Navbar
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            setIsMobileSearchOpen={setIsMobileSearchOpen}
            setIsSettingsOpen={setIsSettingsOpen}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            showSuggestions={showSuggestions}
            setShowSuggestions={setShowSuggestions}
            isModeDropdownOpen={isModeDropdownOpen}
            setIsModeDropdownOpen={setIsModeDropdownOpen}
            handleSearch={handleSearch}
            handleSearchInput={handleSearchInput}
            handleSuggestionClick={handleSuggestionClick}
            handleInputFocus={handleInputFocus}
            handleInputBlur={handleInputBlur}
            handleModeChange={handleModeChange}
            currentMode={currentMode}
            searchInputRef={searchInputRef}
            modeDropdownRef={modeDropdownRef}
          />
        )}
        <main className="flex-1">
          {children}
        </main>
        {!['/downloader', '/reeailer'].includes(location.pathname) && <Footer />}
        <BackToTopButton />
        {!['/downloader', '/reeailer'].includes(location.pathname) && <EffectsToggle />}
        <InstallPWA />

        <CustomCursor />
      </div>


      {/* Mobile Search Modal (outside Navbar stacking context) */}
      {isMobileSearchOpen && (
        <div className="md:hidden fixed inset-0 bg-black/98 backdrop-blur-md z-[9999] animate-fade-in">
          <div className="flex flex-col h-full bg-black/95">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/20 bg-black/80">
              <h2 className="text-xl font-bold text-gradient">Search</h2>
              <button
                onClick={() => {
                  setIsMobileSearchOpen(false)
                  setSearchQuery('')
                  setShowSuggestions(false)
                }}
                className="text-2xl hover:text-primary transition-colors p-2 rounded-full hover:bg-white/10"
                aria-label="Close search"
              >
                <FaTimes />
              </button>
            </div>

            {/* Search Form */}
            <div className="p-6 relative bg-black/80">
              <form onSubmit={handleSearch} className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInput}
                  onKeyDown={handleMobileSearchKeyDown}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder="Search movies, TV shows, studios..."
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/30 rounded-full px-6 py-4 pl-16
                           focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-lg text-white placeholder-gray-300"
                  aria-label="Search movies and TV shows"
                  autoComplete="off"
                />
                <FaSearch className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-300 text-xl" />
                <button
                  type="submit"
                  className="absolute right-5 top-1/2 transform -translate-y-1/2
                           bg-primary text-white px-5 py-2 rounded-full text-sm font-medium
                           hover:bg-primary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!searchQuery.trim()}
                >
                  Search
                </button>
              </form>

              {/* Search Suggestions for Mobile */}
              <div className="mt-4">
                <SearchSuggestions
                  query={searchQuery}
                  isVisible={showSuggestions}
                  onSuggestionClick={handleSuggestionClick}
                  onClose={() => setShowSuggestions(false)}
                />
              </div>
            </div>

            {/* Empty space area with solid background */}
            <div className="flex-1 bg-black/95"></div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <CustomCursor />
    </div>
  )
}
