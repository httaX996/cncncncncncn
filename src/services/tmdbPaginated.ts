import axios from 'axios'
import { TMDB_CONFIG } from '../config/tmdb'
import type { Movie, TVShow, TMDBResponse } from '../types/tmdb'

const tmdbApi = axios.create({
  baseURL: TMDB_CONFIG.BASE_URL,
  params: {
    api_key: TMDB_CONFIG.API_KEY,
  },
})

// Paginated fetch functions for loading more content
export const fetchTrendingMoviesPaginated = async (page: number = 1, _sortBy?: string): Promise<TMDBResponse<Movie>> => {
  const params: any = { page }
  // Trending endpoint doesn't support custom sorting
  const response = await tmdbApi.get<TMDBResponse<Movie>>('/trending/movie/week', { params })
  return response.data
}

export const fetchPopularMoviesPaginated = async (page: number = 1, sortBy?: string): Promise<TMDBResponse<Movie>> => {
  const params: any = { page }
  if (sortBy) params.sort_by = sortBy
  const response = await tmdbApi.get<TMDBResponse<Movie>>('/movie/popular', { params })
  return response.data
}

export const fetchTopRatedMoviesPaginated = async (page: number = 1, sortBy?: string): Promise<TMDBResponse<Movie>> => {
  const params: any = { page }
  if (sortBy) params.sort_by = sortBy
  const response = await tmdbApi.get<TMDBResponse<Movie>>('/movie/top_rated', { params })
  return response.data
}

export const fetchNowPlayingMoviesPaginated = async (page: number = 1, sortBy?: string): Promise<TMDBResponse<Movie>> => {
  const params: any = { page }
  if (sortBy) params.sort_by = sortBy
  const response = await tmdbApi.get<TMDBResponse<Movie>>('/movie/now_playing', { params })
  return response.data
}

export const fetchTrendingTVShowsPaginated = async (page: number = 1, _sortBy?: string): Promise<TMDBResponse<TVShow>> => {
  const params: any = { page }
  // Trending endpoint doesn't support custom sorting
  const response = await tmdbApi.get<TMDBResponse<TVShow>>('/trending/tv/week', { params })
  return response.data
}

export const fetchPopularTVShowsPaginated = async (page: number = 1, sortBy?: string): Promise<TMDBResponse<TVShow>> => {
  const params: any = { page }
  if (sortBy) params.sort_by = sortBy
  const response = await tmdbApi.get<TMDBResponse<TVShow>>('/tv/popular', { params })
  return response.data
}

export const fetchTopRatedTVShowsPaginated = async (page: number = 1, sortBy?: string): Promise<TMDBResponse<TVShow>> => {
  const params: any = { page }
  if (sortBy) params.sort_by = sortBy
  const response = await tmdbApi.get<TMDBResponse<TVShow>>('/tv/top_rated', { params })
  return response.data
}

