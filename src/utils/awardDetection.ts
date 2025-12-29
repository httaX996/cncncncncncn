import type { Keyword } from '../types/tmdb'

export type AwardType = 'oscar' | 'emmy' | 'golden-globe' | 'bafta' | 'cannes' | 'sundance' | 'critics-choice'

export interface Award {
  type: AwardType
  label: string
  color: string
  icon: string
  prestige: number // Higher = more prestigious
}

// Keyword patterns for detecting awards
const AWARD_KEYWORDS: Record<string, AwardType> = {
  // Oscars / Academy Awards
  'oscar': 'oscar',
  'academy award': 'oscar',
  'best picture': 'oscar',
  'best actor': 'oscar',
  'best actress': 'oscar',
  'best director': 'oscar',
  
  // Emmys
  'emmy': 'emmy',
  'emmy award': 'emmy',
  'outstanding': 'emmy',
  
  // Golden Globes
  'golden globe': 'golden-globe',
  'golden globes': 'golden-globe',
  
  // BAFTA
  'bafta': 'bafta',
  'british academy': 'bafta',
  
  // Cannes
  'cannes': 'cannes',
  'palme d\'or': 'cannes',
  
  // Sundance
  'sundance': 'sundance',
  
  // Critics Choice
  'critics choice': 'critics-choice',
  'critics\' choice': 'critics-choice'
}

const AWARD_CONFIGS: Record<AwardType, Award> = {
  'oscar': {
    type: 'oscar',
    label: 'Oscar Winner',
    color: '#FFD700',
    icon: '🏆',
    prestige: 10
  },
  'emmy': {
    type: 'emmy',
    label: 'Emmy Winner',
    color: '#FFD700',
    icon: '📺',
    prestige: 9
  },
  'golden-globe': {
    type: 'golden-globe',
    label: 'Golden Globe',
    color: '#FFD700',
    icon: '🌟',
    prestige: 8
  },
  'bafta': {
    type: 'bafta',
    label: 'BAFTA Winner',
    color: '#C0C0C0',
    icon: '🎭',
    prestige: 7
  },
  'cannes': {
    type: 'cannes',
    label: 'Cannes Winner',
    color: '#FFD700',
    icon: '🎬',
    prestige: 9
  },
  'sundance': {
    type: 'sundance',
    label: 'Sundance Winner',
    color: '#FF6347',
    icon: '☀️',
    prestige: 6
  },
  'critics-choice': {
    type: 'critics-choice',
    label: 'Critics Choice',
    color: '#4169E1',
    icon: '⭐',
    prestige: 5
  }
}

/**
 * Detect awards from TMDB keywords
 * @param keywords Array of keyword objects from TMDB
 * @returns Array of detected awards, sorted by prestige
 */
export const detectAwards = (keywords: Keyword[]): Award[] => {
  const detectedTypes = new Set<AwardType>()
  
  keywords.forEach(keyword => {
    const lowerName = keyword.name.toLowerCase()
    
    // Check if keyword matches any award pattern
    Object.entries(AWARD_KEYWORDS).forEach(([pattern, awardType]) => {
      if (lowerName.includes(pattern)) {
        detectedTypes.add(awardType)
      }
    })
  })
  
  // Convert to Award objects and sort by prestige
  return Array.from(detectedTypes)
    .map(type => AWARD_CONFIGS[type])
    .sort((a, b) => b.prestige - a.prestige)
}

/**
 * Get award configuration by type
 */
export const getAwardBadge = (awardType: AwardType): Award => {
  return AWARD_CONFIGS[awardType]
}

/**
 * Check if content has any critically acclaimed awards
 */
export const isCriticallyAcclaimed = (keywords: Keyword[]): boolean => {
  const awards = detectAwards(keywords)
  return awards.length > 0 && awards.some(a => a.prestige >= 7)
}

