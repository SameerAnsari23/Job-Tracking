import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { LoadingState } from './LoadingState';
import { Grid } from './Grid';
import { Card } from './Card';
import { Stack } from './Stack';
import { Button } from '../foundation/Button';
import { Chip } from '../foundation/Chip';

const meta: Meta = { title: 'Layout/States' };
export default meta;

export const EmptyStates: StoryObj = {
  render: () => (
    <Grid columns={{ xs: 1, md: 2 }} gap={6}>
      <Card>
        <EmptyState
          icon="search"
          title="Search across every job board at once"
          description="Start with a company, role, or skill."
          action={
            <Stack direction="row" gap={2}>
              <Chip label="stripe" onToggle={() => {}} />
              <Chip label="notion" onToggle={() => {}} />
            </Stack>
          }
        />
      </Card>
      <Card>
        <EmptyState
          icon="bookmark"
          title="Jobs you save land here"
          description="Browse recommendations to find your first."
          action={<Button variant="secondary">Browse recommendations</Button>}
        />
      </Card>
      <Card>
        <EmptyState icon="check" title="You're all caught up" />
      </Card>
      <Card>
        <EmptyState
          icon="radar"
          title="Tell us once. We'll watch everything."
          description="Set up discovery to get matched automatically."
          action={<Button>Set up discovery</Button>}
        />
      </Card>
    </Grid>
  ),
};

export const ErrorStates: StoryObj = {
  render: () => (
    <Grid columns={{ xs: 1, md: 2 }} gap={6}>
      <Card>
        <ErrorState
          title="Couldn't load saved jobs"
          cause="You appear to be offline."
          onRetry={() => new Promise((r) => setTimeout(r, 800))}
        />
      </Card>
      <Card>
        <ErrorState compact title="Couldn't load activity" onRetry={() => {}} />
      </Card>
    </Grid>
  ),
};

export const LoadingStates: StoryObj = {
  render: () => (
    <Grid columns={{ xs: 1, md: 2 }} gap={6}>
      <Card>
        <LoadingState layout="list" count={3} label="Loading jobs" />
      </Card>
      <Card>
        <LoadingState layout="grid" count={4} label="Loading widgets" />
      </Card>
      <Card>
        <LoadingState layout="detail" label="Loading job detail" />
      </Card>
      <Card>
        <LoadingState layout="form" count={3} label="Loading form" />
      </Card>
    </Grid>
  ),
};
