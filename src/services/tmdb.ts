import axios from 'axios'
import { TMDB_CONFIG } from '../config/tmdb'
import type {
  Movie,
  TVShow,
  MovieDetails,
  TVShowDetails,
  TMDBResponse,
  Video,
  Credits,
  Episode,
  GenreListResponse,
  DiscoverFilters,
  CollectionDetails,
  PersonDetails,
  PersonMovieCredits,
  PersonTVCredits,
  Keyword,
  KeywordsResponse,
  CompanyDetails,
  ProductionCompany,
  ContentRatingsResponse,
  ReleaseDatesResponse,
} from '../types/tmdb'

const tmdbApi = axios.create({
  baseURL: TMDB_CONFIG.BASE_URL,
  params: {
    api_key: TMDB_CONFIG.API_KEY,
  },
})

// Helper function to construct image URLs
export const getImageUrl = (
  path: string | null,
  size: string = 'original'
): string => {
  if (!path) return '/placeholder-movie.jpg'
  return `${TMDB_CONFIG.IMAGE_BASE_URL}/${size}${path}`
}

// Movies
export const fetchTrendingMovies = async (page: number = 1): Promise<Movie[]> => {
  const response = await tmdbApi.get<TMDBResponse<Movie>>('/trending/movie/week', { params: { page } })
  return response.data.results
}

export const fetchPopularMovies = async (page: number = 1): Promise<Movie[]> => {
  const response = await tmdbApi.get<TMDBResponse<Movie>>('/movie/popular', { params: { page } })
  return response.data.results
}

export const fetchTopRatedMovies = async (page: number = 1): Promise<Movie[]> => {
  const response = await tmdbApi.get<TMDBResponse<Movie>>('/movie/top_rated', { params: { page } })
  return response.data.results
}

export const fetchNowPlayingMovies = async (page: number = 1): Promise<Movie[]> => {
  const response = await tmdbApi.get<TMDBResponse<Movie>>('/movie/now_playing', { params: { page } })
  return response.data.results
}

export const fetchUpcomingMovies = async (): Promise<Movie[]> => {
  const response = await tmdbApi.get<TMDBResponse<Movie>>('/movie/upcoming')
  return response.data.results
}

export const fetchMovieDetails = async (movieId: number): Promise<MovieDetails> => {
  const response = await tmdbApi.get<MovieDetails>(`/movie/${movieId}`, {
    params: { append_to_response: 'release_dates,videos,credits' }
  })
  return response.data
}

export const fetchMovieVideos = async (movieId: number): Promise<Video[]> => {
  const response = await tmdbApi.get<{ results: Video[] }>(`/movie/${movieId}/videos`)
  return response.data.results
}

export const fetchMovieCredits = async (movieId: number): Promise<Credits> => {
  const response = await tmdbApi.get<Credits>(`/movie/${movieId}/credits`)
  return response.data
}

export const fetchSimilarMovies = async (movieId: number): Promise<Movie[]> => {
  const response = await tmdbApi.get<TMDBResponse<Movie>>(`/movie/${movieId}/similar`)
  return response.data.results
}

// TV Shows
export const fetchTrendingTVShows = async (page: number = 1): Promise<TVShow[]> => {
  const response = await tmdbApi.get<TMDBResponse<TVShow>>('/trending/tv/week', { params: { page } })
  return response.data.results
}

export const fetchPopularTVShows = async (page: number = 1): Promise<TVShow[]> => {
  const response = await tmdbApi.get<TMDBResponse<TVShow>>('/tv/popular', { params: { page } })
  return response.data.results
}

export const fetchTopRatedTVShows = async (page: number = 1): Promise<TVShow[]> => {
  const response = await tmdbApi.get<TMDBResponse<TVShow>>('/tv/top_rated', { params: { page } })
  return response.data.results
}

export const fetchTVShowDetails = async (tvId: number): Promise<TVShowDetails> => {
  const response = await tmdbApi.get<TVShowDetails>(`/tv/${tvId}`, {
    params: { append_to_response: 'content_ratings,videos,credits' }
  })
  return response.data
}

export const fetchTVShowVideos = async (tvId: number): Promise<Video[]> => {
  const response = await tmdbApi.get<{ results: Video[] }>(`/tv/${tvId}/videos`)
  return response.data.results
}

export const fetchTVShowCredits = async (tvId: number): Promise<Credits> => {
  const response = await tmdbApi.get<Credits>(`/tv/${tvId}/credits`)
  return response.data
}

export const fetchSeasonDetails = async (
  tvId: number,
  seasonNumber: number
): Promise<{ episodes: Episode[] }> => {
  const response = await tmdbApi.get<{ episodes: Episode[] }>(
    `/tv/${tvId}/season/${seasonNumber}`
  )
  return response.data
}

