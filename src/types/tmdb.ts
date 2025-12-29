export interface Movie {
  id: number
  title: string
  original_title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  popularity: number
  genre_ids: number[]
  adult: boolean
  original_language: string
  video: boolean
  media_type?: 'movie'
}

export interface TVShow {
  id: number
  name: string
  original_name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  first_air_date: string
  vote_average: number
  vote_count: number
  popularity: number
  genre_ids: number[]
  origin_country: string[]
  original_language: string
  media_type?: 'tv'
}

export interface Genre {
  id: number
  name: string
}

export interface GenreListResponse {
  genres: Genre[]
}

export interface DiscoverFilters {
  genre?: number
  year_min?: number
  year_max?: number
  rating_min?: number
  sort_by?: string
  with_watch_providers?: string
  watch_region?: string
}

export interface ProductionCompany {
  id: number
  name: string
  logo_path: string | null
  origin_country: string
}

export interface Collection {
  id: number
  name: string
  poster_path: string
  backdrop_path: string
}

export interface CollectionDetails {
  id: number
  name: string
  overview: string
  poster_path: string
  backdrop_path: string
  parts: Movie[]
}

export interface MovieDetails extends Movie {
  genres: Genre[]
  runtime: number
  budget: number
  revenue: number
  status: string
  tagline: string
  production_companies: ProductionCompany[]
  spoken_languages: { english_name: string; iso_639_1: string; name: string }[]
  belongs_to_collection: {
    id: number
    name: string
    poster_path: string
    backdrop_path: string
  } | null
  release_dates?: ReleaseDatesResponse
  homepage: string | null
}

export interface TVShowDetails extends TVShow {
  genres: Genre[]
  number_of_seasons: number
  number_of_episodes: number
  episode_run_time: number[]
  status: string
  type: string
  tagline: string
  production_companies: ProductionCompany[]
  seasons: Season[]
  created_by: { id: number; name: string; profile_path: string | null }[]
  networks: { id: number; name: string; logo_path: string | null }[]
  content_ratings?: ContentRatingsResponse
  homepage: string | null
}

export interface Season {
  id: number
  name: string
  overview: string
  poster_path: string | null
  season_number: number
  episode_count: number
  air_date: string
}

export interface Episode {
  id: number
  name: string
  overview: string
  still_path: string | null
  episode_number: number
  season_number: number
  air_date: string
  vote_average: number
  vote_count: number
  runtime: number
}

export interface Video {
  id: string
  key: string
  name: string
  site: string
  size: number
  type: string
  official: boolean
  published_at: string
}

export interface Cast {
  id: number
  name: string
  character: string
  profile_path: string | null
  order: number
}

export interface Crew {
  id: number
  name: string
  job: string
  department: string
  profile_path: string | null
}

export interface Credits {
  cast: Cast[]
  crew: Crew[]
}

export interface TMDBResponse<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

export interface Person {
  id: number
  name: string
  profile_path: string | null
  known_for_department: string
  popularity: number
}

export interface PersonDetails extends Person {
  biography: string
  birthday: string | null
  deathday: string | null
  place_of_birth: string | null
  also_known_as: string[]
  gender: number
  homepage: string | null
}

export interface PersonMovieCredits {
  cast: (Movie & { character: string; credit_id: string })[]
  crew: (Movie & { job: string; department: string; credit_id: string })[]
}

export interface PersonTVCredits {
  cast: (TVShow & { character: string; credit_id: string; episode_count: number })[]
  crew: (TVShow & { job: string; department: string; credit_id: string; episode_count: number })[]
}

export interface Keyword {
  id: number
  name: string
}

export interface KeywordsResponse {
  keywords: Keyword[]
}


export interface CompanyDetails {
  id: number
  name: string
  description: string
  logo_path: string | null
  headquarters: string
  homepage: string
  origin_country: string
}

export interface ContentRating {
  iso_3166_1: string
  rating: string
}

export interface ContentRatingsResponse {
  results: ContentRating[]
  id: number
}

export interface ReleaseDate {
  certification: string
  iso_639_1: string
  note: string
  release_date: string
  type: number
}

export interface ReleaseDatesResult {
  iso_3166_1: string
  release_dates: ReleaseDate[]
}

export interface ReleaseDatesResponse {
  id: number
  results: ReleaseDatesResult[]
}

