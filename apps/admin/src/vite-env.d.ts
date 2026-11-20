/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_USE_MOCKS: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
  readonly VITE_STOREFRONT_URL: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
