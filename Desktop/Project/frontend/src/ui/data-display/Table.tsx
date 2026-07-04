import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { Skeleton } from '../foundation/Skeleton';
import { EmptyState } from '../layout/EmptyState';
import { TableHeaderCells } from './internal/TableHeaderCells';
import { TableRowCells } from './internal/TableRowCells';
import type { TableStateProps } from './internal/tableTypes';

export interface TableProps<T> extends TableStateProps<T> {
  rows: T[];
  loading?: boolean;
  loadingRowCount?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  stickyHeader?: boolean;
  /** Accessible name for the table (not visually rendered). */
  caption?: string;
}

/**
 * Non-virtualized table (Phase 16.4): admin/settings-scale lists (≤~100
 * rows). Real `<table>` semantics throughout, sticky header, sortable UI
 * (fires onSortChange — comparison logic is the caller's), row selection,
 * hover-revealed row actions (always visible on touch via the media query
 * below), horizontal scroll wrapper for narrow viewports. Presentation
 * only — no client-side sorting/filtering happens here.
 */
export function Table<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  selectable = false,
  selectedKeys,
  onSelectionChange,
  sortKey,
  sortDirection,
  onSortChange,
  density = 'comfortable',
  rowActions,
  loading = false,
  loadingRowCount = 5,
  emptyTitle = 'No results',
  emptyDescription,
  stickyHeader = true,
  caption,
}: TableProps<T>) {
  const theme = useTheme();
  const compact = density === 'compact';
  const selected = selectedKeys ?? new Set<string>();

  const toggleAll = () => {
    if (!onSelectionChange) return;
    const allKeys = rows.map(rowKey);
    const allSelected = allKeys.length > 0 && allKeys.every((k) => selected.has(k));
    onSelectionChange(allSelected ? new Set() : new Set(allKeys));
  };

  const toggleOne = (key: string) => {
    if (!onSelectionChange) return;
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onSelectionChange(next);
  };

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(rowKey(r)));
  const someSelected = rows.some((r) => selected.has(rowKey(r)));

  return (
    <Box sx={{ overflowX: 'auto' }} data-density={density}>
      <Box component="table" role="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
        {caption && (
          <caption style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>
            {caption}
          </caption>
        )}
        <Box
          component="thead"
          sx={{
            position: stickyHeader ? 'sticky' : 'static',
            top: 0,
            zIndex: 1,
            '& tr': { borderBottom: `1px solid ${theme.palette.divider}` },
          }}
        >
          <tr>
            <TableHeaderCells
              columns={columns}
              selectable={selectable}
              allSelected={allSelected}
              someSelected={someSelected}
              onToggleSelectAll={toggleAll}
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSortChange={onSortChange}
              hasRowActions={Boolean(rowActions)}
              compact={compact}
            />
          </tr>
        </Box>
        <tbody>
          {loading
            ? Array.from({ length: loadingRowCount }, (_, i) => (
                <tr key={i}>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)}
                    style={{ padding: compact ? '6px 12px' : '12px 12px' }}
                  >
                    <Skeleton shape="text" width="100%" />
                  </td>
                </tr>
              ))
            : rows.map((row) => {
                const key = rowKey(row);
                return (
                  <Box
                    component="tr"
                    key={key}
                    onClick={() => onRowClick?.(row)}
                    data-state={selected.has(key) ? 'selected' : undefined}
                    sx={{
                      borderBottom: `1px solid ${theme.palette.mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}`,
                      cursor: onRowClick ? 'pointer' : 'default',
                      '& .table-row-actions': {
                        opacity: 0,
                        transition: 'opacity 120ms ease-out',
                      },
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        '& .table-row-actions': { opacity: 1 },
                      },
                      '&[data-state="selected"]': {
                        backgroundColor: 'action.selected',
                        boxShadow: (t) => `inset 3px 0 0 0 ${t.palette.primary.main}`,
                      },
                      '@media (hover: none)': {
                        '& .table-row-actions': { opacity: 1 },
                      },
                    }}
                  >
                    <TableRowCells
                      row={row}
                      columns={columns}
                      selectable={selectable}
                      selected={selected.has(key)}
                      onToggleSelect={() => toggleOne(key)}
                      compact={compact}
                      rowActions={rowActions}
                    />
                  </Box>
                );
              })}
        </tbody>
      </Box>

      {!loading && rows.length === 0 && (
        <EmptyState icon="filter" title={emptyTitle} description={emptyDescription} />
      )}
    </Box>
  );
}
