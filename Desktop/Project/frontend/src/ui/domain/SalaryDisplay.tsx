import { Typography } from '../foundation/Typography';

export type SalaryPeriod = 'ANNUAL' | 'MONTHLY' | 'HOURLY';

export interface Compensation {
  min: number | null;
  max: number | null;
  currency: string;
  period: SalaryPeriod;
}

export interface SalaryDisplayProps {
  compensation: Compensation | null;
  /** compact: "$180k–$220k / yr" · full: "$180,000–$220,000 ANNUAL". */
  format?: 'compact' | 'full';
  /** BCP-47 locale — every number/currency symbol is Intl-formatted, never hardcoded. */
  locale?: string;
}

const PERIOD_SUFFIX_COMPACT: Record<SalaryPeriod, string> = {
  ANNUAL: '/ yr',
  MONTHLY: '/ mo',
  HOURLY: '/ hr',
};

function formatAmount(value: number, currency: string, locale: string, compact: boolean): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: compact ? 'compact' : 'standard',
    // Always whole units — "$150K", never "$150.0K" (Phase 16.2 convention).
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Compensation formatter (Phase 16.4) — presentation-only money formatting
 * via `Intl.NumberFormat`, so currency symbol, digit grouping, and compact
 * notation ("$180K", "180 000 $CA", "¥18万" …) all come from the platform's
 * locale data rather than a hardcoded currency-symbol table. Renders
 * nothing for null/fully-undisclosed compensation — never "N/A".
 */
export function SalaryDisplay({
  compensation,
  format = 'compact',
  locale = 'en-US',
}: SalaryDisplayProps) {
  if (!compensation || (compensation.min == null && compensation.max == null)) return null;

  const { min, max, currency, period } = compensation;
  const compact = format === 'compact';
  const fmt = (n: number) => formatAmount(n, currency, locale, compact);

  let text: string;
  if (min != null && max != null) {
    text = `${fmt(min)}–${fmt(max)}`;
  } else if (min != null) {
    text = `From ${fmt(min)}`;
  } else {
    text = `Up to ${fmt(max!)}`;
  }

  const suffix = compact ? ` ${PERIOD_SUFFIX_COMPACT[period]}` : ` ${period}`;

  return (
    <Typography variant="textSm" tabularNums as="data">
      {text}
      {suffix}
    </Typography>
  );
}
