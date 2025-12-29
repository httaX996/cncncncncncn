import { useState, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { Carousel } from './Carousel'
import { discoverMovies, discoverTVShows } from '../services/tmdb'
import { Movie, TVShow } from '../types/tmdb'

interface GenreSectionProps {
    title: string
    genreId: number
    type: 'movie' | 'tv'
    categoryPath?: string
}

export const GenreSection = ({ title, genreId, type, categoryPath }: GenreSectionProps) => {
    const [items, setItems] = useState<Movie[] | TVShow[]>([])
    const [loading, setLoading] = useState(false)
    const [hasLoaded, setHasLoaded] = useState(false)

    const { ref, inView } = useInView({
        triggerOnce: true,
        rootMargin: '200px', // Start loading 200px before it comes into view
        threshold: 0
    })

    useEffect(() => {
        const fetchData = async () => {
            if (inView && !hasLoaded && !loading) {
                setLoading(true)
                try {
                    if (type === 'movie') {
                        const data = await discoverMovies(1, { genre: genreId })
                        setItems(data.results)
                    } else {
                        const data = await discoverTVShows(1, { genre: genreId })
                        setItems(data.results)
                    }
                    setHasLoaded(true)
                } catch (error) {
                    console.error(`Failed to load genre ${genreId}:`, error)
                } finally {
                    setLoading(false)
                }
            }
        }

        fetchData()
    }, [inView, hasLoaded, loading, genreId, type])

    if (!hasLoaded && !loading && !inView) {
        // Placeholder to reserve space and allow intersection observer to work
        return <div ref={ref} className="h-64 w-full" />
    }

    if (loading && !items.length) {
        // Skeleton loading state
        return (
            <div ref={ref} className="space-y-4 animate-pulse">
                <div className="h-8 bg-gray-800/50 rounded w-48" />
                <div className="flex space-x-4 overflow-hidden">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex-shrink-0 w-32 sm:w-40 md:w-48 aspect-[2/3] bg-gray-800/30 rounded-xl" />
                    ))}
                </div>
            </div>
        )
    }

    if (!items.length) return null

    return (
        <div ref={ref}>
            <Carousel
                title={title}
                items={items}
                mediaType={type}
                categoryPath={categoryPath}
            />
        </div>
    )
}
