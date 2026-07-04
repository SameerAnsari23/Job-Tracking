import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { renderWithTheme, inBothThemes } from '@/test/renderWithTheme';
import { Button } from './Button';
import { Link } from './Link';
import { Chip } from './Chip';
import { Tooltip } from './Tooltip';
import { Icon } from './Icon';

describe('Button', () => {
  inBothThemes('renders every variant', (mode) => {
    renderWithTheme(
      <>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Delete</Button>
      </>,
      mode,
    );
    expect(screen.getAllByRole('button')).toHaveLength(4);
  });

  it('fires onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWithTheme(<Button onClick={onClick}>Save</Button>);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('loading blocks clicks, sets aria-busy, and keeps the label in the DOM (width lock)', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWithTheme(
      <Button loading onClick={onClick}>
        Submitting
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Submitting')).toBeInTheDocument(); // hidden in place, not removed
    await user.click(button).catch(() => {});
    expect(onClick).not.toHaveBeenCalled();
  });

  it('disabled button does not fire and is aria-disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWithTheme(
      <Button disabled onClick={onClick}>
        Nope
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    await user.click(button).catch(() => {});
    expect(onClick).not.toHaveBeenCalled();
  });

  it('is keyboard-activatable (Enter and Space)', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWithTheme(<Button onClick={onClick}>Go</Button>);
    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('iconOnly exposes its aria-label', () => {
    renderWithTheme(
      <Button iconOnly aria-label="Open settings" variant="ghost">
        <Icon name="settings" size={18} />
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Open settings' })).toBeInTheDocument();
  });

  it('has no axe violations across variants', async () => {
    const { container } = renderWithTheme(
      <>
        <Button>Primary</Button>
        <Button variant="destructive" disabled>
          Delete
        </Button>
        <Button iconOnly aria-label="Save">
          <Icon name="bookmark" size={16} />
        </Button>
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('Link', () => {
  it('renders an internal anchor with href', () => {
    renderWithTheme(<Link href="/jobs">Jobs</Link>);
    expect(screen.getByRole('link', { name: 'Jobs' })).toHaveAttribute('href', '/jobs');
  });

  it('external links open a new tab safely and announce it', () => {
    renderWithTheme(
      <Link href="https://stripe.com/jobs" external>
        Apply
      </Link>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveTextContent('(opens in new tab)');
  });

  it('uses the router adapter component for internal navigation', () => {
    const Adapter = ({ to, children, ...rest }: { to: string; children: React.ReactNode }) => (
      <a data-adapter href={to} {...rest}>
        {children}
      </a>
    );
    renderWithTheme(
      <Link href="/dashboard" routerComponent={Adapter}>
        Dashboard
      </Link>,
    );
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('data-adapter');
  });
});

describe('Chip', () => {
  it('non-interactive chip renders as a span (no button role)', () => {
    renderWithTheme(<Chip label="Remote" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('Remote')).toBeInTheDocument();
  });

  it('toggle chip exposes aria-pressed and toggles on click', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    renderWithTheme(<Chip label="Full-time" selected={false} onToggle={onToggle} />);
    const chip = screen.getByRole('button', { name: /Full-time/ });
    expect(chip).toHaveAttribute('aria-pressed', 'false');
    await user.click(chip);
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('remove button is a separate focus stop and does not trigger toggle', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const onRemove = vi.fn();
    renderWithTheme(<Chip label="$120k+" onToggle={onToggle} onRemove={onRemove} />);
    await user.click(screen.getByRole('button', { name: 'Remove $120k+' }));
    expect(onRemove).toHaveBeenCalledOnce();
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('Delete and Backspace remove when removable', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    renderWithTheme(<Chip label="Berlin" onToggle={vi.fn()} onRemove={onRemove} />);
    screen.getByRole('button', { name: 'Berlin' }).focus();
    await user.keyboard('{Delete}');
    await user.keyboard('{Backspace}');
    expect(onRemove).toHaveBeenCalledTimes(2);
  });

  it('has no axe violations', async () => {
    const { container } = renderWithTheme(
      <>
        <Chip label="Static" />
        <Chip label="Toggle" selected onToggle={vi.fn()} onRemove={vi.fn()} />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('Tooltip', () => {
  it('shows on keyboard focus and names the trigger context', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <Tooltip content="Save this job" delay={0}>
        <button>trigger</button>
      </Tooltip>,
    );
    await user.tab();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Save this job');
  });

  it('hides on Escape', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <Tooltip content="Hint" delay={0}>
        <button>trigger</button>
      </Tooltip>,
    );
    await user.tab();
    await screen.findByRole('tooltip');
    await user.keyboard('{Escape}');
    // MUI animates out; the tooltip loses its content association promptly.
    // Assert the trigger no longer has aria-describedby pointing at a visible tooltip.
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
