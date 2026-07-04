import type { ElementType } from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import {
  accent,
  accentDark,
  semanticLight,
  semanticDark,
  neutralLight,
  neutralDark,
} from '@/theme';
import { Typography } from '../foundation/Typography';
import { Link } from '../foundation/Link';
import { LoadingState } from '../layout/LoadingState';
import { ErrorState } from '../layout/ErrorState';
import { EmptyState } from '../layout/EmptyState';

export type ActivityTone = 'neutral' | 'accent' | 'success' | 'warning' | 'error';

export interface ActivityFeedItem {
  id: string;
  tone?: ActivityTone;
  text: string;
  /** Preformatted relative time — no date computation here. */
  timestamp: string;
  href?: string;
}

export interface ActivityFeedProps {
  items: ActivityFeedItem[];
  /** Caps the visible rows; the rest are reachable only via the footer link. */
  maxItems?: number;
  footerHref?: string;
  footerLabel?: string;
  routerComponent?: ElementType;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyMessage?: string;
}

/**
 * The dashboard activity rail (Phase 16.2/16.3): capped dot+text+timestamp
 * rows with a "View all" footer. Presentation-only — reuses ui/layout's
 * LoadingState/ErrorState/EmptyState for the three async states rather
 * than reimplementing them, and composes cleanly inside
 * ui/navigation's InfiniteScroll when a page needs the uncapped version.
 */
export function ActivityFeed({
  items,
  maxItems = 8,
  footerHref,
  footerLabel = 'View all',
  routerComponent,
  loading = false,
  error = null,
  onRetry,
  emptyMessage = 'No recent activity',
}: ActivityFeedProps) {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const a = dark ? accentDark : accent;
  const s = dark ? semanticDark : semanticLight;
  const n = dark ? neutralDark : neutralLight;

  const toneColor: Record<ActivityTone, string> = {
    neutral: n[400],
    accent: a[500],
    success: s.successText,
    warning: s.warningText,
    error: s.errorText,
  };

  if (loading) return <LoadingState layout="list" count={4} label="Loading activity" />;
  if (error) return <ErrorState compact title={error} onRetry={onRetry} />;
  if (items.length === 0) return <EmptyState icon="clock" title={emptyMessage} />;

  const visible = items.slice(0, maxItems);

  return (
    <Box
      component="ul"
      aria-label="Recent activity"
      sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 3 }}
    >
      {visible.map((item) => (
        <Box
          key={item.id}
          component="li"
          sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}
        >
          <Box
            aria-hidden
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: toneColor[item.tone ?? 'neutral'],
              flexShrink: 0,
              mt: '6px',
            }}
          />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            {item.href ? (
              <Link href={item.href} variant="subtle" routerComponent={routerComponent}>
                <Typography variant="textSm" as="span">
                  {item.text}
                </Typography>
              </Link>
            ) : (
              <Typography variant="textSm">{item.text}</Typography>
            )}
            <Typography variant="textXs" color="secondary">
              {item.timestamp}
            </Typography>
          </Box>
        </Box>
      ))}
      {footerHref && (
        <Box component="li" sx={{ pt: 1 }}>
          <Link href={footerHref} routerComponent={routerComponent}>
            <Typography variant="textSm" color="accent" as="span">
              {footerLabel} →
            </Typography>
          </Link>
        </Box>
      )}
    </Box>
  );
}
