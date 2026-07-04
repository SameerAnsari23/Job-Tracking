import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import { Table } from './Table';
import type { TableProps } from './Table';

export interface DataGridProps<T> extends TableProps<T> {
  toolbar?: ReactNode;
  filters?: ReactNode;
  /**
   * Rendered where the page's own Pagination (ui/navigation) goes.
   * DataGrid accepts it as a slot rather than importing Pagination
   * directly — data-display and navigation are sibling tiers.
   */
  pagination?: ReactNode;
  /** Shown instead of `toolbar` whenever at least one row is selected. */
  bulkActions?: ReactNode;
}

/**
 * Table + surrounding chrome (Phase 16.4): toolbar/filters above, pagination
 * below, a bulk-actions bar that replaces the toolbar during selection.
 * Composes Table verbatim for the grid itself — DataGrid adds no row/cell
 * rendering of its own, only the slots around it.
 */
export function DataGrid<T>({
  toolbar,
  filters,
  pagination,
  bulkActions,
  ...tableProps
}: DataGridProps<T>) {
  const hasSelection = (tableProps.selectedKeys?.size ?? 0) > 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {(toolbar || bulkActions) && (
        <Box
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3 }}
        >
          {hasSelection && bulkActions ? bulkActions : toolbar}
        </Box>
      )}
      {filters && <Box>{filters}</Box>}
      <Table {...tableProps} />
      {pagination && <Box>{pagination}</Box>}
    </Box>
  );
}
