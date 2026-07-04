import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { renderWithTheme, inBothThemes } from '@/test/renderWithTheme';
import { Metric } from './Metric';
import { KeyValue } from './KeyValue';

describe('Metric', () => {
  inBothThemes('renders label, value, and trend in stacked layout', (mode) => {
    renderWithTheme(
      <Metric label="Saved jobs" value={24} trend={{ direction: 'up', delta: '+3' }} />,
      mode,
    );
    expect(screen.getByText('Saved jobs')).toBeInTheDocument();
    expect(screen.getByText('24')).toBeInTheDocument();
    expect(screen.getByText('+3')).toBeInTheDocument();
  });

  it('renders the inline layout with label before value', () => {
    renderWithTheme(<Metric label="Open roles" value={142} unit="roles" layout="inline" />);
    expect(screen.getByText('Open roles')).toBeInTheDocument();
    expect(screen.getByText('roles')).toBeInTheDocument();
  });

  it('omits the trend row entirely when no trend is given', () => {
    renderWithTheme(<Metric label="Unread" value={3} />);
    expect(screen.queryByText(/[+-]/)).not.toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = renderWithTheme(
      <Metric
        label="Saved jobs"
        value={24}
        icon="bookmark"
        trend={{ direction: 'down', delta: '-1' }}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('KeyValue', () => {
  it('renders a definition list with key/value pairs', () => {
    renderWithTheme(<KeyValue pairs={[{ key: 'Location', value: 'San Francisco, CA' }]} />);
    expect(document.querySelector('dl')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
  });

  it('renders a copy button and fires onCopy with the raw value', async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn();
    renderWithTheme(
      <KeyValue pairs={[{ key: 'Job ID', value: 'abc-123', copyable: true }]} onCopy={onCopy} />,
    );
    await user.click(screen.getByRole('button', { name: 'Copy Job ID' }));
    expect(onCopy).toHaveBeenCalledWith('abc-123');
  });

  it('applies the mono face when requested', () => {
    renderWithTheme(<KeyValue pairs={[{ key: 'Source', value: 'greenhouse', mono: true }]} />);
    expect(screen.getByText('greenhouse')).toBeInTheDocument();
  });
});
