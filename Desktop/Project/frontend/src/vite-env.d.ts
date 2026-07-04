/// <reference types="vite/client" />

// CSS-only package entry (self-hosted Inter) — no type declarations shipped.
declare module '@fontsource-variable/inter';

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_ENV_NAME?: string;
  readonly VITE_ENABLE_DEVTOOLS?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_FLAGS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
