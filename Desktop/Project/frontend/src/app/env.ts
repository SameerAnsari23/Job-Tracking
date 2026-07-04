import { z } from 'zod';

/**
 * Validated environment — the ONLY module allowed to read import.meta.env
 * (enforced by lint). Mirrors the backend's fail-fast Zod config pattern:
 * an invalid environment stops the app before any UI renders.
 */
const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url('VITE_API_BASE_URL must be a valid URL'),
  VITE_ENV_NAME: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  VITE_ENABLE_DEVTOOLS: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  VITE_SENTRY_DSN: z.string().optional(),
  VITE_FLAGS: z.string().optional(),
});

function fail(issues: z.ZodError): never {
  const lines = issues.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n');
  const message = `Environment validation failed:\n${lines}\n\nCopy .env.example to .env.development and fill in the required values.`;

  // Render a dependency-free error screen — no providers exist yet.
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML =
      '<div style="font-family:system-ui,sans-serif;padding:48px;max-width:640px;margin:0 auto;">' +
      '<h1 style="font-size:20px;color:#B91C1C;">Configuration error</h1>' +
      `<pre style="background:#FFF0F0;border:1px solid #FDA5A5;border-radius:8px;padding:16px;white-space:pre-wrap;font-size:13px;">${lines}</pre>` +
      '<p style="color:#6B6B88;font-size:14px;">Copy <code>.env.example</code> to <code>.env.development</code> and fill in the required values.</p>' +
      '</div>';
  }
  throw new Error(message);
}

const parsed = envSchema.safeParse(import.meta.env);
if (!parsed.success) fail(parsed.error);

const raw = parsed.data;

export const env = {
  apiBaseUrl: raw.VITE_API_BASE_URL,
  envName: raw.VITE_ENV_NAME,
  // Devtools are always disabled in production builds regardless of the flag.
  enableDevtools: raw.VITE_ENABLE_DEVTOOLS && import.meta.env.DEV,
  sentryDsn: raw.VITE_SENTRY_DSN ?? null,
  flagOverrides: (raw.VITE_FLAGS ?? '')
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean),
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;

export type Env = typeof env;
