import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import { typeScale } from '@/theme';
import { Skeleton } from '../foundation/Skeleton';
import { ErrorState } from '../layout/ErrorState';

export interface InfiniteScrollProps {
  /** Fires once when the sentinel enters the viewport (600px lead — Phase 16.3). */
  onReach: () => void;
  loading?: boolean;
  /** No more results — renders `endMessage` and stops observing. */
  end?: boolean;
  endMessage?: ReactNode;
  error?: string | null;
  onRetry?: () => void;
  /** Custom tail skeleton; defaults to 3 rect rows matching a list row. */
  tailSkeleton?: ReactNode;
  children: ReactNode;
}

const DEFAULT_TAIL = (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 2 }}>
    {Array.from({ length: 3 }, (_, i) => (
      <Skeleton key={i} shape="rect" width="100%" height={88} />
    ))}
  </Box>
);

/**
 * Presentation-only infinite-scroll wrapper (Phase 16.4) — fetching is
 * entirely the caller's concern (`onReach` is the only signal this
 * component emits). Sentinel fires via IntersectionObserver with a 600px
 * rootMargin so the next page is requested before the user hits bottom.
 * A single aria-live region announces state changes for screen readers.
 */
export function InfiniteScroll({
  onReach,
  loading = false,
  end = false,
  endMessage = "That's all — try widening your filters.",
  error = null,
  onRetry,
  tailSkeleton,
  children,
}: InfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const onReachRef = useRef(onReach);
  onReachRef.current = onReach;

  useEffect(() => {
    if (end || error) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) onReachRef.current();
      },
      { rootMargin: '600px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [end, error]);

  const announcement = loading ? 'Loading more' : end ? 'All results loaded' : '';

  return (
    <Box>
      {children}

      <Box role="status" aria-live="polite" sx={{ ...typeScale.textSm }}>
        {error ? (
          <ErrorState compact title={error} onRetry={onRetry} />
        ) : loading ? (
          (tailSkeleton ?? DEFAULT_TAIL)
        ) : end ? (
          <Box sx={{ textAlign: 'center', color: 'text.disabled', py: 4 }}>{endMessage}</Box>
        ) : null}
        <Box
          sx={{
            position: 'absolute',
            width: 1,
            height: 1,
            overflow: 'hidden',
            clipPath: 'inset(50%)',
            whiteSpace: 'nowrap',
          }}
        >
          {announcement}
        </Box>
      </Box>

      {!end && !error && <Box ref={sentinelRef} aria-hidden sx={{ height: 1 }} />}
    </Box>
  );
}
