import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaSearch, FaBars, FaTimes, FaCog, FaVideo, FaChevronDown, FaCheck } from 'react-icons/fa'
import { RandomButton } from './RandomButton'
import { ManualInstallButton } from './ManualInstallButton'
import { SearchSuggestions } from './SearchSuggestions' // Re-add this import
import { getCurrentSeasonalTheme } from '../utils/seasonalThemes'
import { type HomeMode } from '../utils/homeMode'

interface NavbarProps {
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (isOpen: boolean) => void
  setIsMobileSearchOpen: (isOpen: boolean) => void
  setIsSettingsOpen: (isOpen: boolean) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  showSuggestions: boolean
  setShowSuggestions: (show: boolean) => void
  isModeDropdownOpen: boolean
  setIsModeDropdownOpen: (isOpen: boolean) => void
  handleSearch: (e: React.FormEvent) => void
  handleSearchInput: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSuggestionClick: (query: string) => void
  handleInputFocus: () => void
  handleInputBlur: () => void
  handleModeChange: (mode: HomeMode) => void
  currentMode: HomeMode
  searchInputRef: React.RefObject<HTMLInputElement>
  modeDropdownRef: React.RefObject<HTMLDivElement>
}

export const Navbar = ({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  setIsMobileSearchOpen,
  setIsSettingsOpen,
  searchQuery,
  setSearchQuery,
  showSuggestions,
  setShowSuggestions,
  isModeDropdownOpen,
  setIsModeDropdownOpen,
  handleSearch,
  handleSearchInput,
  handleSuggestionClick,
  handleInputFocus,
  handleInputBlur,
  handleModeChange,
  currentMode,
  searchInputRef,
  modeDropdownRef,
}: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isHalloween, setIsHalloween] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsHalloween(getCurrentSeasonalTheme() === 'halloween')
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[999] !overflow-visible"
    >
      {/* Background Layer */}
      <div
        className={`absolute inset-0 transition-all duration-300 ${isScrolled
          ? 'glass-effect shadow-lg'
          : 'bg-black/70 md:bg-black/30 backdrop-blur-md'
          }`}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            to="/"
            className={`text-2xl font-bold hover:scale-105 transition-transform relative ${isHalloween ? 'halloween-logo' : 'text-white md:text-gradient'
              }`}
            aria-label="SanuFlix Home"
          >
            <span className={isHalloween ? 'halloween-text' : ''}>
              SanuFlix
              {isHalloween && <span className="halloween-pumpkin">🎃</span>}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="hover:text-primary transition-colors"
              aria-label="Home"
            >
              <span>Home</span>
            </Link>

            <Link
              to="/my-list"
              className="hover:text-primary transition-colors"
              aria-label="My List"
            >
              <span>My List</span>
            </Link>

            <Link
              to="/genres"
              className="hover:text-primary transition-colors"
              aria-label="Genres"
            >
              <span>Genres</span>
            </Link>

            <Link
              to="/studios"
              className="hover:text-primary transition-colors"
              aria-label="Studios"
            >
              <span>Studios</span>
            </Link>

            <RandomButton variant="navbar" />

            {/* Search Bar - Only show in Default Mode */}
            {currentMode === 'default' && (
              <form onSubmit={handleSearch} className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInput}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleSearch(e as any)
                    } else if (e.key === 'Escape') {
                      setSearchQuery('')
                      setShowSuggestions(false)
                    }
                  }}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder="Search..."
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 pl-10
                           focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                           transition-all w-48 focus:w-64"
                  aria-label="Search movies and TV shows"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />

                <SearchSuggestions
                  query={searchQuery}
                  isVisible={showSuggestions}
                  onSuggestionClick={handleSuggestionClick}
                  onClose={() => setShowSuggestions(false)}
                />
              </form>
            )}

            {/* Mode Dropdown - Desktop */}
            <div className="relative" ref={modeDropdownRef}>
              <button
                onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-2 glass-effect rounded-lg
                         hover:bg-white/20 transition-all duration-300
                         focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Select mode"
              >
                <span className="text-sm font-medium">
                  {currentMode === 'sports' ? 'Sports Mode' : 'Default Mode'}
                </span>
                <FaChevronDown className={`text-xs transition-transform duration-200 ${isModeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isModeDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 glass-effect rounded-lg shadow-2xl z-50 overflow-hidden animate-slide-up">
                  <div className="p-2">
                    <button
                      onClick={() => handleModeChange('default')}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200
                               hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary
                               ${currentMode === 'default' ? 'bg-primary/20' : ''}`}
                    >
                      <span className="font-medium text-sm">Default Mode</span>
                      {currentMode === 'default' && <FaCheck className="text-primary text-sm" />}
                    </button>
                    <button
                      onClick={() => handleModeChange('sports')}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200
                               hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary
                               ${currentMode === 'sports' ? 'bg-primary/20' : ''}`}
                    >
                      <span className="font-medium text-sm">Sports Mode</span>
                      {currentMode === 'sports' && <FaCheck className="text-primary text-sm" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Reeailer Button - Desktop */}
            <Link
              to="/reeailer"
              className="p-2 hover:text-primary transition-colors rounded-full hover:bg-white/10"
              aria-label="Reeailer"
            >
              <FaVideo className="text-xl" />
            </Link>

            {/* Manual Install Button - Desktop */}
            <ManualInstallButton />

            {/* Settings Button - Desktop */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 hover:text-primary transition-colors rounded-full hover:bg-white/10"
              aria-label="Settings"
            >
              <FaCog className="text-xl" />
            </button>
          </div>

          {/* Mobile Buttons */}
          <div className="md:hidden flex items-center space-x-3">
            {/* Mobile Search Button - Only show in Default Mode */}
            {currentMode === 'default' && (
              <button
                onClick={() => setIsMobileSearchOpen(true)}
                className="text-xl hover:text-primary transition-colors p-2 rounded-full hover:bg-white/10"
                aria-label="Search"
              >
                <FaSearch />
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-2xl hover:text-primary transition-colors p-2 rounded-full hover:bg-white/10"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-6 animate-slide-up border-t border-white/10 bg-black/80 backdrop-blur-sm">
            <div className="flex flex-col space-y-5 pt-4">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-white/10"
              >
                <span className="text-lg">Home</span>
              </Link>

              <Link
                to="/my-list"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-white/10"
              >
                <span className="text-lg">My List</span>
              </Link>

              <Link
                to="/genres"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-white/10"
              >
                <span className="text-lg">Genres</span>
              </Link>

              <Link
                to="/studios"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-white/10"
              >
                <span className="text-lg">Studios</span>
              </Link>

              <Link
                to="/reeailer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-white/10"
              >
                <span className="text-lg flex items-center gap-2">
                  <FaVideo className="text-base" />
                  Reeailer
                </span>
              </Link>

              {/* Mode Selector for Mobile */}
              <div className="border-t border-white/10 pt-4">
                <div className="text-xs text-gray-400 mb-2 px-2">Home Mode</div>
                <button
                  onClick={() => handleModeChange('default')}
                  className={`w-full flex items-center justify-between px-2 py-3 rounded-lg transition-all duration-200
                               hover:bg-white/10 text-left
                               ${currentMode === 'default' ? 'bg-primary/20' : ''}`}
                >
                  <span className="text-lg">Default Mode</span>
                  {currentMode === 'default' && <FaCheck className="text-primary" />}
                </button>
                <button
                  onClick={() => handleModeChange('sports')}
                  className={`w-full flex items-center justify-between px-2 py-3 rounded-lg transition-all duration-200
                               hover:bg-white/10 text-left
                               ${currentMode === 'sports' ? 'bg-primary/20' : ''}`}
                >
                  <span className="text-lg">Sports Mode</span>
                  {currentMode === 'sports' && <FaCheck className="text-primary" />}
                </button>
              </div>

              {/* Settings for Mobile */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  setIsSettingsOpen(true)
                }}
                className="text-white hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-white/10 text-left w-full"
              >
                <span className="text-lg flex items-center gap-2">
                  <FaCog className="text-base" />
                  Settings
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
