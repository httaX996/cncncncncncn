// Sports API Types based on livesport.su API documentation

export interface Sport {
  id: string
  name: string
}

export interface Team {
  name: string
  badge: string
}

export interface Match {
  id: string
  title: string
  category: string
  date: number // Unix timestamp in milliseconds
  popular: boolean
  teams?: {
    home?: Team
    away?: Team
  }
}

export interface Stream {
  id: string
  streamNo: number
  language: string
  hd: boolean
  embedUrl: string
  source: string
}

export interface MatchDetail extends Match {
  sources: Stream[]
}

