/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_API_PROXY_TARGET?: string
  readonly VITE_PORTAL_BRAND_NAME?: string
  /** Set to "true" to skip portal login/dashboard API calls (dev until backend is ready). */
  readonly VITE_PORTAL_LOGIN_BYPASS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
