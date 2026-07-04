import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Box from '@mui/material/Box';
import { SplitPane } from './SplitPane';
import { ResizablePanel } from './ResizablePanel';
import { Accordion } from './Accordion';
import { Stack } from './Stack';
import { Card } from './Card';
import { Button } from '../foundation/Button';
import { Typography } from '../foundation/Typography';
import { Switch } from '../forms/Switch';

const meta: Meta = { title: 'Layout/Panels' };
export default meta;

function SplitPaneDemo() {
  const [endOpen, setEndOpen] = useState(true);
  return (
    <Box sx={{ height: 420, border: 1, borderColor: 'divider', borderRadius: 2 }}>
      <SplitPane
        start={
          <Box sx={{ p: 4 }}>
            <Typography variant="labelXs" color="secondary">
              Filters
            </Typography>
          </Box>
        }
        end={
          <Box sx={{ p: 4 }}>
            <Typography variant="h6">Job detail panel</Typography>
            <Typography variant="textSm" color="secondary">
              Slides in from the right (inspection grammar).
            </Typography>
          </Box>
        }
        endOpen={endOpen}
        endLabel="Job details"
      >
        <Stack gap={4}>
          <Box sx={{ p: 4 }}>
            <Button onClick={() => setEndOpen((v) => !v)}>
              {endOpen ? 'Close' : 'Open'} detail panel
            </Button>
          </Box>
          {Array.from({ length: 8 }, (_, i) => (
            <Box key={i} sx={{ px: 4 }}>
              <Card level="flat" padding={4}>
                <Typography variant="textSm">Job card {i + 1}</Typography>
              </Card>
            </Box>
          ))}
        </Stack>
      </SplitPane>
    </Box>
  );
}

export const ThreePane: StoryObj = { render: () => <SplitPaneDemo /> };

function ResizableDemo() {
  const [width, setWidth] = useState(280);
  return (
    <Box sx={{ height: 260, border: 1, borderColor: 'divider', borderRadius: 2 }}>
      <ResizablePanel
        width={width}
        onWidthChange={setWidth}
        minWidth={200}
        maxWidth={420}
        defaultWidth={280}
        label="Resize filter panel"
      >
        <Box sx={{ p: 4 }}>
          <Typography variant="textSm">
            Width: {Math.round(width)}px — drag the handle, use arrow keys on it, or double-click to
            reset.
          </Typography>
        </Box>
      </ResizablePanel>
    </Box>
  );
}

export const Resizable: StoryObj = { render: () => <ResizableDemo /> };

export const Accordions: StoryObj = {
  render: () => (
    <Box sx={{ maxWidth: 480 }}>
      <Accordion
        defaultOpen={['defaults']}
        items={[
          {
            id: 'defaults',
            title: 'Defaults for new profiles',
            content: (
              <Stack gap={4}>
                <Switch label="Remote preferred" defaultChecked />
                <Switch label="Daily digest" />
              </Stack>
            ),
          },
          {
            id: 'advanced',
            title: 'Advanced',
            content: <Typography variant="textSm">Second panel content.</Typography>,
          },
          { id: 'disabled', title: 'Disabled section', content: null, disabled: true },
        ]}
      />
    </Box>
  ),
};

export const AccordionSingleMode: StoryObj = {
  render: () => (
    <Box sx={{ maxWidth: 480 }}>
      <Accordion
        mode="single"
        items={[
          { id: 'a', title: 'Opening one…', content: <Typography variant="textSm">A</Typography> },
          {
            id: 'b',
            title: '…closes the other',
            content: <Typography variant="textSm">B</Typography>,
          },
        ]}
      />
    </Box>
  ),
};
