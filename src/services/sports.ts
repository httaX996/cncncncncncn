import axios from 'axios'
import type { Match, MatchDetail, Sport } from '../types/sports'

const SPORTS_API_BASE_URL = import.meta.env.VITE_SPORTS_API_URL || ''

// Check if sports feature is enabled
export const isSportsEnabled = () => Boolean(SPORTS_API_BASE_URL)

const sportsApi = axios.create({
  baseURL: SPORTS_API_BASE_URL,
})

// Helper function to construct badge URLs
export const getBadgeUrl = (badgePath: string | null | undefined): string => {
  if (!badgePath) return ''
  // If badge path is already a full URL, return it
  if (badgePath.startsWith('http://') || badgePath.startsWith('https://')) {
    return badgePath
  }
  // Otherwise, construct full URL from relative path
  return `${SPORTS_API_BASE_URL.replace('/api', '')}${badgePath.startsWith('/') ? '' : '/'}${badgePath}`
}

// Interface for API response
interface ApiResponse<T> {
  data: T;
  success: boolean;
}

// Fetch live matches
export const fetchLiveMatches = async (): Promise<Match[]> => {
  try {
    const response = await sportsApi.get<ApiResponse<Match[]>>('/matches/live')
    return response.data.data || []
  } catch (error) {
    console.error('Error fetching live matches:', error)
    return []
  }
}

// Fetch popular live matches
export const fetchPopularLiveMatches = async (): Promise<Match[]> => {
  try {
    const response = await sportsApi.get<ApiResponse<Match[]>>('/matches/live/popular')
    return response.data.data || []
  } catch (error) {
    console.error('Error fetching popular live matches:', error)
    return []
  }
}

// Fetch upcoming matches (today's matches)
export const fetchUpcomingMatches = async (): Promise<Match[]> => {
  try {
    const response = await sportsApi.get<ApiResponse<Match[]>>('/matches/all-today')
    return response.data.data || []
  } catch (error) {
    console.error('Error fetching upcoming matches:', error)
    return []
  }
}

// Fetch matches by sport
export const fetchMatchesBySport = async (sportId: string): Promise<Match[]> => {
  try {
    const response = await sportsApi.get<ApiResponse<Match[]>>(`/matches/${sportId}`)
    return response.data.data || []
  } catch (error) {
    console.error(`Error fetching matches for sport ${sportId}:`, error)
    return []
  }
}

// Fetch all sports
export const fetchAllSports = async (): Promise<Sport[]> => {
  try {
    const response = await sportsApi.get<ApiResponse<Sport[]>>('/sports')
    console.log('Sports API Response:', response.data)

    if (response.data?.success && Array.isArray(response.data.data)) {
      return response.data.data
    }

    console.error('Invalid sports data format:', response.data)
    return []
  } catch (error) {
    console.error('Error fetching sports:', error)
    return []
  }
}

// Fetch match detail with streams
export const fetchMatchDetail = async (matchId: string): Promise<MatchDetail | null> => {
  try {
    const response = await sportsApi.get<ApiResponse<MatchDetail>>(`/matches/${matchId}/detail`)
    return response.data.data || null
  } catch (error) {
    console.error(`Error fetching match detail for ${matchId}:`, error)
    return null
  }
}

