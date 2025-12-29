const WATCH_HISTORY_KEY = 'sanuflix_watch_history'
const MAX_HISTORY_ITEMS = 20

export interface WatchHistoryItem {
  id: number
  title: string
  poster_path: string | null
  backdrop_path: string | null
  mediaType: 'movie' | 'tv'
  lastWatchedAt: string
  // For TV shows only
  season?: number
  episode?: number
  vote_average?: number
}

export const getWatchHistory = (): WatchHistoryItem[] => {
  try {
    const stored = localStorage.getItem(WATCH_HISTORY_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to get watch history:', error)
    return []
  }
}

export const addToWatchHistory = (item: Omit<WatchHistoryItem, 'lastWatchedAt'>): void => {
  try {
    let history = getWatchHistory()
    
    // Remove existing entry if it exists (we'll re-add it at the top)
    if (item.mediaType === 'movie') {
      history = history.filter(h => !(h.id === item.id && h.mediaType === 'movie'))
    } else {
      // For TV shows, remove ALL episodes of this show (we only want to show the latest episode)
      history = history.filter(h => !(h.id === item.id && h.mediaType === 'tv'))
    }

    const newItem: WatchHistoryItem = {
      ...item,
      lastWatchedAt: new Date().toISOString()
    }

    // Add to beginning
    history.unshift(newItem)

    // Limit to max items
    if (history.length > MAX_HISTORY_ITEMS) {
      history = history.slice(0, MAX_HISTORY_ITEMS)
    }

    localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(history))
    
    // Dispatch custom event for UI updates
    window.dispatchEvent(new CustomEvent('watch-history-updated'))
  } catch (error) {
    console.error('Failed to add to watch history:', error)
  }
}

export const removeFromWatchHistory = (id: number, mediaType: 'movie' | 'tv', season?: number, episode?: number): void => {
  try {
    let history = getWatchHistory()
    
    if (mediaType === 'movie') {
      history = history.filter(item => !(item.id === id && item.mediaType === 'movie'))
    } else {
      history = history.filter(item => !(
        item.id === id && 
        item.mediaType === 'tv' && 
        item.season === season && 
        item.episode === episode
      ))
    }

    localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(history))
    window.dispatchEvent(new CustomEvent('watch-history-updated'))
  } catch (error) {
    console.error('Failed to remove from watch history:', error)
  }
}

export const clearWatchHistory = (): void => {
  try {
    localStorage.removeItem(WATCH_HISTORY_KEY)
    window.dispatchEvent(new CustomEvent('watch-history-updated'))
  } catch (error) {
    console.error('Failed to clear watch history:', error)
  }
}

export const getRecentWatchHistory = (limit: number = 10): WatchHistoryItem[] => {
  const history = getWatchHistory()
  return history.slice(0, limit)
}

