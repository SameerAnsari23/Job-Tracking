import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import Box from '@mui/material/Box';
import { Table } from './Table';
import { VirtualTable } from './VirtualTable';
import { DataGrid } from './DataGrid';
import type { TableColumn } from './internal/tableTypes';
import { Button } from '../foundation/Button';
import { Badge } from '../foundation/Badge';

const meta: Meta = { title: 'Data Display/Table · VirtualTable · DataGrid' };
export default meta;

interface Provider {
  id: string;
  name: string;
  status: 'healthy' | 'degraded';
  pageSize: number;
}

const PROVIDERS: Provider[] = [
  { id: 'greenhouse', name: 'Greenhouse', status: 'healthy', pageSize: 100 },
  { id: 'lever', name: 'Lever', status: 'healthy', pageSize: 50 },
  { id: 'ashby', name: 'Ashby', status: 'healthy', pageSize: 100 },
  { id: 'smartrecruiters', name: 'SmartRecruiters', status: 'degraded', pageSize: 100 },
  { id: 'workday', name: 'Workday', status: 'healthy', pageSize: 20 },
];

const COLUMNS: TableColumn<Provider>[] = [
  { key: 'id', header: 'Provider', render: (r) => <code>{r.id}</code> },
  { key: 'name', header: 'Name' },
  {
    key: 'status',
    header: 'Status',
    render: (r) => <Badge tone={r.status === 'healthy' ? 'success' : 'warning'}>{r.status}</Badge>,
  },
  { key: 'pageSize', header: 'Page size', numeric: true },
];

export const Basic: StoryObj = {
  render: () => <Table columns={COLUMNS} rows={PROVIDERS} rowKey={(r) => r.id} />,
};

export const Loading: StoryObj = {
  render: () => (
    <Table columns={COLUMNS} rows={[]} rowKey={(r) => r.id} loading loadingRowCount={4} />
  ),
};

export const Empty: StoryObj = {
  render: () => (
    <Table
      columns={COLUMNS}
      rows={[]}
      rowKey={(r) => r.id}
      emptyTitle="No providers configured"
      emptyDescription="Add a provider to see it here."
    />
  ),
};

function SelectableDemo() {
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [sortKey, setSortKey] = useState<string>();
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  return (
    <Table
      columns={COLUMNS.map((c) => (c.key === 'name' ? { ...c, sortable: true } : c))}
      rows={PROVIDERS}
      rowKey={(r) => r.id}
      selectable
      selectedKeys={selected}
      onSelectionChange={setSelected}
      sortKey={sortKey}
      sortDirection={sortDirection}
      onSortChange={(key) => {
        setSortKey(key);
        setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
      }}
      rowActions={() => (
        <Button variant="ghost" size="sm">
          Edit
        </Button>
      )}
    />
  );
}

export const SelectableSortableWithRowActions: StoryObj = { render: () => <SelectableDemo /> };

export const SelectAllInteraction: StoryObj = {
  render: () => <SelectableDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select all rows' }));
    const rowCheckboxes = canvas.getAllByRole('checkbox').slice(1);
    for (const cb of rowCheckboxes) await expect(cb).toBeChecked();
  },
};

function VirtualDemo() {
  const rows = Array.from({ length: 500 }, (_, i) => ({
    id: String(i),
    name: `Provider ${i}`,
    status: (i % 7 === 0 ? 'degraded' : 'healthy') as Provider['status'],
    pageSize: 50,
  }));
  return (
    <VirtualTable
      columns={COLUMNS}
      rows={rows}
      rowKey={(r) => r.id}
      height={320}
      caption="500 providers"
    />
  );
}

export const Virtualized500Rows: StoryObj = { render: () => <VirtualDemo /> };

export const DataGridComposed: StoryObj = {
  render: () => (
    <DataGrid
      columns={COLUMNS}
      rows={PROVIDERS}
      rowKey={(r) => r.id}
      selectable
      toolbar={<Box sx={{ fontSize: 13, color: 'text.secondary' }}>5 providers</Box>}
      bulkActions={
        <Button variant="destructive" size="sm">
          Disable selected
        </Button>
      }
      pagination={<Box sx={{ fontSize: 12, color: 'text.disabled' }}>Page 1 of 1</Box>}
    />
  ),
};
