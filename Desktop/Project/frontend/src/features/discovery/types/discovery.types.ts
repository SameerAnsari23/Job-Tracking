/**
 * Wire-level DTOs (Phase 18.3), mirrored from the confirmed backend
 * contract (DiscoveryPreferencesDto / DiscoveryProfileDto). Unlike
 * Dashboard's trimmed summary view, Discovery is the feature that owns
 * this data, so these carry every field the page actually renders.
 */

export type RemotePreference = 'ONSITE' | 'REMOTE' | 'HYBRID' | 'ANY';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE';
export type NotificationFrequency = 'REALTIME' | 'DAILY' | 'WEEKLY';
export type DiscoveryPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface WatchedCompany {
  name: string;
  normalizedName: string;
  domain: string | null;
}

export interface DiscoveryProfile {
  id: string;
  label: string;
  watchedCompanies: readonly WatchedCompany[];
  notificationFrequency: NotificationFrequency;
  priority: DiscoveryPriority;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GlobalDiscoverySettings {
  defaultRemotePreference: RemotePreference;
  defaultNotificationFrequency: NotificationFrequency;
  defaultPriority: DiscoveryPriority;
}

export interface DiscoveryPreferences {
  userId: string;
  isActive: boolean;
  globalSettings: GlobalDiscoverySettings;
  profiles: readonly DiscoveryProfile[];
  createdAt: string;
  updatedAt: string;
}

// ─── GET /jobs/recommendations (Discovery Activity — see discovery.api.ts) ────

export interface DiscoveryMatch {
  jobId: string;
  title: string;
  companyName: string;
  publishedAt: string;
}
