import { Link } from 'react-router-dom'
import { FaHeart } from 'react-icons/fa'

export const Footer = () => {
  return (
    <footer className="bg-gray-900/50 backdrop-blur-md border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-gradient mb-3">SanuFlix</h3>
            <p className="text-gray-400 text-sm md:text-base max-w-md">
              Your ultimate destination for streaming movies and TV shows.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-3 text-gradient">Quick Links</h4>
            <nav className="grid grid-cols-2 gap-2" aria-label="Quick links">
              <Link to="/" className="hover:text-primary transition-colors text-sm md:text-base">
                Home
              </Link>
              <Link to="/my-list" className="hover:text-primary transition-colors text-sm md:text-base">
                My List
              </Link>
              <Link to="/genres" className="hover:text-primary transition-colors text-sm md:text-base">
                Genres
              </Link>
              <Link to="/studios" className="hover:text-primary transition-colors text-sm md:text-base">
                Studios
              </Link>
            </nav>
          </div>
        </div>

        {/* Made with love */}
        <div className="border-t border-white/10 pt-6 text-center text-sm text-gray-400">
          <p className="flex items-center justify-center space-x-1">
            <span>Made with</span>
            <FaHeart className="text-primary animate-pulse" />
            <span>by Sanuu</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

