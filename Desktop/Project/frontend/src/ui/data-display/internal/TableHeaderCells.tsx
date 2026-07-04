import ButtonBase from '@mui/material/ButtonBase';
import { useTheme } from '@mui/material/styles';
import { Icon } from '../../foundation/Icon';
import { TableCheckbox } from './TableCheckbox';
import type { TableColumn, SortDirection } from './tableTypes';

export interface TableHeaderCellsProps<T> {
  columns: TableColumn<T>[];
  selectable?: boolean;
  allSelected?: boolean;
  someSelected?: boolean;
  onToggleSelectAll?: () => void;
  sortKey?: string;
  sortDirection?: SortDirection;
  onSortChange?: (key: string) => void;
  hasRowActions?: boolean;
  compact?: boolean;
}

/**
 * The `<th>` row — shared by Table and VirtualTable (see TableRowCells for
 * the matching rationale). Sortable headers expose `aria-sort`; the actual
 * sort comparison is entirely the caller's concern (presentation only).
 */
export function TableHeaderCells<T>({
  columns,
  selectable,
  allSelected,
  someSelected,
  onToggleSelectAll,
  sortKey,
  sortDirection,
  onSortChange,
  hasRowActions,
  compact,
}: TableHeaderCellsProps<T>) {
  const theme = useTheme();
  const padY = compact ? 6 : 10;

  return (
    <>
      {selectable && (
        <th style={{ width: 40, padding: `${padY}px 8px`, textAlign: 'left' }}>
          <TableCheckbox
            aria-label="Select all rows"
            checked={allSelected}
            indeterminate={someSelected && !allSelected}
            onChange={onToggleSelectAll}
          />
        </th>
      )}
      {columns.map((column) => {
        const align = column.numeric ? 'right' : (column.align ?? 'left');
        const isSorted = sortKey === column.key;
        const ariaSort = column.sortable
          ? isSorted
            ? sortDirection === 'asc'
              ? 'ascending'
              : 'descending'
            : 'none'
          : undefined;

        return (
          <th
            key={column.key}
            scope="col"
            aria-sort={ariaSort}
            style={{
              padding: `${padY}px 12px`,
              textAlign: align,
              width: column.width,
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: theme.palette.text.secondary,
              position: 'sticky',
              top: 0,
              backgroundColor: theme.palette.background.paper,
              zIndex: 1,
            }}
          >
            {column.sortable ? (
              <ButtonBase
                onClick={() => onSortChange?.(column.key)}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  flexDirection: align === 'right' ? 'row-reverse' : 'row',
                  fontSize: 'inherit',
                  fontWeight: 'inherit',
                  letterSpacing: 'inherit',
                  textTransform: 'inherit',
                  color: 'inherit',
                }}
              >
                {column.header}
                {isSorted && (
                  <Icon name={sortDirection === 'asc' ? 'arrowUp' : 'arrowDown'} size={14} />
                )}
              </ButtonBase>
            ) : (
              column.header
            )}
          </th>
        );
      })}
      {hasRowActions && <th aria-hidden style={{ width: 1 }} />}
    </>
  );
}
