const WATCHLIST_KEY = 'sanuflix_watchlist'

export interface WatchlistItem {
  id: number
  title: string
  poster_path: string | null
  mediaType: 'movie' | 'tv'
  addedAt: string
  vote_average?: number
  release_date?: string
  first_air_date?: string
}

export const getWatchlist = (): WatchlistItem[] => {
  try {
    const stored = localStorage.getItem(WATCHLIST_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to get watchlist:', error)
    return []
  }
}

export const addToWatchlist = (item: any, mediaType: 'movie' | 'tv'): void => {
  try {
    const watchlist = getWatchlist()
    
    // Check if already exists
    if (watchlist.some(w => w.id === item.id && w.mediaType === mediaType)) {
      return
    }

    const newItem: WatchlistItem = {
      id: item.id,
      title: 'title' in item ? item.title : item.name,
      poster_path: item.poster_path,
      mediaType,
      addedAt: new Date().toISOString(),
      vote_average: item.vote_average,
      release_date: item.release_date,
      first_air_date: item.first_air_date,
    }

    watchlist.unshift(newItem) // Add to beginning
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist))
    
    // Dispatch custom event for UI updates
    window.dispatchEvent(new CustomEvent('watchlist-updated'))
  } catch (error) {
    console.error('Failed to add to watchlist:', error)
  }
}

export const removeFromWatchlist = (id: number, mediaType: 'movie' | 'tv'): void => {
  try {
    const watchlist = getWatchlist()
    const filtered = watchlist.filter(item => !(item.id === id && item.mediaType === mediaType))
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(filtered))
    
    // Dispatch custom event for UI updates
    window.dispatchEvent(new CustomEvent('watchlist-updated'))
  } catch (error) {
    console.error('Failed to remove from watchlist:', error)
  }
}

export const isInWatchlist = (id: number, mediaType: 'movie' | 'tv'): boolean => {
  try {
    const watchlist = getWatchlist()
    return watchlist.some(item => item.id === id && item.mediaType === mediaType)
  } catch (error) {
    console.error('Failed to check watchlist:', error)
    return false
  }
}

export const toggleWatchlist = (item: any, mediaType: 'movie' | 'tv'): boolean => {
  if (isInWatchlist(item.id, mediaType)) {
    removeFromWatchlist(item.id, mediaType)
    return false
  } else {
    addToWatchlist(item, mediaType)
    return true
  }
}

