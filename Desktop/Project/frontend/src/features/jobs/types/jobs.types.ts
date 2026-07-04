/**
 * Wire-level DTOs (Phase 18.4), mirrored from the confirmed backend
 * contracts (JobSearchResultDto for list items, JobDetailsDto for the
 * single-job endpoint). The two shapes differ deliberately on the backend
 * (list item key `jobId`/`companyName`/`compensationSummary`; details key
 * `id`/`company`/`compensation` plus `jobDescription`/`skills`) — we
 * normalize them into the two frontend types below.
 */

export type WorkplaceType = 'ONSITE' | 'REMOTE' | 'HYBRID';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE';
export type SortOrder = 'newest' | 'oldest' | 'recentlyUpdated';

/** The three structured search modes — the backend has NO free-text `q` search. */
export type SearchType = 'company' | 'role' | 'skill';

export interface JobLocation {
  city: string | null;
  region: string | null;
  countryCode: string | null;
  isRemote: boolean;
  isHybrid: boolean;
}

export interface JobCompensation {
  min: number | null;
  max: number | null;
  currency: string | null;
  period: string;
}

/** A single job in any list (search / recommendations / saved). */
export interface JobListItem {
  jobId: string;
  title: string;
  companyName: string;
  location: JobLocation;
  workplaceType: string;
  employmentTypes: string[];
  compensationSummary: JobCompensation | null;
  source: string;
  applyUrl: string;
  publishedAt: string;
  lastChangedAt: string | null;
}

/** The richer single-job payload from GET /jobs/:jobId. */
export interface JobDetails {
  id: string;
  title: string;
  company: string;
  location: JobLocation;
  compensation: JobCompensation | null;
  employmentTypes: string[];
  workplaceType: string;
  /** Free-text; requirements live inside this string — the backend has no separate field. */
  jobDescription: string;
  skills: string[];
  applyUrl: string;
  publishedAt: string;
  lastChangedAt: string | null;
  source: string;
}

/** Cursor page — the backend never returns a total count. */
export interface JobsPage {
  items: JobListItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * The full filter/search state, mirrored to the URL (useJobSearchParams).
 * `type` + `query` drive WHICH endpoint is hit: an empty query shows
 * Recommendations; a non-empty query searches by the chosen structured type.
 */
export interface JobFilters {
  workplaceType: WorkplaceType | null;
  employmentTypes: EmploymentType[];
  salaryMin: number | null;
  salaryMax: number | null;
  location: string | null;
  sort: SortOrder | null;
}

export interface JobQueryParams extends JobFilters {
  type: SearchType;
  query: string;
}

/** Server-accepted query params (subset shared by every list endpoint). */
export interface JobListRequestParams extends JobFilters {
  limit: number;
  cursor?: string;
}
