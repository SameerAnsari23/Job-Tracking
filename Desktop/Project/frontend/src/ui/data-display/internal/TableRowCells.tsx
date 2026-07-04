import { useTheme } from '@mui/material/styles';
import { TableCheckbox } from './TableCheckbox';
import type { TableColumn } from './tableTypes';

export interface TableRowCellsProps<T> {
  row: T;
  columns: TableColumn<T>[];
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
  rowLabel?: string;
  compact?: boolean;
  rowActions?: (row: T) => React.ReactNode;
}

/**
 * The `<td>` set for one row — shared verbatim by Table and VirtualTable so
 * the checkbox column, column-alignment/numeric rules, and the hover-reveal
 * actions column exist in exactly one place (Phase 17.6 no-duplicated-
 * display-logic rule). Selection reuses ui/forms' Checkbox (same tier).
 */
export function TableRowCells<T>({
  row,
  columns,
  selectable,
  selected,
  onToggleSelect,
  rowLabel,
  compact,
  rowActions,
}: TableRowCellsProps<T>) {
  const theme = useTheme();
  const cellPadY = compact ? 6 : 12;

  return (
    <>
      {selectable && (
        <td style={{ width: 40, padding: `${cellPadY}px 8px`, verticalAlign: 'middle' }}>
          <TableCheckbox
            aria-label={`Select ${rowLabel ?? 'row'}`}
            checked={selected}
            onChange={onToggleSelect}
          />
        </td>
      )}
      {columns.map((column) => {
        const align = column.numeric ? 'right' : (column.align ?? 'left');
        return (
          <td
            key={column.key}
            style={{
              padding: `${cellPadY}px 12px`,
              textAlign: align,
              fontSize: 13,
              color: theme.palette.text.primary,
              fontVariantNumeric: column.numeric ? 'tabular-nums' : undefined,
              verticalAlign: 'middle',
              width: column.width,
            }}
          >
            {column.render
              ? column.render(row)
              : String((row as Record<string, unknown>)[column.key] ?? '')}
          </td>
        );
      })}
      {rowActions && (
        <td
          className="table-row-actions"
          style={{ padding: `${cellPadY}px 12px`, textAlign: 'right', verticalAlign: 'middle' }}
        >
          {rowActions(row)}
        </td>
      )}
    </>
  );
}
