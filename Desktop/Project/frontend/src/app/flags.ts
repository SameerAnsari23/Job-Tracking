import { env } from './env';

/**
 * Build-time feature flag registry (Phase 16.5 §4.1).
 *
 * Every flag corresponds to a Phase 16.3 future-ready scaffold — features the
 * backend does not yet expose. All default OFF. Flagged-off routes are
 * excluded from the route tree entirely (no dead chunks shipped).
 *
 * Local override for development: VITE_FLAGS=adminArea,passwordReset
 */
const FLAG_DEFAULTS = {
  socialLogin: false,
  passwordReset: false,
  notInterested: false,
  bulkNotificationSelect: false,
  certificates: false,
  achievements: false,
  profileAnalytics: false,
  integrations: false,
  securitySettings: false,
  adminLiveMetrics: false,
  adminLogs: false,
  adminArea: false,
} as const;

export type FeatureFlag = keyof typeof FLAG_DEFAULTS;

export function isEnabled(flag: FeatureFlag): boolean {
  if (env.isDev && env.flagOverrides.includes(flag)) return true;
  return FLAG_DEFAULTS[flag];
}
