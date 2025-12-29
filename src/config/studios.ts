/**
 * Featured production companies/studios
 * IDs are from TMDB's company database
 */

export interface FeaturedStudio {
  id: number
  name: string
  description: string
}

export const FEATURED_STUDIOS: FeaturedStudio[] = [
  {
    id: 420,
    name: 'Marvel Studios',
    description: 'Superhero films and the Marvel Cinematic Universe'
  },
  {
    id: 2,
    name: 'Walt Disney Pictures',
    description: 'Magical storytelling and family entertainment'
  },
  {
    id: 3,
    name: 'Pixar',
    description: 'Pioneering animation studio'
  },
  {
    id: 174,
    name: 'Warner Bros. Pictures',
    description: 'Iconic films across all genres'
  },
  {
    id: 33,
    name: 'Universal Pictures',
    description: 'A century of entertainment'
  },
  {
    id: 34,
    name: 'Sony Pictures',
    description: 'Innovative storytelling and blockbusters'
  },
  {
    id: 4,
    name: 'Paramount Pictures',
    description: 'Legendary cinema since 1912'
  },
  {
    id: 25,
    name: '20th Century Studios',
    description: 'Epic adventures and groundbreaking films'
  },
  {
    id: 521,
    name: 'DreamWorks Animation',
    description: 'Animated adventures for all ages'
  },
  {
    id: 41077,
    name: 'A24',
    description: 'Independent cinema and bold storytelling'
  },
  {
    id: 1632,
    name: 'Lionsgate',
    description: 'Diverse entertainment experiences'
  },
  {
    id: 213,
    name: 'Netflix',
    description: 'Original series and films'
  },
  {
    id: 49,
    name: 'HBO',
    description: 'Premium television and films'
  },
  {
    id: 21,
    name: 'Metro-Goldwyn-Mayer',
    description: 'Golden age of Hollywood'
  },
  {
    id: 7505,
    name: 'Amazon Studios',
    description: 'Original content and streaming'
  }
]

