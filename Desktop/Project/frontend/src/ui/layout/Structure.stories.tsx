import type { Meta, StoryObj } from '@storybook/react';
import { Container } from './Container';
import { Stack } from './Stack';
import { Grid } from './Grid';
import { Section } from './Section';
import { Card } from './Card';
import { Widget } from './Widget';
import { Typography } from '../foundation/Typography';
import { Button } from '../foundation/Button';
import { Badge } from '../foundation/Badge';
import { Skeleton } from '../foundation/Skeleton';
import { Stack as VStack } from './Stack';

const meta: Meta = { title: 'Layout/Structure' };
export default meta;

function Placeholder({ label, height = 64 }: { label: string; height?: number }) {
  return (
    <Card level="inset" padding={4}>
      <div style={{ height, display: 'flex', alignItems: 'center' }}>
        <Typography variant="textSm" color="secondary">
          {label}
        </Typography>
      </div>
    </Card>
  );
}

export const Containers: StoryObj = {
  render: () => (
    <Stack gap={6}>
      {(['narrow', 'default', 'wide'] as const).map((width) => (
        <Container key={width} width={width} paddedY={false}>
          <Placeholder label={`Container width="${width}"`} height={40} />
        </Container>
      ))}
    </Stack>
  ),
};

export const StacksAndGrids: StoryObj = {
  render: () => (
    <Container paddedY={false}>
      <Stack gap={8}>
        <Stack direction="row" gap={4}>
          <Placeholder label="row gap-4" />
          <Placeholder label="row gap-4" />
          <Placeholder label="row gap-4" />
        </Stack>
        <Stack gap={3} divider>
          <Placeholder label="divided item" height={32} />
          <Placeholder label="divided item" height={32} />
        </Stack>
        <Grid columns={{ xs: 1, sm: 2, lg: 4 }} gap={6}>
          <Placeholder label="1 → 2 → 4 cols" />
          <Placeholder label="responsive" />
          <Placeholder label="grid" />
          <Placeholder label="cells" />
        </Grid>
      </Stack>
    </Container>
  ),
};

export const Sections: StoryObj = {
  render: () => (
    <Container paddedY={false}>
      <Stack gap={12}>
        <Section
          title="Recent matches"
          description="Ranked against your discovery profiles."
          action={
            <Button variant="ghost" size="sm">
              View all
            </Button>
          }
        >
          <Placeholder label="section content" />
        </Section>
        <Section title="Saved searches">
          <Placeholder label="second section — space-12 between sections" />
        </Section>
      </Stack>
    </Container>
  ),
};

export const Cards: StoryObj = {
  render: () => (
    <Grid columns={{ xs: 1, md: 2 }} gap={6}>
      <Card>
        <Card.Header>
          <Stack direction="row" justify="between" align="center">
            <Typography variant="h6">Compound card</Typography>
            <Badge tone="accent">New</Badge>
          </Stack>
        </Card.Header>
        <Card.Body>
          <Typography variant="textSm" color="secondary">
            Header and footer separated by hairline dividers per Phase 16.2.
          </Typography>
        </Card.Body>
        <Card.Footer>
          <Stack direction="row" justify="end" gap={3}>
            <Button variant="ghost" size="sm">
              Dismiss
            </Button>
            <Button size="sm">Act</Button>
          </Stack>
        </Card.Footer>
      </Card>
      <Card interactive href="#" aria-label="Open Software Engineer at Stripe">
        <Typography variant="textMd">Interactive card</Typography>
        <Typography variant="textSm" color="secondary">
          Whole card is one link; hover lifts.
        </Typography>
      </Card>
    </Grid>
  ),
};

export const Widgets: StoryObj = {
  render: () => (
    <Grid columns={{ xs: 1, md: 2 }} gap={6}>
      <Widget
        title="Ready"
        action={
          <Button variant="ghost" size="sm">
            View all
          </Button>
        }
      >
        <Typography variant="textSm">Content renders when no state flag is set.</Typography>
      </Widget>
      <Widget title="Loading" loading skeleton={<Skeleton shape="text" lines={3} />}>
        <span />
      </Widget>
      <Widget title="Error" error="Couldn't load saved jobs" onRetry={() => {}}>
        <span />
      </Widget>
      <Widget title="Empty" empty>
        <span />
      </Widget>
    </Grid>
  ),
};

export const NestedLayouts: StoryObj = {
  render: () => (
    <Container width="wide" paddedY={false}>
      <Grid columns={{ xs: 1, lg: 3 }} gap={6}>
        <VStack gap={6}>
          <Widget title="Column A">
            <Placeholder label="widget in grid in container" height={40} />
          </Widget>
        </VStack>
        <Widget title="Column B">
          <Stack gap={3}>
            <Placeholder label="stack in widget" height={24} />
            <Placeholder label="stack in widget" height={24} />
          </Stack>
        </Widget>
        <Widget title="Column C">
          <Placeholder label="third column" height={40} />
        </Widget>
      </Grid>
    </Container>
  ),
};
