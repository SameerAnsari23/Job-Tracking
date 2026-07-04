const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31536000],
  ['month', 2592000],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
];

/**
 * Preformatted relative time for ActivityFeed/NotificationItem, both of
 * which deliberately do no date computation themselves (Phase 16.3/16.4).
 * Shared here so RecentActivityWidget and NotificationSummaryWidget don't
 * each reimplement the same math (Phase 18.2 "no duplicated dashboard
 * logic").
 */
export function formatRelativeTime(iso: string): string {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  for (const [unit, secondsInUnit] of UNITS) {
    const value = Math.floor(seconds / secondsInUnit);
    if (value >= 1) return rtf.format(-value, unit);
  }
  return 'just now';
}
