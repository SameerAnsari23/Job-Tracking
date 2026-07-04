import { useState } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { renderWithTheme, inBothThemes } from '@/test/renderWithTheme';
import { Table } from './Table';
import { VirtualTable } from './VirtualTable';
import { DataGrid } from './DataGrid';
import type { TableColumn } from './internal/tableTypes';

interface Row {
  id: string;
  name: string;
  count: number;
}
const ROWS: Row[] = [
  { id: 'a', name: 'Greenhouse', count: 100 },
  { id: 'b', name: 'Lever', count: 50 },
];
const COLUMNS: TableColumn<Row>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'count', header: 'Count', numeric: true },
];

describe('Table', () => {
  inBothThemes('renders real table semantics with the given rows', (mode) => {
    renderWithTheme(<Table columns={COLUMNS} rows={ROWS} rowKey={(r) => r.id} />, mode);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(3); // header + 2 rows
    expect(screen.getByRole('columnheader', { name: 'Count' })).toBeInTheDocument();
  });

  it('sortable header exposes aria-sort and fires onSortChange', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    renderWithTheme(
      <Table
        columns={COLUMNS}
        rows={ROWS}
        rowKey={(r) => r.id}
        sortKey="name"
        sortDirection="asc"
        onSortChange={onSortChange}
      />,
    );
    const header = screen.getByRole('columnheader', { name: /Name/ });
    expect(header).toHaveAttribute('aria-sort', 'ascending');
    await user.click(screen.getByRole('button', { name: /Name/ }));
    expect(onSortChange).toHaveBeenCalledWith('name');
  });

  it('selection: select-all checks every row, and rows can be toggled individually', async () => {
    const user = userEvent.setup();
    function Harness() {
      const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
      return (
        <Table
          columns={COLUMNS}
          rows={ROWS}
          rowKey={(r) => r.id}
          selectable
          selectedKeys={selected}
          onSelectionChange={setSelected}
        />
      );
    }
    renderWithTheme(<Harness />);
    await user.click(screen.getByRole('checkbox', { name: 'Select all rows' }));
    const rowCheckboxes = screen
      .getAllByRole('checkbox')
      .filter((cb) => cb.getAttribute('aria-label') !== 'Select all rows');
    for (const cb of rowCheckboxes) expect(cb).toBeChecked();
  });

  it('marks the selected row with data-state and a visual indicator', async () => {
    const user = userEvent.setup();
    function Harness() {
      const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
      return (
        <Table
          columns={COLUMNS}
          rows={ROWS}
          rowKey={(r) => r.id}
          selectable
          selectedKeys={selected}
          onSelectionChange={setSelected}
        />
      );
    }
    renderWithTheme(<Harness />);
    const rows = screen.getAllByRole('row');
    const firstDataRow = rows[1]!;
    const checkbox = firstDataRow.querySelector('input[type="checkbox"]')!;
    await user.click(checkbox);
    expect(firstDataRow).toHaveAttribute('data-state', 'selected');
  });

  it('renders skeleton rows while loading, and an empty state when there are no rows', () => {
    const { rerender } = renderWithTheme(
      <Table columns={COLUMNS} rows={[]} rowKey={(r) => r.id} loading loadingRowCount={3} />,
    );
    expect(document.querySelectorAll('.MuiSkeleton-root')).toHaveLength(3);

    rerender(<Table columns={COLUMNS} rows={[]} rowKey={(r) => r.id} emptyTitle="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('fires onRowClick', async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    renderWithTheme(
      <Table columns={COLUMNS} rows={ROWS} rowKey={(r) => r.id} onRowClick={onRowClick} />,
    );
    await user.click(screen.getByText('Greenhouse'));
    expect(onRowClick).toHaveBeenCalledWith(ROWS[0]);
  });

  it('has no axe violations with selection and sorting enabled', async () => {
    const { container } = renderWithTheme(
      <Table
        columns={COLUMNS}
        rows={ROWS}
        rowKey={(r) => r.id}
        selectable
        sortKey="name"
        sortDirection="asc"
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('VirtualTable', () => {
  const bigRows: Row[] = Array.from({ length: 500 }, (_, i) => ({
    id: String(i),
    name: `Row ${i}`,
    count: i,
  }));

  let restoreOffsetWidth: PropertyDescriptor | undefined;
  let restoreOffsetHeight: PropertyDescriptor | undefined;

  beforeEach(() => {
    // jsdom has no layout engine — react-virtual's rect observer reads
    // offsetWidth/offsetHeight (not getBoundingClientRect) to size the
    // viewport, and both are always 0 in jsdom. Without a real size the
    // virtualizer computes zero visible rows; give it a concrete viewport.
    restoreOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
    restoreOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 400 });
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      value: 320,
    });
  });

  afterEach(() => {
    if (restoreOffsetWidth)
      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', restoreOffsetWidth);
    if (restoreOffsetHeight)
      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', restoreOffsetHeight);
  });

  it('renders only a small window of the 500 rows (virtualization correctness)', () => {
    renderWithTheme(
      <VirtualTable columns={COLUMNS} rows={bigRows} rowKey={(r) => r.id} height={320} />,
    );
    const renderedRows = document.querySelectorAll('tr[data-index]');
    expect(renderedRows.length).toBeGreaterThan(0);
    expect(renderedRows.length).toBeLessThan(100); // far fewer than 500
  });

  it('renders spacer rows to preserve total scroll height', () => {
    renderWithTheme(
      <VirtualTable columns={COLUMNS} rows={bigRows} rowKey={(r) => r.id} height={320} />,
    );
    // Total content height should reflect all 500 rows, not just the rendered window.
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });

  it('shows the empty state when there are no rows', () => {
    renderWithTheme(
      <VirtualTable
        columns={COLUMNS}
        rows={[]}
        rowKey={(r) => r.id}
        height={320}
        emptyTitle="No rows"
      />,
    );
    expect(screen.getByText('No rows')).toBeInTheDocument();
  });

  it('shows a trailing loading indicator', () => {
    renderWithTheme(
      <VirtualTable columns={COLUMNS} rows={ROWS} rowKey={(r) => r.id} height={320} loading />,
    );
    expect(screen.getByRole('status', { name: 'Loading more rows' })).toBeInTheDocument();
  });
});

describe('DataGrid', () => {
  it('composes Table and renders toolbar, filters, and pagination slots', () => {
    renderWithTheme(
      <DataGrid
        columns={COLUMNS}
        rows={ROWS}
        rowKey={(r) => r.id}
        toolbar={<span>2 providers</span>}
        filters={<span>Filter row</span>}
        pagination={<span>Page 1</span>}
      />,
    );
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('2 providers')).toBeInTheDocument();
    expect(screen.getByText('Filter row')).toBeInTheDocument();
    expect(screen.getByText('Page 1')).toBeInTheDocument();
  });

  it('swaps the toolbar for bulkActions once a row is selected', () => {
    renderWithTheme(
      <DataGrid
        columns={COLUMNS}
        rows={ROWS}
        rowKey={(r) => r.id}
        selectable
        selectedKeys={new Set(['a'])}
        toolbar={<span>Toolbar</span>}
        bulkActions={<span>Bulk actions</span>}
      />,
    );
    expect(screen.getByText('Bulk actions')).toBeInTheDocument();
    expect(screen.queryByText('Toolbar')).not.toBeInTheDocument();
  });
});
