export type SeasonalTheme = 'halloween' | 'christmas' | 'valentine' | 'summer' | null

export const getCurrentSeasonalTheme = (): SeasonalTheme => {
  const now = new Date()
  const month = now.getMonth() + 1 // 1-12
  const day = now.getDate()

  // Halloween: October
  if (month === 10) {
    return 'halloween'
  }

  // Christmas/Winter: December
  if (month === 12 || (month === 1 && day <= 7)) {
    return 'christmas'
  }

  // Valentine's: February 1-14
  if (month === 2 && day <= 14) {
    return 'valentine'
  }

  // Summer: July-August
  if (month === 7 || month === 8) {
    return 'summer'
  }

  return null
}

export const getSeasonalThemeConfig = (theme: SeasonalTheme) => {
  switch (theme) {
    case 'halloween':
      return {
        name: 'Halloween',
        colors: {
          primary: '#FF6B35',
          secondary: '#9D4EDD',
          accent: '#FFB800'
        },
        emojis: ['🎃', '👻', '🦇', '🕷️', '🍂', '🕸️']
      }
    case 'christmas':
      return {
        name: 'Christmas',
        colors: {
          primary: '#C41E3A',
          secondary: '#2ECC71',
          accent: '#FFD700'
        },
        emojis: ['🎄', '⛄', '🎅', '🎁', '❄️', '⭐']
      }
    case 'valentine':
      return {
        name: "Valentine's",
        colors: {
          primary: '#FF1493',
          secondary: '#FF69B4',
          accent: '#FFB6C1'
        },
        emojis: ['❤️', '💕', '💘', '🌹', '💝', '💖']
      }
    case 'summer':
      return {
        name: 'Summer',
        colors: {
          primary: '#FFD700',
          secondary: '#00D4FF',
          accent: '#FF6B35'
        },
        emojis: ['☀️', '🏖️', '🌊', '🍉', '🌴', '🏄']
      }
    default:
      return null
  }
}

