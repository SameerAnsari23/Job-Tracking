import { apiClient } from '@/api/client';
import type { JobsPage, JobDetails, JobListRequestParams, SearchType } from '../types/jobs.types';

interface Envelope<T> {
  success: true;
  data: T;
}

interface RawListItem {
  jobId: string;
  title: string;
  companyName: string;
  location: JobsPage['items'][number]['location'];
  workplaceType: string;
  employmentTypes: string[];
  compensationSummary: JobsPage['items'][number]['compensationSummary'];
  source: string;
  applyUrl: string;
  publishedAt: string;
  lastChangedAt: string | null;
}

interface RawPage {
  items: RawListItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * Serializes only the params the backend actually accepts, dropping empties
 * so the URL/query stays clean and cache keys don't churn on `null`s.
 */
function toQuery(params: JobListRequestParams): Record<string, unknown> {
  const q: Record<string, unknown> = { limit: params.limit };
  if (params.cursor) q.cursor = params.cursor;
  if (params.workplaceType) q.workplaceType = params.workplaceType;
  if (params.employmentTypes.length > 0) q.employmentTypes = params.employmentTypes;
  if (params.salaryMin != null) q.salaryMin = params.salaryMin;
  if (params.salaryMax != null) q.salaryMax = params.salaryMax;
  if (params.location) q.location = params.location;
  if (params.sort) q.sort = params.sort;
  return q;
}

function toPage(raw: RawPage): JobsPage {
  return {
    items: raw.items.map((i) => ({
      jobId: i.jobId,
      title: i.title,
      companyName: i.companyName,
      location: i.location,
      workplaceType: i.workplaceType,
      employmentTypes: i.employmentTypes,
      compensationSummary: i.compensationSummary,
      source: i.source,
      applyUrl: i.applyUrl,
      publishedAt: i.publishedAt,
      lastChangedAt: i.lastChangedAt,
    })),
    nextCursor: raw.nextCursor,
    hasMore: raw.hasMore,
  };
}

const SEARCH_PATH: Record<SearchType, string> = {
  company: '/jobs/company',
  role: '/jobs/role',
  skill: '/jobs/skill',
};

/**
 * Jobs API surface (Phase 18.4). Every fetcher accepts a TanStack Query
 * `AbortSignal` so that a filter/search change cancels the in-flight
 * request instead of racing it (the "cancel stale requests" requirement).
 */
export const jobsApi = {
  /** Structured search — company / role / skill (there is no free-text search endpoint). */
  async search(
    type: SearchType,
    value: string,
    params: JobListRequestParams,
    signal?: AbortSignal,
  ): Promise<JobsPage> {
    const { data } = await apiClient.get<Envelope<RawPage>>(
      `${SEARCH_PATH[type]}/${encodeURIComponent(value)}`,
      { params: toQuery(params), signal },
    );
    return toPage(data.data);
  },

  async recommendations(params: JobListRequestParams, signal?: AbortSignal): Promise<JobsPage> {
    const { data } = await apiClient.get<Envelope<RawPage>>('/jobs/recommendations', {
      params: toQuery(params),
      signal,
    });
    return toPage(data.data);
  },

  async saved(params: JobListRequestParams, signal?: AbortSignal): Promise<JobsPage> {
    const { data } = await apiClient.get<Envelope<RawPage>>('/jobs/saved', {
      params: toQuery(params),
      signal,
    });
    return toPage(data.data);
  },

  async getById(jobId: string, signal?: AbortSignal): Promise<JobDetails> {
    const { data } = await apiClient.get<Envelope<JobDetails>>(`/jobs/${jobId}`, { signal });
    return data.data;
  },

  /** Backend returns 201 { success: true } with no body — nothing to return. */
  async save(jobId: string): Promise<void> {
    await apiClient.post(`/jobs/${jobId}/save`);
  },

  /** Backend returns 204 with an empty body. */
  async unsave(jobId: string): Promise<void> {
    await apiClient.delete(`/jobs/${jobId}/save`);
  },
};
