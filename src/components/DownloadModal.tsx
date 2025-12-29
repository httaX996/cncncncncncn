import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaDownload, FaTimes, FaSpinner } from 'react-icons/fa'
import { fetchSeasonDetails } from '../services/tmdb'
import type { Episode } from '../types/tmdb'

interface DownloadModalProps {
    isOpen: boolean
    onClose: () => void
    showId: number
    totalSeasons: number
    showName: string
}

export const DownloadModal = ({
    isOpen,
    onClose,
    showId,
    totalSeasons,
    showName,
}: DownloadModalProps) => {
    const [selectedSeason, setSelectedSeason] = useState(1)
    const [episodes, setEpisodes] = useState<Episode[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isOpen) {
            loadEpisodes(selectedSeason)
        }
    }, [isOpen, selectedSeason])

    const loadEpisodes = async (seasonNumber: number) => {
        setLoading(true)
        try {
            const data = await fetchSeasonDetails(showId, seasonNumber)
            setEpisodes(data.episodes)
        } catch (error) {
            console.error('Failed to load episodes:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = (season: number, episode: number) => {
        const url = `https://dl.vidsrc.vip/tv/${showId}/${season}/${episode}`
        window.open(url, '_blank')
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-[#1a1a1a] border border-white/10 w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#1a1a1a]">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Download {showName}</h3>
                                    <p className="text-sm text-gray-400 mt-1">Select an episode to download</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex flex-1 overflow-hidden">
                                {/* Season Selector */}
                                <div className="w-1/3 border-r border-white/10 overflow-y-auto bg-[#141414]">
                                    <div className="p-2 space-y-1">
                                        {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((season) => (
                                            <button
                                                key={season}
                                                onClick={() => setSelectedSeason(season)}
                                                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between ${selectedSeason === season
                                                        ? 'bg-primary text-white font-medium shadow-lg shadow-primary/20'
                                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                                    }`}
                                            >
                                                <span>Season {season}</span>
                                                {selectedSeason === season && (
                                                    <motion.div
                                                        layoutId="activeSeason"
                                                        className="w-1.5 h-1.5 rounded-full bg-white"
                                                    />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Episode List */}
                                <div className="flex-1 overflow-y-auto bg-[#1a1a1a] p-4">
                                    {loading ? (
                                        <div className="h-full flex items-center justify-center text-primary">
                                            <FaSpinner className="animate-spin text-3xl" />
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {episodes.map((episode) => (
                                                <div
                                                    key={episode.id}
                                                    className="group flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all duration-200"
                                                >
                                                    <div className="flex-1 min-w-0 mr-4">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                                                                EP {episode.episode_number}
                                                            </span>
                                                            <h4 className="text-white font-medium truncate">
                                                                {episode.name}
                                                            </h4>
                                                        </div>
                                                        <p className="text-xs text-gray-400 line-clamp-1">
                                                            {episode.overview || 'No description available'}
                                                        </p>
                                                    </div>

                                                    <button
                                                        onClick={() => handleDownload(selectedSeason, episode.episode_number)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-primary hover:text-white text-gray-300 rounded-lg transition-all duration-200 font-medium text-sm whitespace-nowrap"
                                                    >
                                                        <FaDownload className="text-xs" />
                                                        <span>Download</span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
