export interface SearchHistoryItem {
  query: string
  timestamp: number
  resultCount?: number
}

const SEARCH_HISTORY_KEY = 'searchHistory'
const MAX_HISTORY_ITEMS = 10

export const getSearchHistory = (): SearchHistoryItem[] => {
  try {
    const stored = localStorage.getItem(SEARCH_HISTORY_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to parse search history from localStorage', error)
    return []
  }
}

export const addToSearchHistory = (query: string, resultCount?: number): void => {
  if (!query.trim()) return

  try {
    let history = getSearchHistory()
    
    // Remove existing entry if it exists
    history = history.filter(item => item.query.toLowerCase() !== query.toLowerCase())
    
    // Add new entry at the beginning
    const newItem: SearchHistoryItem = {
      query: query.trim(),
      timestamp: Date.now(),
      resultCount
    }
    
    history.unshift(newItem)
    
    // Keep only the most recent items
    history = history.slice(0, MAX_HISTORY_ITEMS)
    
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history))
  } catch (error) {
    console.error('Failed to save search history to localStorage', error)
  }
}

export const removeFromSearchHistory = (query: string): void => {
  try {
    let history = getSearchHistory()
    history = history.filter(item => item.query.toLowerCase() !== query.toLowerCase())
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history))
  } catch (error) {
    console.error('Failed to remove from search history', error)
  }
}

export const clearSearchHistory = (): void => {
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY)
  } catch (error) {
    console.error('Failed to clear search history', error)
  }
}

export const getRecentSearches = (limit: number = 5): SearchHistoryItem[] => {
  const history = getSearchHistory()
  return history.slice(0, limit)
}
