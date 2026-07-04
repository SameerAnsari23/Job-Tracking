import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { renderWithTheme, inBothThemes } from '@/test/renderWithTheme';
import { Container } from './Container';
import { Stack } from './Stack';
import { Grid } from './Grid';
import { Section } from './Section';
import { Card } from './Card';
import { Widget } from './Widget';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { LoadingState } from './LoadingState';
import { Button } from '../foundation/Button';

describe('Container', () => {
  it('applies the width variant and centers content', () => {
    renderWithTheme(
      <Container width="narrow">
        <span>content</span>
      </Container>,
    );
    const el = screen.getByText('content').parentElement!;
    expect(el).toHaveAttribute('data-variant', 'narrow');
    expect(el).toHaveStyle({ maxWidth: '720px' });
  });
});

describe('Stack', () => {
  it('lays out children with gap and direction', () => {
    renderWithTheme(
      <Stack direction="row" gap={4}>
        <span>a</span>
        <span>b</span>
      </Stack>,
    );
    const el = screen.getByText('a').parentElement!;
    expect(el).toHaveStyle({ display: 'flex', flexDirection: 'row', gap: '16px' });
  });

  it('interleaves dividers between children', () => {
    renderWithTheme(
      <Stack gap={2} divider>
        <span>a</span>
        <span>b</span>
        <span>c</span>
      </Stack>,
    );
    expect(screen.getAllByRole('separator')).toHaveLength(2);
  });

  it('list semantics strip default list styling', () => {
    renderWithTheme(
      <Stack as="ul" gap={2}>
        <li>one</li>
      </Stack>,
    );
    expect(screen.getByRole('list')).toHaveStyle({ listStyle: 'none' });
  });
});

describe('Grid', () => {
  it('renders numeric and responsive column templates', () => {
    renderWithTheme(
      <Grid columns={3} gap={4}>
        <span>cell</span>
      </Grid>,
    );
    expect(screen.getByText('cell').parentElement!).toHaveStyle({
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    });
  });
});

describe('Section', () => {
  it('labels the section landmark with its heading', () => {
    renderWithTheme(
      <Section title="Recent matches" action={<Button size="sm">View all</Button>}>
        <span>body</span>
      </Section>,
    );
    const region = document.querySelector('section')!;
    expect(region).toHaveAttribute('aria-labelledby');
    expect(screen.getByRole('heading', { name: 'Recent matches', level: 5 })).toBeInTheDocument();
  });
});

describe('Card', () => {
  inBothThemes('compound slots render with dividers', (mode) => {
    renderWithTheme(
      <Card>
        <Card.Header>
          <span>head</span>
        </Card.Header>
        <Card.Body>
          <span>body</span>
        </Card.Body>
        <Card.Footer>
          <span>foot</span>
        </Card.Footer>
      </Card>,
      mode,
    );
    expect(screen.getAllByRole('separator')).toHaveLength(2);
    expect(document.querySelector('[data-slot="header"]')).toBeInTheDocument();
    expect(document.querySelector('[data-slot="footer"]')).toBeInTheDocument();
  });

  it('interactive card renders a single overlay link with inner controls still reachable', async () => {
    const user = userEvent.setup();
    const onInner = vi.fn();
    renderWithTheme(
      <Card interactive href="/jobs/1" aria-label="Open job">
        <span>title</span>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Button size="sm" onClick={onInner}>
            Save
          </Button>
        </div>
      </Card>,
    );
    expect(screen.getByRole('link', { name: 'Open job' })).toHaveAttribute('href', '/jobs/1');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onInner).toHaveBeenCalledOnce();
  });
});

describe('Widget', () => {
  it('state precedence: loading > error > empty > content', () => {
    const { rerender } = renderWithTheme(
      <Widget title="W" loading error="boom" empty>
        <span>content</span>
      </Widget>,
    );
    expect(document.querySelector('[data-state="loading"]')).toBeInTheDocument();

    rerender(
      <Widget title="W" error="boom" empty>
        <span>content</span>
      </Widget>,
    );
    expect(document.querySelector('[data-state="error"]')).toBeInTheDocument();
    expect(screen.getByText('boom')).toBeInTheDocument();

    rerender(
      <Widget title="W" empty>
        <span>content</span>
      </Widget>,
    );
    expect(document.querySelector('[data-state="empty"]')).toBeInTheDocument();

    rerender(
      <Widget title="W">
        <span>content</span>
      </Widget>,
    );
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('has no axe violations across states', async () => {
    const { container } = renderWithTheme(
      <>
        <Widget title="A" loading>
          <span />
        </Widget>
        <Widget title="B" error="failed" onRetry={() => {}}>
          <span />
        </Widget>
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('EmptyState / ErrorState / LoadingState', () => {
  it('EmptyState renders title, description, and a single action', () => {
    renderWithTheme(
      <EmptyState
        icon="bookmark"
        title="Jobs you save land here"
        description="Browse recommendations to find your first."
        action={<Button>Browse</Button>}
      />,
    );
    expect(screen.getByText('Jobs you save land here')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Browse' })).toBeInTheDocument();
  });

  it('ErrorState retry locks while the promise settles', async () => {
    const user = userEvent.setup();
    let resolve: () => void;
    const onRetry = vi.fn(
      () =>
        new Promise<void>((r) => {
          resolve = r;
        }),
    );
    renderWithTheme(<ErrorState title="Failed" onRetry={onRetry} />);
    const button = screen.getByRole('button', { name: 'Try again' });
    await user.click(button);
    expect(onRetry).toHaveBeenCalledOnce();
    expect(screen.getByRole('button')).toBeDisabled();
    resolve!();
    await screen.findByRole('button', { name: 'Try again' });
  });

  it('LoadingState announces once and renders preset geometry', () => {
    renderWithTheme(<LoadingState layout="list" count={4} label="Loading jobs" />);
    const region = screen.getByRole('status', { name: 'Loading jobs' });
    expect(region).toHaveAttribute('aria-busy', 'true');
    expect(region.querySelectorAll('.MuiSkeleton-root')).toHaveLength(4);
  });
});
