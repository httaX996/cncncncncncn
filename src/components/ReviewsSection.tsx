import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaQuoteLeft, FaStar, FaUser } from 'react-icons/fa'
import { getImageUrl } from '../services/tmdb'

interface Review {
    id: string
    author: string
    author_details: {
        name: string
        username: string
        avatar_path: string | null
        rating: number | null
    }
    content: string
    created_at: string
    url: string
}

interface ReviewsSectionProps {
    reviews: Review[]
}

export const ReviewsSection = ({ reviews }: ReviewsSectionProps) => {
    const [expandedReview, setExpandedReview] = useState<string | null>(null)

    if (!reviews || reviews.length === 0) return null

    return (
        <section id="reviews" className="space-y-8">
            <div className="flex items-center gap-4">
                <h2 className="text-3xl font-bold text-white">Reviews</h2>
                <span className="px-3 py-1 rounded-full bg-white/10 text-sm font-medium text-gray-300 border border-white/10">
                    {reviews.length}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.slice(0, 6).map((review, idx) => (
                    <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors group"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 flex items-center justify-center border border-white/10">
                                    {review.author_details.avatar_path ? (
                                        <img
                                            src={getImageUrl(review.author_details.avatar_path, 'w200')}
                                            alt={review.author}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                // Fallback if avatar fails to load
                                                (e.target as HTMLImageElement).style.display = 'none';
                                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                            }}
                                        />
                                    ) : null}
                                    <FaUser className={`text-gray-400 ${review.author_details.avatar_path ? 'hidden' : ''}`} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm md:text-base">
                                        {review.author_details.name || review.author}
                                    </h3>
                                    <p className="text-xs text-gray-400">
                                        @{review.author_details.username}
                                    </p>
                                </div>
                            </div>

                            {review.author_details.rating && (
                                <div className="flex items-center gap-1.5 bg-yellow-500/10 px-2 py-1 rounded-lg border border-yellow-500/20">
                                    <FaStar className="text-yellow-500 text-xs" />
                                    <span className="text-yellow-500 font-bold text-sm">
                                        {review.author_details.rating}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="relative">
                            <FaQuoteLeft className="absolute -top-2 -left-2 text-white/5 text-4xl -z-10" />
                            <div
                                className={`text-gray-300 leading-relaxed text-sm md:text-base prose prose-invert max-w-none ${expandedReview === review.id ? '' : 'line-clamp-4'}`}
                                dangerouslySetInnerHTML={{
                                    __html: review.content
                                        .replace(/\n/g, '<br />') // Handle line breaks
                                        .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "") // Remove scripts
                                        .replace(/<iframe\b[^>]*>([\s\S]*?)<\/iframe>/gm, "") // Remove iframes
                                }}
                            />
                            {review.content.length > 300 && (
                                <button
                                    onClick={() => setExpandedReview(expandedReview === review.id ? null : review.id)}
                                    className="mt-2 text-pink-500 text-sm font-medium hover:text-pink-400 transition-colors"
                                >
                                    {expandedReview === review.id ? 'Read Less' : 'Read More'}
                                </button>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                            <span className="text-xs text-gray-500">
                                {new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                            <a
                                href={review.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-gray-400 hover:text-white transition-colors"
                            >
                                View Original
                            </a>
                        </div>
                    </motion.div>
                ))}
            </div>

            {reviews.length > 6 && (
                <div className="flex justify-center">
                    <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-full font-medium transition-colors border border-white/10">
                        Read All {reviews.length} Reviews
                    </button>
                </div>
            )}
        </section>
    )
}
