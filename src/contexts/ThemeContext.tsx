import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type ThemeMode = 'dark' | 'light' | 'auto'
type EffectiveTheme = 'dark' | 'light'
type ColorTheme = 'hotpink' | 'ocean' | 'sunset' | 'forest' | 'neon' | 'fire'

interface ThemeContextType {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  effectiveTheme: EffectiveTheme
  colorTheme: ColorTheme
  setColorTheme: (theme: ColorTheme) => void
  effectsEnabled: boolean
  setEffectsEnabled: (enabled: boolean) => void
  seasonalEnabled: boolean
  setSeasonalEnabled: (enabled: boolean) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = 'sanuflix_theme'
const COLOR_THEME_STORAGE_KEY = 'sanuflix_color_theme'
const EFFECTS_STORAGE_KEY = 'sanuflix_effects_enabled'

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return (stored as ThemeMode) || 'dark'
  })

  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
    const stored = localStorage.getItem(COLOR_THEME_STORAGE_KEY)
    return (stored as ColorTheme) || 'hotpink'
  })

  const [effectsEnabled, setEffectsEnabledState] = useState<boolean>(() => {
    // Auto-disable on mobile devices by default for better performance
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768
    const stored = localStorage.getItem(EFFECTS_STORAGE_KEY)
    return stored !== null ? stored === 'true' : !isMobile
  })

  const [seasonalEnabled, setSeasonalEnabledState] = useState<boolean>(() => {
    const stored = localStorage.getItem('sanuflix_seasonal_enabled')
    return stored !== null ? stored === 'true' : true
  })

  const [systemTheme, setSystemTheme] = useState<EffectiveTheme>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'dark'
  })

  const effectiveTheme: EffectiveTheme = theme === 'auto' ? systemTheme : theme

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement

    if (effectiveTheme === 'light') {
      root.classList.add('light-theme')
    } else {
      root.classList.remove('light-theme')
    }
  }, [effectiveTheme])

  // Apply color theme
  useEffect(() => {
    const colorThemes: Record<ColorTheme, { primary: string; primaryDark: string; gradientStart: string; gradientEnd: string }> = {
      hotpink: {
        primary: '#FF1493',
        primaryDark: '#C71585',
        gradientStart: '#FF1493',
        gradientEnd: '#C71585'
      },
      ocean: {
        primary: '#00D4FF',
        primaryDark: '#0095FF',
        gradientStart: '#00D4FF',
        gradientEnd: '#0095FF'
      },
      sunset: {
        primary: '#FF6B35',
        primaryDark: '#F44336',
        gradientStart: '#FF6B35',
        gradientEnd: '#F44336'
      },
      forest: {
        primary: '#2ECC71',
        primaryDark: '#27AE60',
        gradientStart: '#2ECC71',
        gradientEnd: '#27AE60'
      },
      neon: {
        primary: '#9D4EDD',
        primaryDark: '#7B2CBF',
        gradientStart: '#9D4EDD',
        gradientEnd: '#7B2CBF'
      },
      fire: {
        primary: '#FF4444',
        primaryDark: '#CC0000',
        gradientStart: '#FF4444',
        gradientEnd: '#CC0000'
      }
    }

    // Christmas Theme Override
    const christmasColors = {
      primary: '#D42426', // Santa Red
      primaryDark: '#A0181A', // Deep Red
      gradientStart: '#D42426',
      gradientEnd: '#165B33' // Holly Green
    }

    const colors = seasonalEnabled ? christmasColors : colorThemes[colorTheme]
    const root = document.documentElement

    root.style.setProperty('--color-primary', colors.primary)
    root.style.setProperty('--color-primary-dark', colors.primaryDark)
    root.style.setProperty('--color-gradient-start', colors.gradientStart)
    root.style.setProperty('--color-gradient-end', colors.gradientEnd)
  }, [colorTheme, seasonalEnabled])

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme)
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)
  }

  const setColorTheme = (newTheme: ColorTheme) => {
    setColorThemeState(newTheme)
    localStorage.setItem(COLOR_THEME_STORAGE_KEY, newTheme)
  }

  const setEffectsEnabled = (enabled: boolean) => {
    setEffectsEnabledState(enabled)
    localStorage.setItem(EFFECTS_STORAGE_KEY, String(enabled))
  }

  const setSeasonalEnabled = (enabled: boolean) => {
    setSeasonalEnabledState(enabled)
    localStorage.setItem('sanuflix_seasonal_enabled', String(enabled))
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        effectiveTheme,
        colorTheme,
        setColorTheme,
        effectsEnabled,
        setEffectsEnabled,
        seasonalEnabled,
        setSeasonalEnabled
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

