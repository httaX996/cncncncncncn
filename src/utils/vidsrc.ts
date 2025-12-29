import { VIDSRC_CONFIG } from '../config/tmdb'

export const getMovieEmbedUrl = (tmdbId: number): string => {
  return `${VIDSRC_CONFIG.BASE_URL}/movie/${tmdbId}`
}

export const getTVShowEmbedUrl = (
  tmdbId: number,
  season: number,
  episode: number
): string => {
  return `${VIDSRC_CONFIG.BASE_URL}/tv/${tmdbId}/${season}/${episode}`
}

// VidFast API integration
export const getVidFastMovieUrl = (tmdbId: number, themeColor: string): string => {
  return `https://vidfast.pro/movie/${tmdbId}?theme=${themeColor}`
}

export const getVidFastTVUrl = (
  tmdbId: number,
  season: number,
  episode: number,
  themeColor: string
): string => {
  return `https://vidfast.pro/tv/${tmdbId}/${season}/${episode}?theme=${themeColor}`
}

