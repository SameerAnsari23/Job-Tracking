/**
 * Wire-level DTOs (Phase 18.2), mirrored from the confirmed backend
 * contracts. Each interface only carries the fields the Dashboard actually
 * consumes — these are intentionally partial views of larger backend
 * responses (e.g. UserProfileDto has many more fields; the full shape
 * belongs to the future Profile feature, not this one).
 */

// ─── GET /profile/me ──────────────────────────────────────────────────────────

export interface ProfileSummary {
  headline: string | null;
  skills: readonly { name: string }[];
  experience: readonly { id: string }[];
  resumeMetadata: { filename: string } | null;
  jobSearchPreferences: { targetTitles: readonly string[] };
  completionScore: number;
}

// ─── GET /discovery ───────────────────────────────────────────────────────────

export interface DiscoveryProfileSummary {
  id: string;
  label: string;
  isActive: boolean;
  watchedCompanyCount: number;
}

export interface DiscoverySummary {
  isActive: boolean;
  profiles: readonly DiscoveryProfileSummary[];
}

// ─── GET /jobs/recommendations, GET /jobs/saved ───────────────────────────────

export interface JobMatchSummary {
  jobId: string;
  title: string;
  companyName: string;
  publishedAt: string;
}

export interface JobsPage {
  items: readonly JobMatchSummary[];
  hasMore: boolean;
}

// ─── GET /notifications ───────────────────────────────────────────────────────

export interface NotificationSummary {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
