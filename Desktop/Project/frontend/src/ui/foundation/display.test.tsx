import { screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { renderWithTheme, inBothThemes } from '@/test/renderWithTheme';
import { Typography } from './Typography';
import { Icon } from './Icon';
import { Badge } from './Badge';
import { Avatar } from './Avatar';
import { Divider } from './Divider';
import { Surface } from './Surface';

describe('Typography', () => {
  inBothThemes('renders the variant with scale styles', (mode) => {
    renderWithTheme(<Typography variant="h2">Page title</Typography>, mode);
    const el = screen.getByText('Page title');
    expect(el.tagName).toBe('H2');
    expect(el).toHaveStyle({ fontSize: '30px', fontWeight: 700 });
  });

  it('decouples semantic element from visual variant via `as`', () => {
    renderWithTheme(
      <Typography variant="h5" as="h2">
        Widget heading
      </Typography>,
    );
    expect(screen.getByText('Widget heading').tagName).toBe('H2');
  });

  it('applies single-line truncation styles', () => {
    renderWithTheme(
      <Typography variant="textMd" truncate={1}>
        Very long job title
      </Typography>,
    );
    expect(screen.getByText('Very long job title')).toHaveStyle({
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    });
  });

  it('applies tabular numerals when requested', () => {
    renderWithTheme(<Typography tabularNums>$180,000</Typography>);
    expect(screen.getByText('$180,000')).toHaveStyle({ fontVariantNumeric: 'tabular-nums' });
  });
});

describe('Icon', () => {
  it('is decorative (aria-hidden) by default', () => {
    const { container } = renderWithTheme(<Icon name="bookmark" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).not.toHaveAttribute('role');
  });

  it('becomes role=img with a name when label is passed', () => {
    renderWithTheme(<Icon name="bell" label="Notifications" />);
    expect(screen.getByRole('img', { name: 'Notifications' })).toBeInTheDocument();
  });

  it('inherits color and applies the requested size', () => {
    const { container } = renderWithTheme(<Icon name="check" size={24} />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('width', '24');
    expect(svg.getAttribute('stroke')).toBe('currentColor');
  });
});

describe('Badge', () => {
  inBothThemes('renders text with auto-composed status label', (mode) => {
    renderWithTheme(<Badge tone="success">Active</Badge>, mode);
    expect(screen.getByLabelText('Status: Active')).toHaveTextContent('Active');
  });

  it('dot mode renders an 8px named dot', () => {
    renderWithTheme(<Badge tone="accent" dot srLabel="Unread" />);
    const dot = screen.getByRole('img', { name: 'Unread' });
    expect(dot).toHaveStyle({ width: '8px', height: '8px' });
  });

  it('has no axe violations', async () => {
    const { container } = renderWithTheme(
      <>
        <Badge tone="warning">Expiring</Badge>
        <Badge tone="neutral" dot srLabel="Idle" />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('Avatar', () => {
  it('renders initials when no image is provided', () => {
    renderWithTheme(<Avatar name="Sam Ansari" size={40} />);
    expect(screen.getByRole('img', { name: 'Sam Ansari' })).toHaveTextContent('SA');
  });

  it('falls back to the generic icon without a name', () => {
    const { container } = renderWithTheme(<Avatar size={40} />);
    expect(screen.getByRole('img', { name: 'User avatar' })).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('shows the online status dot with an accessible name', () => {
    renderWithTheme(<Avatar name="Sam" status="online" />);
    expect(screen.getByRole('status', { name: 'Online' })).toBeInTheDocument();
  });

  it('single-word names produce a single initial', () => {
    renderWithTheme(<Avatar name="Priya" size={30} />);
    expect(screen.getByRole('img', { name: 'Priya' })).toHaveTextContent('P');
  });
});

describe('Divider', () => {
  it('renders a separator', () => {
    renderWithTheme(<Divider />);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('renders the labeled form', () => {
    renderWithTheme(<Divider label="or" />);
    expect(screen.getByText('or')).toBeInTheDocument();
  });
});

describe('Surface', () => {
  inBothThemes('inset level uses subtle background without border', (mode) => {
    renderWithTheme(
      <Surface level="inset">
        <span>content</span>
      </Surface>,
      mode,
    );
    const el = screen.getByText('content').parentElement!;
    expect(el).toHaveStyle({ borderRadius: '8px' });
  });

  it('warns in dev when raised nests inside raised', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderWithTheme(
      <Surface level="raised">
        <Surface level="raised">
          <span>nested</span>
        </Surface>
      </Surface>,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('must not nest'));
    warn.mockRestore();
  });

  it('renders the requested semantic element', () => {
    renderWithTheme(
      <Surface as="section" level="flat">
        <span>x</span>
      </Surface>,
    );
    expect(document.querySelector('section')).toBeInTheDocument();
  });
});
