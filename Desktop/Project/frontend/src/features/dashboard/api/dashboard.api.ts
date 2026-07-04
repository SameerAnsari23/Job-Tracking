import { apiClient } from '@/api/client';
import type {
  ProfileSummary,
  DiscoverySummary,
  JobsPage,
  NotificationSummary,
} from '../types/dashboard.types';

interface Envelope<T> {
  success: true;
  data: T;
}

// ─── Raw backend shapes (only the fields this feature reads) ─────────────────

interface RawProfile {
  headline: string | null;
  skills: readonly { name: string }[];
  experience: readonly { id: string }[];
  resumeMetadata: { filename: string } | null;
  jobSearchPreferences: { targetTitles: readonly string[] };
  completionScore: number;
}

interface RawDiscoveryProfile {
  id: string;
  label: string;
  isActive: boolean;
  watchedCompanies: readonly unknown[];
}

interface RawDiscovery {
  isActive: boolean;
  profiles: readonly RawDiscoveryProfile[];
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

interface RawNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

/**
 * Dashboard's read-only API surface (Phase 18.2) — every call hits an
 * existing, confirmed backend endpoint. No endpoint here was invented:
 * there is no dashboard-statistics or activity-feed endpoint on the
 * backend, so this feature derives KPIs/activity from the same list
 * endpoints the rest of the app will eventually use, never from a
 * fabricated aggregate.
 */
export const dashboardApi = {
  async getProfileSummary(): Promise<ProfileSummary> {
    const { data } = await apiClient.get<Envelope<RawProfile>>('/profile/me');
    return {
      headline: data.data.headline,
      skills: data.data.skills,
      experience: data.data.experience,
      resumeMetadata: data.data.resumeMetadata,
      jobSearchPreferences: data.data.jobSearchPreferences,
      completionScore: data.data.completionScore,
    };
  },

  async getDiscoverySummary(): Promise<DiscoverySummary> {
    const { data } = await apiClient.get<Envelope<RawDiscovery>>('/discovery');
    return {
      isActive: data.data.isActive,
      profiles: data.data.profiles.map((p) => ({
        id: p.id,
        label: p.label,
        isActive: p.isActive,
        watchedCompanyCount: p.watchedCompanies.length,
      })),
    };
  },

  async getRecentJobMatches(limit = 5): Promise<JobsPage> {
    const { data } = await apiClient.get<Envelope<RawJobsPage>>('/jobs/recommendations', {
      params: { limit, sort: 'newest' },
    });
    return {
      items: data.data.items.map((j) => ({
        jobId: j.jobId,
        title: j.title,
        companyName: j.companyName,
        publishedAt: j.publishedAt,
      })),
      hasMore: data.data.hasMore,
    };
  },

  async getSavedJobsPage(limit = 50): Promise<JobsPage> {
    const { data } = await apiClient.get<Envelope<RawJobsPage>>('/jobs/saved', {
      params: { limit },
    });
    return {
      items: data.data.items.map((j) => ({
        jobId: j.jobId,
        title: j.title,
        companyName: j.companyName,
        publishedAt: j.publishedAt,
      })),
      hasMore: data.data.hasMore,
    };
  },

  async getNotifications(): Promise<NotificationSummary[]> {
    const { data } = await apiClient.get<Envelope<{ items: readonly RawNotification[] }>>(
      '/notifications',
    );
    return data.data.items.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      isRead: n.isRead,
      createdAt: n.createdAt,
    }));
  },
};
