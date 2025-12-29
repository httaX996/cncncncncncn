export const getRatingColor = (rating: string): string => {
    const r = rating.toUpperCase()

    // Adults / Mature
    if (['R', 'NC-17', 'TV-MA', '18', '18+'].includes(r)) {
        return 'bg-red-600 text-white border-red-500/50'
    }

    // 16+
    if (['16', '16+', 'TV-14'].includes(r)) {
        return 'bg-orange-500 text-white border-orange-400/50'
    }

    // 13+ / Teens
    if (['PG-13', '12', '12+', 'TV-PG'].includes(r)) {
        return 'bg-yellow-500 text-black border-yellow-400/50'
    }

    // Kids / General
    if (['G', 'PG', 'TV-G', 'TV-Y', 'TV-Y7', '0', 'U'].includes(r)) {
        return 'bg-green-500 text-white border-green-400/50'
    }

    // Default
    return 'bg-gray-700 text-gray-200 border-gray-600/50'
}

export const getRatingLabel = (rating: string): string => {
    const r = rating.toUpperCase()

    if (['R', 'NC-17', 'TV-MA', '18', '18+'].includes(r)) return 'Adults Only'
    if (['16', '16+', 'TV-14'].includes(r)) return '16+'
    if (['PG-13', '12', '12+', 'TV-PG'].includes(r)) return '13+'
    if (['G', 'PG', 'TV-G', 'TV-Y', 'TV-Y7', '0', 'U'].includes(r)) return 'General'

    return rating
}

export const getRatingShortLabel = (rating: string): string => {
    const r = rating.toUpperCase()

    if (['R', 'NC-17', 'TV-MA', '18', '18+'].includes(r)) return 'A'
    if (['16', '16+', 'TV-14'].includes(r)) return '16+'
    if (['PG-13', '12', '12+', 'TV-PG'].includes(r)) return '13+'
    if (['G', 'PG', 'TV-G', 'TV-Y', 'TV-Y7', '0', 'U'].includes(r)) return 'U'

    return r
}
