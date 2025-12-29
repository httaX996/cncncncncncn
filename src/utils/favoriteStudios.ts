interface FavoriteStudio {
  id: number
  name: string
  logo_path: string | null
  addedAt: number
}

const STORAGE_KEY = 'sanuflix_favorite_studios'

export const getFavoriteStudios = (): FavoriteStudio[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to get favorite studios:', error)
    return []
  }
}

export const isFavoriteStudio = (studioId: number): boolean => {
  const favorites = getFavoriteStudios()
  return favorites.some(studio => studio.id === studioId)
}

export const toggleFavoriteStudio = (studio: {
  id: number
  name: string
  logo_path: string | null
}): boolean => {
  try {
    const favorites = getFavoriteStudios()
    const index = favorites.findIndex(s => s.id === studio.id)

    if (index > -1) {
      // Remove from favorites
      favorites.splice(index, 1)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
      return false
    } else {
      // Add to favorites
      const newFavorite: FavoriteStudio = {
        ...studio,
        addedAt: Date.now()
      }
      favorites.unshift(newFavorite)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
      return true
    }
  } catch (error) {
    console.error('Failed to toggle favorite studio:', error)
    return false
  }
}

export const removeFavoriteStudio = (studioId: number): void => {
  try {
    const favorites = getFavoriteStudios()
    const filtered = favorites.filter(s => s.id !== studioId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error('Failed to remove favorite studio:', error)
  }
}

