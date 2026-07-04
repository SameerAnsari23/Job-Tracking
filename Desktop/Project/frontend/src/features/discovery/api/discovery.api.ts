import { apiClient } from '@/api/client';
import type { DiscoveryPreferences, DiscoveryMatch } from '../types/discovery.types';

interface Envelope<T> {
  success: true;
  data: T;
}

interface RawWatchedCompany {
  name: string;
  normalizedName: string;
  domain: string | null;
}

interface RawProfile {
  id: string;
  label: string;
  watchedCompanies: readonly RawWatchedCompany[];
  notificationFrequency: DiscoveryPreferences['globalSettings']['defaultNotificationFrequency'];
  priority: DiscoveryPreferences['globalSettings']['defaultPriority'];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RawPreferences {
  userId: string;
  isActive: boolean;
  globalSettings: DiscoveryPreferences['globalSettings'];
  profiles: readonly RawProfile[];
  createdAt: string;
  updatedAt: string;
}

interface RawJob {
  jobId: string;
  title: string;
  companyName: string;
  publishedAt: string;
}

interface RawJobsPage {
  items: readonly RawJob[];
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * Discovery's API surface (Phase 18.3) — every call hits an existing,
 * confirmed backend endpoint (/discovery, /jobs/recommendations). No
 * execution-log, schedule, or automation-telemetry endpoint exists on the
 * backend (confirmed by reading the ingestion/matching modules directly) —
 * "Discovery Activity" is honestly the job-recommendations feed (matches
 * surfaced BY discovery), not a fabricated audit log.
 */
export const discoveryApi = {
  async getPreferences(): Promise<DiscoveryPreferences> {
    const { data } = await apiClient.get<Envelope<RawPreferences>>('/discovery');
    return {
      userId: data.data.userId,
      isActive: data.data.isActive,
      globalSettings: data.data.globalSettings,
      profiles: data.data.profiles.map((p) => ({
        id: p.id,
        label: p.label,
        watchedCompanies: p.watchedCompanies,
        notificationFrequency: p.notificationFrequency,
        priority: p.priority,
        isActive: p.isActive,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      createdAt: data.data.createdAt,
      updatedAt: data.data.updatedAt,
    };
  },

  async pauseProfile(profileId: string): Promise<void> {
    await apiClient.post(`/discovery/profiles/${profileId}/pause`);
  },

  async resumeProfile(profileId: string): Promise<void> {
    await apiClient.post(`/discovery/profiles/${profileId}/resume`);
  },

  async deleteProfile(profileId: string): Promise<void> {
    await apiClient.delete(`/discovery/profiles/${profileId}`);
  },

  async activate(): Promise<void> {
    await apiClient.post('/discovery/activate');
  },

  async deactivate(): Promise<void> {
    await apiClient.post('/discovery/deactivate');
  },

  async getRecentMatches(limit = 5): Promise<DiscoveryMatch[]> {
    const { data } = await apiClient.get<Envelope<RawJobsPage>>('/jobs/recommendations', {
      params: { limit, sort: 'newest' },
    });
    return data.data.items.map((j) => ({
      jobId: j.jobId,
      title: j.title,
      companyName: j.companyName,
      publishedAt: j.publishedAt,
    }));
  },
};
