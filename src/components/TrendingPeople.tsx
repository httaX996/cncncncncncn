import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getImageUrl, fetchTrendingPeople } from '../services/tmdb'
import type { PersonDetails } from '../types/tmdb'

export const TrendingPeople = () => {
    const [people, setPeople] = useState<PersonDetails[]>([])

    useEffect(() => {
        const loadPeople = async () => {
            try {
                const data = await fetchTrendingPeople()
                setPeople(data)
            } catch (error) {
                console.error('Failed to load trending people', error)
            }
        }
        loadPeople()
    }, [])

    if (people.length === 0) return null

    return (
        <div className="py-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 px-4 md:px-0">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">
                    Trending Stars
                </span>
            </h2>

            <div className="flex overflow-x-auto gap-6 px-4 md:px-0 pb-8 hide-scrollbar snap-x">
                {people.map((person, index) => (
                    <motion.div
                        key={person.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex-shrink-0 flex flex-col items-center gap-3 w-24 md:w-32 snap-start group"
                    >
                        <Link to={`/person/${person.id}`} className="relative">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-amber-500 transition-colors duration-300">
                                <img
                                    src={getImageUrl(person.profile_path, 'w185')}
                                    alt={person.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                        </Link>
                        <div className="text-center">
                            <h3 className="text-white text-sm md:text-base font-medium line-clamp-1 group-hover:text-amber-400 transition-colors">
                                {person.name}
                            </h3>
                            <p className="text-gray-400 text-xs line-clamp-1">
                                {person.known_for_department}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
