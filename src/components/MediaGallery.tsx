import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaImage, FaVideo } from 'react-icons/fa'
import { getImageUrl } from '../services/tmdb'
import type { Video } from '../types/tmdb'

interface MediaGalleryProps {
    posters: any[]
    backdrops: any[]
    videos: Video[]
    title: string
}

export const MediaGallery = ({ posters, backdrops, videos, title }: MediaGalleryProps) => {
    const [activeTab, setActiveTab] = useState<'backdrops' | 'posters' | 'videos'>('backdrops')
    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    const tabs = [
        { id: 'backdrops', label: 'Backdrops', icon: FaImage, count: backdrops.length },
        { id: 'posters', label: 'Posters', icon: FaImage, count: posters.length },
        { id: 'videos', label: 'Videos', icon: FaVideo, count: videos.length }
    ]

    return (
        <section id="media" className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-white">Media</h2>

                {/* Tabs */}
                <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all ${activeTab === tab.id
                                ? 'bg-white/10 text-white shadow-lg backdrop-blur-sm'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <tab.icon className="text-xs" />
                            <span>{tab.label}</span>
                            <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">{tab.count}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                    {activeTab === 'backdrops' && (
                        <motion.div
                            key="backdrops"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                        >
                            {backdrops.slice(0, 6).map((image, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedImage(getImageUrl(image.file_path, 'original'))}
                                    className="group relative aspect-video rounded-xl overflow-hidden cursor-pointer border border-white/5 bg-white/5"
                                >
                                    <img
                                        src={getImageUrl(image.file_path, 'w780')}
                                        alt={`${title} Backdrop ${idx + 1}`}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white font-medium px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                                            View Full Size
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {activeTab === 'posters' && (
                        <motion.div
                            key="posters"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
                        >
                            {posters.slice(0, 12).map((image, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedImage(getImageUrl(image.file_path, 'original'))}
                                    className="group relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer border border-white/5 bg-white/5"
                                >
                                    <img
                                        src={getImageUrl(image.file_path, 'w500')}
                                        alt={`${title} Poster ${idx + 1}`}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {activeTab === 'videos' && (
                        <motion.div
                            key="videos"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                        >
                            {videos.slice(0, 6).map((video, idx) => (
                                <div
                                    key={idx}
                                    className="group relative aspect-video rounded-xl overflow-hidden border border-white/5 bg-white/5"
                                >
                                    <iframe
                                        src={`https://www.youtube.com/embed/${video.key}`}
                                        title={video.name}
                                        className="w-full h-full"
                                        allowFullScreen
                                        loading="lazy"
                                    />
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 cursor-zoom-out"
                    >
                        <motion.img
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            src={selectedImage}
                            alt="Full size"
                            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    )
}
