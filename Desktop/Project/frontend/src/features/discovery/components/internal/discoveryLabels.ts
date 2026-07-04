import type {
  NotificationFrequency,
  DiscoveryPriority,
  RemotePreference,
} from '../../types/discovery.types';

/**
 * Display-string mappings shared by every widget that renders these enums
 * (DiscoveryProfilesWidget, AutomationSummaryWidget, ScheduleSummaryWidget)
 * — kept in one place so none of them drift out of sync (Phase 18.3 "no
 * duplicated discovery logic").
 */
export const FREQUENCY_LABEL: Record<NotificationFrequency, string> = {
  REALTIME: 'Real-time alerts',
  DAILY: 'Daily digest',
  WEEKLY: 'Weekly digest',
};

export const PRIORITY_LABEL: Record<DiscoveryPriority, string> = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

export const REMOTE_PREFERENCE_LABEL: Record<RemotePreference, string> = {
  ONSITE: 'On-site',
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
  ANY: 'Any',
};
