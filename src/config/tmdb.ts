export const TMDB_CONFIG = {
  API_KEY: import.meta.env.VITE_TMDB_API_KEY || '',
  BASE_URL: 'https://api.themoviedb.org/3',
  IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
  IMAGE_SIZES: {
    POSTER: {
      SMALL: 'w185',
      MEDIUM: 'w342',
      LARGE: 'w500',
      ORIGINAL: 'original',
    },
    BACKDROP: {
      SMALL: 'w300',
      MEDIUM: 'w780',
      LARGE: 'w1280',
      ORIGINAL: 'original',
    },
    PROFILE: {
      SMALL: 'w45',
      MEDIUM: 'w185',
      LARGE: 'h632',
      ORIGINAL: 'original',
    },
  },
}

export const VIDSRC_CONFIG = {
  BASE_URL: 'https://vidsrc.to/embed',
}

