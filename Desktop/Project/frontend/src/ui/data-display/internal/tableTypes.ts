import type { ReactNode } from 'react';

export interface TableColumn<T> {
  key: string;
  header: string;
  align?: 'left' | 'right' | 'center';
  width?: number | string;
  /** Right-aligns and applies tabular-nums automatically. */
  numeric?: boolean;
  sortable?: boolean;
  render?: (row: T) => ReactNode;
}

export type SortDirection = 'asc' | 'desc';

/** Shared by Table, VirtualTable, and DataGrid (same tier — internal reuse). */
export interface TableStateProps<T> {
  columns: TableColumn<T>[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selectedKeys?: ReadonlySet<string>;
  onSelectionChange?: (keys: ReadonlySet<string>) => void;
  sortKey?: string;
  sortDirection?: SortDirection;
  onSortChange?: (key: string) => void;
  density?: 'compact' | 'comfortable';
  rowActions?: (row: T) => ReactNode;
}
