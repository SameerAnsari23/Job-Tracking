import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { radius, typeScale } from '@/theme';
import { Icon } from '../foundation/Icon';
import { Button } from '../foundation/Button';
import { Select } from '../forms/Select';

export interface PaginationProps {
  /**
   * 'numbered' — classic page-number control for TRUE offset-paginated
   * data (admin tables only; the backend's job/notification lists are
   * cursor-based, so features there use 'loadMore', never this mode —
   * Phase 16.4 deliberately excluded numbered pagination for cursor data
   * because page numbers would lie about a stable total).
   * 'loadMore' — manual "Load more" trigger for cursor-aware lists.
   */
  mode?: 'numbered' | 'loadMore';

  // ── numbered mode ──────────────────────────────────────────────────────
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;

  // ── loadMore mode ──────────────────────────────────────────────────────
  hasMore?: boolean;
  onLoadMore?: () => void;
  loading?: boolean;
  endMessage?: string;
}

function pageWindow(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const result: (number | 'ellipsis')[] = [];
  sorted.forEach((page, i) => {
    if (i > 0 && page - (sorted[i - 1] as number) > 1) result.push('ellipsis');
    result.push(page);
  });
  return result;
}

/**
 * Pagination control (Phase 17.5). The load-more mode is what job/saved/
 * notification lists actually use; the numbered mode exists as a complete,
 * general-purpose primitive for any future true offset-paginated table —
 * it is presentation-only (fires callbacks; never assumes cursor vs offset
 * data itself), so offering both modes here doesn't reintroduce the
 * cursor-vs-numbered conflict the architecture already resolved.
 */
export function Pagination({
  mode = 'loadMore',
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  hasMore = false,
  onLoadMore,
  loading = false,
  endMessage = "That's everything.",
}: PaginationProps) {
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down('sm'));

  if (mode === 'loadMore') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        {hasMore ? (
          <Button variant="secondary" loading={loading} onClick={onLoadMore}>
            Load more
          </Button>
        ) : (
          <Box sx={{ ...typeScale.textSm, color: theme.palette.text.disabled }}>{endMessage}</Box>
        )}
      </Box>
    );
  }

  const goTo = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) onPageChange?.(page);
  };

  return (
    <Box
      component="nav"
      aria-label="Pagination"
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <ButtonBase
          aria-label="Previous page"
          disabled={currentPage <= 1}
          onClick={() => goTo(currentPage - 1)}
          sx={{
            width: 32,
            height: 32,
            borderRadius: `${radius.md}px`,
            color: theme.palette.text.secondary,
            '&:disabled': { opacity: 0.4 },
            '&:hover:not(:disabled)': { backgroundColor: 'action.hover' },
          }}
        >
          <Icon name="chevronLeft" size={16} />
        </ButtonBase>

        {compact ? (
          <Box
            sx={{ ...typeScale.textSm, color: theme.palette.text.secondary, px: 2 }}
            aria-live="polite"
          >
            Page {currentPage} of {totalPages}
          </Box>
        ) : (
          pageWindow(currentPage, totalPages).map((page, i) =>
            page === 'ellipsis' ? (
              <Box
                key={`e-${i}`}
                aria-hidden
                sx={{ ...typeScale.textSm, color: theme.palette.text.disabled, px: 1 }}
              >
                …
              </Box>
            ) : (
              <ButtonBase
                key={page}
                aria-label={`Page ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
                onClick={() => goTo(page)}
                sx={{
                  minWidth: 32,
                  height: 32,
                  px: 2,
                  borderRadius: `${radius.md}px`,
                  ...typeScale.textSm,
                  fontVariantNumeric: 'tabular-nums',
                  fontWeight: page === currentPage ? 600 : 400,
                  color:
                    page === currentPage
                      ? theme.palette.primary.contrastText
                      : theme.palette.text.secondary,
                  backgroundColor: page === currentPage ? 'primary.main' : 'transparent',
                  '&:hover': {
                    backgroundColor: page === currentPage ? 'primary.main' : 'action.hover',
                  },
                }}
              >
                {page}
              </ButtonBase>
            ),
          )
        )}

        <ButtonBase
          aria-label="Next page"
          disabled={currentPage >= totalPages}
          onClick={() => goTo(currentPage + 1)}
          sx={{
            width: 32,
            height: 32,
            borderRadius: `${radius.md}px`,
            color: theme.palette.text.secondary,
            '&:disabled': { opacity: 0.4 },
            '&:hover:not(:disabled)': { backgroundColor: 'action.hover' },
          }}
        >
          <Icon name="chevronRight" size={16} />
        </ButtonBase>
      </Box>

      {pageSize !== undefined && pageSizeOptions && onPageSizeChange && !compact && (
        <Box sx={{ width: 140 }}>
          <Select
            label="Rows per page"
            hiddenLabel
            size="sm"
            value={String(pageSize)}
            onChange={(v) => onPageSizeChange(Number(v))}
            options={pageSizeOptions.map((n) => ({ value: String(n), label: `${n} / page` }))}
          />
        </Box>
      )}
    </Box>
  );
}
