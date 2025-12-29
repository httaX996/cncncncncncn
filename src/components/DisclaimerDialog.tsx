import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaExclamationTriangle, FaCheck } from 'react-icons/fa'

export const DisclaimerDialog = () => {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        // Check if user has already accepted the disclaimer
        const hasAccepted = localStorage.getItem('disclaimer_accepted')
        if (!hasAccepted) {
            // Small delay to ensure smooth entrance animation after page load
            const timer = setTimeout(() => setIsOpen(true), 500)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleAccept = () => {
        localStorage.setItem('disclaimer_accepted', 'true')
        setIsOpen(false)
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={handleAccept} // Allow clicking outside to close? Maybe better to force button click.
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="relative w-full max-w-md bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-pink-600 to-violet-600 p-6 text-center">
                            <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-md">
                                <FaExclamationTriangle className="text-3xl text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Disclaimer</h2>
                        </div>

                        {/* Content */}
                        <div className="p-6 md:p-8 space-y-4">
                            <p className="text-gray-300 text-center leading-relaxed">
                                Please note that the movies, TV shows, and other content displayed on this website are <span className="text-white font-bold">not hosted by SanuFlix</span>.
                            </p>
                            <p className="text-gray-400 text-sm text-center">
                                All content is provided by non-affiliated third-party sources. SanuFlix does not accept responsibility for content hosted on third-party websites.
                            </p>

                            <button
                                onClick={handleAccept}
                                className="w-full mt-6 group relative px-6 py-3 bg-white text-black rounded-xl font-bold text-lg flex items-center justify-center gap-2 overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-violet-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                                <FaCheck className="text-sm" />
                                <span>I Understand</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