export const fetchSimilarTVShows = async (tvId: number): Promise<TVShow[]> => {
  const response = await tmdbApi.get<TMDBResponse<TVShow>>(`/tv/${tvId}/similar`)
  return response.data.results
}

// Search
export const searchMulti = async (query: string, page: number = 1): Promise<TMDBResponse<Movie | TVShow>> => {
  const response = await tmdbApi.get<TMDBResponse<Movie | TVShow>>('/search/multi', {
    params: { query, page },
  })
  return response.data
}

export const searchMovies = async (query: string): Promise<Movie[]> => {
  const response = await tmdbApi.get<TMDBResponse<Movie>>('/search/movie', {
    params: { query },
  })
  return response.data.results
}

export const searchTVShows = async (query: string): Promise<TVShow[]> => {
  const response = await tmdbApi.get<TMDBResponse<TVShow>>('/search/tv', {
    params: { query },
  })
  return response.data.results
}

// Genres
export const fetchMovieGenres = async (): Promise<GenreListResponse> => {
  const response = await tmdbApi.get<GenreListResponse>('/genre/movie/list')
  return response.data
}

export const fetchTVGenres = async (): Promise<GenreListResponse> => {
  const response = await tmdbApi.get<GenreListResponse>('/genre/tv/list')
  return response.data
}

// Discover with filters
export const discoverMovies = async (
  page: number = 1,
  filters: DiscoverFilters = {}
): Promise<TMDBResponse<Movie>> => {
  const params: any = { page }

  if (filters.genre) params.with_genres = filters.genre
  if (filters.year_min) params['primary_release_date.gte'] = `${filters.year_min}-01-01`
  if (filters.year_max) params['primary_release_date.lte'] = `${filters.year_max}-12-31`
  if (filters.rating_min) params['vote_average.gte'] = filters.rating_min
  if (filters.sort_by) params.sort_by = filters.sort_by
  else params.sort_by = 'popularity.desc'

  // Watch Providers
  if (filters.with_watch_providers) {
    params.with_watch_providers = filters.with_watch_providers
    params.watch_region = filters.watch_region || 'US' // Default to US if not specified
  }

  const response = await tmdbApi.get<TMDBResponse<Movie>>('/discover/movie', { params })
  return response.data
}

export const fetchOnTheAirTVShows = async (page: number = 1): Promise<TVShow[]> => {
  const response = await tmdbApi.get<TMDBResponse<TVShow>>('/tv/on_the_air', { params: { page } })
  return response.data.results
}

export const discoverTVShows = async (
  page: number = 1,
  filters: DiscoverFilters = {}
): Promise<TMDBResponse<TVShow>> => {
  const params: any = { page }

  if (filters.genre) params.with_genres = filters.genre
  if (filters.year_min) params['first_air_date.gte'] = `${filters.year_min}-01-01`
  if (filters.year_max) params['first_air_date.lte'] = `${filters.year_max}-12-31`
  if (filters.rating_min) params['vote_average.gte'] = filters.rating_min
  if (filters.sort_by) params.sort_by = filters.sort_by
  else params.sort_by = 'popularity.desc'

  // Watch Providers
  if (filters.with_watch_providers) {
    params.with_watch_providers = filters.with_watch_providers
    params.watch_region = filters.watch_region || 'US' // Default to US if not specified
  }

  const response = await tmdbApi.get<TMDBResponse<TVShow>>('/discover/tv', { params })
  return response.data
}

// Collections
export const fetchCollection = async (collectionId: number): Promise<CollectionDetails> => {
  const response = await tmdbApi.get<CollectionDetails>(`/collection/${collectionId}`)
  return response.data
}

// People
export const fetchPersonDetails = async (personId: number): Promise<PersonDetails> => {
  const response = await tmdbApi.get<PersonDetails>(`/person/${personId}`)
  return response.data
}

export const fetchPersonMovieCredits = async (personId: number): Promise<PersonMovieCredits> => {
  const response = await tmdbApi.get<PersonMovieCredits>(`/person/${personId}/movie_credits`)
  return response.data
}

export const fetchPersonTVCredits = async (personId: number): Promise<PersonTVCredits> => {
  const response = await tmdbApi.get<PersonTVCredits>(`/person/${personId}/tv_credits`)
  return response.data
}

export const fetchTrendingPeople = async (page: number = 1): Promise<PersonDetails[]> => {
  const response = await tmdbApi.get<{ results: PersonDetails[] }>('/trending/person/week', { params: { page } })
  return response.data.results
}

// Keywords
export const fetchMovieKeywords = async (movieId: number): Promise<Keyword[]> => {
  const response = await tmdbApi.get<KeywordsResponse>(`/movie/${movieId}/keywords`)
  return response.data.keywords
}

