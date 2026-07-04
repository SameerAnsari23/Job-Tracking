export { Table } from './Table';
export type { TableProps } from './Table';
export { VirtualTable } from './VirtualTable';
export type { VirtualTableProps, VirtualTableHandle } from './VirtualTable';
export { DataGrid } from './DataGrid';
export type { DataGridProps } from './DataGrid';
export type { TableColumn, SortDirection, TableStateProps } from './internal/tableTypes';

export { StatisticCard } from './StatisticCard';
export type { StatisticCardProps } from './StatisticCard';
export { ChartCard } from './ChartCard';
export type { ChartCardProps, ChartLegendItem } from './ChartCard';

export { Timeline } from './Timeline';
export type { TimelineProps, TimelineItem, TimelineTone } from './Timeline';
export { ActivityFeed } from './ActivityFeed';
export type { ActivityFeedProps, ActivityFeedItem, ActivityTone } from './ActivityFeed';
export { NotificationItem } from './NotificationItem';
export type { NotificationItemProps, NotificationData } from './NotificationItem';

export { JobCard } from './JobCard';
// Note: JobCard's own WorkplaceType is intentionally NOT re-exported here —
// domain/WorkplaceBadge.tsx now owns the canonical public export of that
// type (added in Phase 17.7) to avoid a duplicate-name collision at the
// @/ui barrel. JobCard's local definition is unchanged (data-display must
// not import from domain — see JobCard.tsx's tier-direction note).
export type { JobCardProps, JobCardData, JobCardVariant, JobCompensation } from './JobCard';
export { CompanyCard } from './CompanyCard';
export type { CompanyCardProps, HiringStatus } from './CompanyCard';
export { ProfileCard } from './ProfileCard';
export type { ProfileCardProps, ProfileCardBadge } from './ProfileCard';
export { DiscoveryCard } from './DiscoveryCard';
export type { DiscoveryCardProps, DiscoveryPriority } from './DiscoveryCard';

export { Metric } from './Metric';
export type { MetricProps, MetricLayout, MetricTrend } from './Metric';
export { KeyValue } from './KeyValue';
export type { KeyValueProps, KeyValuePair } from './KeyValue';
