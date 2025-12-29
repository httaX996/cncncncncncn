// Home mode utility for persisting mode selection

export type HomeMode = 'default' | 'sports'

const HOME_MODE_STORAGE_KEY = 'sanuflix_home_mode'

/**
 * Get the current home mode from localStorage
 * Defaults to 'default' if not set
 */
export const getHomeMode = (): HomeMode => {
  try {
    const stored = localStorage.getItem(HOME_MODE_STORAGE_KEY)
    if (stored === 'default' || stored === 'sports') {
      return stored as HomeMode
    }
    return 'default'
  } catch (error) {
    console.error('Error reading home mode from localStorage:', error)
    return 'default'
  }
}

/**
 * Set the home mode and persist to localStorage
 */
export const setHomeMode = (mode: HomeMode): void => {
  try {
    localStorage.setItem(HOME_MODE_STORAGE_KEY, mode)
  } catch (error) {
    console.error('Error saving home mode to localStorage:', error)
  }
}

