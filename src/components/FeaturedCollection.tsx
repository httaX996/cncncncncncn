import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchCollection, getImageUrl } from '../services/tmdb'
import type { CollectionDetails } from '../types/tmdb'

const COLLECTION_IDS = [
    86311,  // The Avengers
    10,     // Star Wars
    1241,   // Harry Potter
    9485,   // Fast and Furious
    131635, // The Hunger Games
    2344,   // The Matrix
    645,    // James Bond
    263,    // Batman
    119,    // Spider-Man
    87359,  // Mission: Impossible
]

interface FeaturedCollectionProps {
    collectionId?: number
}

export const FeaturedCollection = ({ collectionId }: FeaturedCollectionProps) => {
    const [collection, setCollection] = useState<CollectionDetails | null>(null)

    useEffect(() => {
        const loadCollection = async () => {
            try {
                const id = collectionId || COLLECTION_IDS[Math.floor(Math.random() * COLLECTION_IDS.length)]
                const data = await fetchCollection(id)
                setCollection(data)
            } catch (error) {
                console.error('Failed to load collection', error)
            }
        }
        loadCollection()
    }, [collectionId])

    if (!collection) return null

    return (
        <div className="relative rounded-3xl overflow-hidden my-8 md:my-16 group">
            <div className="absolute inset-0">
                <img
                    src={getImageUrl(collection.backdrop_path, 'original')}
                    alt={collection.name}
                    className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
            </div>

            <div className="relative z-10 p-8 md:p-16 flex flex-col justify-center min-h-[300px] md:min-h-[400px]">
                <motion.span
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="text-pink-500 font-bold tracking-widest uppercase mb-4"
                >
                    Featured Collection
                </motion.span>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-6xl font-black text-white mb-6"
                >
                    {collection.name}
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-300 text-lg max-w-xl mb-8 line-clamp-3"
                >
                    {collection.overview}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Link
                        to={`/collection/${collection.id}`}
                        className="inline-block px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-pink-500 hover:text-white transition-all transform hover:scale-105"
                    >
                        View Collection
                    </Link>
                </motion.div>
            </div>
        </div>
    )
}
