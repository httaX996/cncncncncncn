export type ColorTheme = 'hotpink' | 'ocean' | 'sunset' | 'forest' | 'neon' | 'fire'

export interface ThemeColors {
  name: string
  primary: string
  primaryDark: string
  gradientStart: string
  gradientEnd: string
  description: string
}

export const colorThemes: Record<ColorTheme, ThemeColors> = {
  hotpink: {
    name: 'Hotpink',
    primary: '#FF1493',
    primaryDark: '#C71585',
    gradientStart: '#FF1493',
    gradientEnd: '#C71585',
    description: 'Bold and vibrant pink'
  },
  ocean: {
    name: 'Ocean',
    primary: '#00D4FF',
    primaryDark: '#0095FF',
    gradientStart: '#00D4FF',
    gradientEnd: '#0095FF',
    description: 'Cool blue waves'
  },
  sunset: {
    name: 'Sunset',
    primary: '#FF6B35',
    primaryDark: '#F44336',
    gradientStart: '#FF6B35',
    gradientEnd: '#F44336',
    description: 'Warm orange glow'
  },
  forest: {
    name: 'Forest',
    primary: '#2ECC71',
    primaryDark: '#27AE60',
    gradientStart: '#2ECC71',
    gradientEnd: '#27AE60',
    description: 'Natural green'
  },
  neon: {
    name: 'Neon',
    primary: '#9D4EDD',
    primaryDark: '#7B2CBF',
    gradientStart: '#9D4EDD',
    gradientEnd: '#7B2CBF',
    description: 'Electric purple'
  },
  fire: {
    name: 'Fire',
    primary: '#FF4444',
    primaryDark: '#CC0000',
    gradientStart: '#FF4444',
    gradientEnd: '#CC0000',
    description: 'Blazing red'
  }
}

