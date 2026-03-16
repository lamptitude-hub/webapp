export const APP_MODE = process.env.NODE_ENV
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'project_lamptitude'
export const APP_WEB_TITLE = process.env.NEXT_PUBLIC_WEB_TITLE || 'Lamptitude'
export const APP_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'
export const API_GATEWAY = process.env.NEXT_PUBLIC_API_GATEWAY || 'http://localhost:3030'
export const WS_GATEWAY = process.env.WS_GATEWAY || 'ws://127.0.0.1:5050'

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'project-url'
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'anon-key'

export const isBrowser = typeof window !== 'undefined'
export const isProduction = APP_MODE === 'production'
export const isDevelop = APP_MODE === 'development'

// STORAGE KEY-NAME
export const APP_LANG = 'APP.Language__' + APP_NAME
export const APP_THEME = 'APP.Theme__' + APP_NAME
export const APP_AUTH_ACCESS = 'APP.AccessToken__' + APP_NAME
export const APP_AUTH_REFRESH = 'APP.RefreshKey__' + APP_NAME
export const APP_USER_INFO = 'APP.UserInfo__' + APP_NAME
export const APP_DATASET = 'APP.Dataset__' + APP_NAME

// REQUEST HEADERS
export const AUTHORIZATION = 'Authorization'
export const ACCEPT_RANGES = 'Accept-Ranges'
export const CONTENT_LANG = 'Content-Language'
export const CONTENT_LENGTH = 'Content-Length'
export const CONTENT_RANGE = 'Content-Range'
export const CONTENT_TYPE = 'Content-Type'
