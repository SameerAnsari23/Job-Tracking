import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { ReactElement, Ref } from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Spinner } from '../foundation/Spinner';
import { EmptyState } from '../layout/EmptyState';
import { TableHeaderCells } from './internal/TableHeaderCells';
import { TableRowCells } from './internal/TableRowCells';
import type { TableStateProps } from './internal/tableTypes';

export interface VirtualTableHandle {
  /** For page-level scroll restoration — this component persists nothing itself. */
  scrollToOffset: (offset: number) => void;
  getScrollOffset: () => number;
}

export interface VirtualTableProps<T> extends TableStateProps<T> {
  rows: T[];
  /** Viewport height in px — required so the virtualizer knows the window size. */
  height: number;
  /** Row height in px, or a per-row estimator for variable heights. */
  rowHeight?: number | ((index: number) => number);
  overscan?: number;
  /** Appends a trailing loading row (the caller drives pagination via InfiniteScroll). */
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  caption?: string;
}

/**
 * Virtualized table for lists that can exceed ~100 rows (Phase 16.4).
 * Built on @tanstack/react-virtual; keeps real `<table>` semantics via two
 * spacer `<tr>`s bracketing only the rendered window, rather than
 * abandoning table markup for a div grid — screen readers still see rows
 * and cells, sighted users still get the sticky header.
 *
 * Cell rendering (TableRowCells/TableHeaderCells) is shared with Table
 * verbatim — this is the exact same row/column contract, just windowed.
 */
function VirtualTableInner<T>(
  {
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
    height,
    rowHeight,
    overscan = 8,
    loading = false,
    emptyTitle = 'No results',
    emptyDescription,
    caption,
  }: VirtualTableProps<T>,
  ref: Ref<VirtualTableHandle>,
) {
  const theme = useTheme();
  const compact = density === 'compact';
  const defaultRowHeight = compact ? 36 : 48;
  const scrollRef = useRef<HTMLDivElement>(null);
  const selected = selectedKeys ?? new Set<string>();

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (index) =>
      typeof rowHeight === 'function' ? rowHeight(index) : (rowHeight ?? defaultRowHeight),
    overscan,
  });

  useImperativeHandle(ref, () => ({
    scrollToOffset: (offset) => scrollRef.current?.scrollTo({ top: offset }),
    getScrollOffset: () => scrollRef.current?.scrollTop ?? 0,
  }));

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

  if (rows.length === 0 && !loading) {
    return <EmptyState icon="filter" title={emptyTitle} description={emptyDescription} />;
  }

  const virtualItems = virtualizer.getVirtualItems();
  const paddingTop = virtualItems.length > 0 ? (virtualItems[0]?.start ?? 0) : 0;
  const paddingBottom =
    virtualItems.length > 0
      ? virtualizer.getTotalSize() - (virtualItems[virtualItems.length - 1]?.end ?? 0)
      : 0;

  return (
    <Box ref={scrollRef} role="region" aria-label={caption} sx={{ height, overflow: 'auto' }}>
      <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
        <Box
          component="thead"
          sx={{
            position: 'sticky',
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
          {paddingTop > 0 && (
            <tr aria-hidden style={{ height: paddingTop }}>
              <td style={{ padding: 0, border: 'none' }} />
            </tr>
          )}
          {virtualItems.map((virtualRow) => {
            const row = rows[virtualRow.index];
            if (!row) return null;
            const key = rowKey(row);
            return (
              <Box
                component="tr"
                key={key}
                data-index={virtualRow.index}
                onClick={() => onRowClick?.(row)}
                data-state={selected.has(key) ? 'selected' : undefined}
                sx={{
                  height: virtualRow.size,
                  borderBottom: `1px solid ${theme.palette.mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}`,
                  cursor: onRowClick ? 'pointer' : 'default',
                  '&:hover': { backgroundColor: 'action.hover' },
                  '&[data-state="selected"]': { backgroundColor: 'action.selected' },
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
          {paddingBottom > 0 && (
            <tr aria-hidden style={{ height: paddingBottom }}>
              <td style={{ padding: 0, border: 'none' }} />
            </tr>
          )}
          {loading && (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)}>
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <Spinner size={16} label="Loading more rows" />
                </Box>
              </td>
            </tr>
          )}
        </tbody>
      </Box>
    </Box>
  );
}

export const VirtualTable = forwardRef(VirtualTableInner) as <T>(
  props: VirtualTableProps<T> & { ref?: Ref<VirtualTableHandle> },
) => ReactElement;