export const fetchTVKeywords = async (tvId: number): Promise<Keyword[]> => {
  const response = await tmdbApi.get<{ results: Keyword[] }>(`/tv/${tvId}/keywords`)
  return response.data.results
}

// Production Companies
export const fetchCompanyDetails = async (companyId: number): Promise<CompanyDetails> => {
  const response = await tmdbApi.get<CompanyDetails>(`/company/${companyId}`)
  return response.data
}

export const fetchCompanyMovies = async (
  companyId: number,
  page: number = 1
): Promise<TMDBResponse<Movie>> => {
  const response = await tmdbApi.get<TMDBResponse<Movie>>('/discover/movie', {
    params: {
      with_companies: companyId,
      page,
      sort_by: 'release_date.desc'
    }
  })
  return response.data
}

export const fetchCompanyTVShows = async (
  companyId: number,
  page: number = 1
): Promise<TMDBResponse<TVShow>> => {
  const response = await tmdbApi.get<TMDBResponse<TVShow>>('/discover/tv', {
    params: {
      with_companies: companyId,
      page,
      sort_by: 'first_air_date.desc'
    }
  })
  return response.data
}

export const searchCompanies = async (
  query: string,
  page: number = 1
): Promise<TMDBResponse<ProductionCompany>> => {
  const response = await tmdbApi.get<TMDBResponse<ProductionCompany>>('/search/company', {
    params: {
      query,
      page
    }
  })
  return response.data
}

// Search suggestions and trending searches
export const getSearchSuggestions = async (query: string): Promise<{
  movies: Movie[]
  tvShows: TVShow[]
  people: PersonDetails[]
}> => {
  if (!query.trim()) return { movies: [], tvShows: [], people: [] }

  try {
    const [moviesResponse, tvResponse, peopleResponse] = await Promise.all([
      tmdbApi.get('/search/movie', { params: { query, page: 1 } }),
      tmdbApi.get('/search/tv', { params: { query, page: 1 } }),
      tmdbApi.get('/search/person', { params: { query, page: 1 } })
    ])

    return {
      movies: moviesResponse.data.results.slice(0, 5), // Limit to 5 suggestions
      tvShows: tvResponse.data.results.slice(0, 5),
      people: peopleResponse.data.results.slice(0, 3) // Limit people to 3
    }
  } catch (error) {
    console.error('Error fetching search suggestions:', error)
    return { movies: [], tvShows: [], people: [] }
  }
}

export const getTrendingSearches = async (): Promise<string[]> => {
  try {
    // Get trending movies and TV shows to generate trending search terms
    const [trendingMovies, trendingTV] = await Promise.all([
      tmdbApi.get('/trending/movie/week'),
      tmdbApi.get('/trending/tv/week')
    ])

    const trendingTerms = [
      ...trendingMovies.data.results.slice(0, 5).map((movie: Movie) => movie.title),
      ...trendingTV.data.results.slice(0, 5).map((show: TVShow) => show.name)
    ]

    return trendingTerms
  } catch (error) {
    console.error('Error fetching trending searches:', error)
    return []
  }
}

// Content Ratings
export const fetchMovieContentRatings = async (movieId: number): Promise<ReleaseDatesResponse> => {
  const response = await tmdbApi.get<ReleaseDatesResponse>(`/movie/${movieId}/release_dates`)
  return response.data
}

export const fetchTVContentRatings = async (tvId: number): Promise<ContentRatingsResponse> => {
  const response = await tmdbApi.get<ContentRatingsResponse>(`/tv/${tvId}/content_ratings`)
  return response.data
}

// Images
export const fetchMovieImages = async (movieId: number): Promise<{ backdrops: any[], posters: any[], logos: any[] }> => {
  const response = await tmdbApi.get(`movie/${movieId}/images`, {
    params: { include_image_language: 'en,null' }
  })
  return response.data
}

export const fetchTVImages = async (tvId: number): Promise<{ backdrops: any[], posters: any[], logos: any[] }> => {
  const response = await tmdbApi.get(`tv/${tvId}/images`, {
    params: { include_image_language: 'en,null' }
  })
  return response.data
}

// External IDs
export const fetchExternalIds = async (id: number, type: 'movie' | 'tv'): Promise<any> => {
  const response = await tmdbApi.get(`${type}/${id}/external_ids`)
  return response.data
}

// Reviews
export const fetchReviews = async (id: number, type: 'movie' | 'tv'): Promise<any[]> => {
  const response = await tmdbApi.get(`${type}/${id}/reviews`)
  return response.data.results
}

// Keywords (Consolidated)
export const fetchKeywords = async (id: number, type: 'movie' | 'tv'): Promise<Keyword[]> => {
  const response = await tmdbApi.get(`${type}/${id}/keywords`)
  return response.data.keywords || response.data.results || []
}
