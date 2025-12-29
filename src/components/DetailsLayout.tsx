import { useState, useEffect } from 'react'
import { AwardWinningHero } from './AwardWinningHero'
import { LoadingSpinner } from './LoadingSpinner'
import { SEO } from './SEO'
import { getImageUrl } from '../services/tmdb'
import type { MovieDetails, TVShowDetails, Video } from '../types/tmdb'

interface DetailsLayoutProps {
    item: MovieDetails | TVShowDetails | null
    type: 'movie' | 'tv'
    trailer: Video | null
    loading: boolean
    children: React.ReactNode
    onPlay: () => void
    onTrailer: () => void
    inWatchlist: boolean
    onToggleWatchlist: () => void
    onDownload?: () => void
    rating?: string | null
}

const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'cast', label: 'Cast & Crew' },
    { id: 'media', label: 'Media' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'related', label: 'More Like This' }
]

export const DetailsLayout = ({
    item,
    type,
    trailer,
    loading,
    children,
    onPlay,
    onTrailer,
    inWatchlist,
    onToggleWatchlist,
    onDownload,
    rating
}: DetailsLayoutProps) => {
    const [activeTab, setActiveTab] = useState('overview')
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 100)

            // Auto-update active tab based on scroll position
            const sections = TABS.map(tab => document.getElementById(tab.id))
            const scrollPosition = window.scrollY + 200

            for (const section of sections) {
                if (section && section.offsetTop <= scrollPosition && (section.offsetTop + section.offsetHeight) > scrollPosition) {
                    setActiveTab(section.id)
                }
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id)
        if (element) {
            const offset = 80 // Height of sticky header
            const bodyRect = document.body.getBoundingClientRect().top
            const elementRect = element.getBoundingClientRect().top
            const elementPosition = elementRect - bodyRect
            const offsetPosition = elementPosition - offset

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            })
            setActiveTab(id)
        }
    }

    if (loading) return <LoadingSpinner />
    if (!item) return <div className="min-h-screen flex items-center justify-center text-white">Item not found</div>

    const title = type === 'movie' ? (item as MovieDetails).title : (item as TVShowDetails).name
    const overview = item.overview

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <SEO
                title={title}
                description={overview}
                image={getImageUrl(item.poster_path, 'w500')}
                type="article"
            />

            {/* Hero Section */}
            <AwardWinningHero
                item={item}
                type={type}
                trailer={trailer}
                onPlay={onPlay}
                onTrailer={onTrailer}
                inWatchlist={inWatchlist}
                onToggleWatchlist={onToggleWatchlist}
                onDownload={onDownload}
                rating={rating}
            />

            {/* Sticky Navigation */}
            <div className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        {/* Mini Title (Visible on scroll) */}
                        <div className={`hidden md:block transition-opacity duration-300 ${isScrolled ? 'opacity-100' : 'opacity-0'}`}>
                            <h3 className="font-bold text-lg truncate max-w-[200px]">{title}</h3>
                        </div>

                        {/* Tabs */}
                        <div className="flex items-center gap-1 md:gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => scrollToSection(tab.id)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                            ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                                            : 'text-gray-400 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Mini Actions (Visible on scroll) */}
                        <div className={`hidden md:flex items-center gap-2 transition-opacity duration-300 ${isScrolled ? 'opacity-100' : 'opacity-0'}`}>
                            <button onClick={onPlay} className="px-4 py-2 bg-pink-600 rounded-full text-sm font-bold hover:bg-pink-700 transition-colors">
                                Watch
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-16 md:space-y-24">
                {children}
            </div>
        </div>
    )
}
