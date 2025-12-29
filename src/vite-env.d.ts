/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_TMDB_API_KEY: string
  readonly VITE_SPORTS_API_URL?: string
  readonly VITE_APP_NAME?: string
  readonly VITE_LOGO_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

