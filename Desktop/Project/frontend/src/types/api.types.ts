/** One field-level validation failure, mirroring the backend's Zod error shape. */
export interface ApiErrorDetail {
  field: string;
  message: string;
}

/**
 * Normalized API error — every Axios failure is mapped to this shape by the
 * response interceptor before reaching feature code (Phase 16.5 §4.2).
 * Downstream handling switches on `code`, never on Axios internals.
 *
 * Mirrors the backend's actual envelope (errorHandler.ts):
 * `{success:false, error:{code, message, details?}}`, where `details` is an
 * array of `{field, message}` pairs, not a Record.
 */
export interface ApiError {
  status: number;
  code: string;
  message: string;
  details: ApiErrorDetail[] | null;
}

/**
 * Cursor-paginated response envelope used by the jobs/recommendations,
 * jobs/saved list endpoints (Phase 18.2 confirmed against
 * JobSearchPageResultDto) — corrected from an earlier, unused Phase 17.0
 * guess: the field is `items`, not `data`.
 */
export interface PaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}
