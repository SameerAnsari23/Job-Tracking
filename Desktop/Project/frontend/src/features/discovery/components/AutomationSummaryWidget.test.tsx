import { screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { server } from '@/test/server';
import { renderDiscovery } from '../tests/testUtils';
import { AutomationSummaryWidget } from './AutomationSummaryWidget';
import { preferencesSuccessHandler, preferencesErrorHandler } from '../tests/mocks/discoveryHandlers';

describe('AutomationSummaryWidget', () => {
  it('renders real on/off state, active count, and global defaults', async () => {
    server.use(preferencesSuccessHandler);
    renderDiscovery(<AutomationSummaryWidget />);

    expect(await screen.findByText('On')).toBeInTheDocument();
    expect(screen.getByText('1/2')).toBeInTheDocument();
    expect(screen.getByText('Remote')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('shows an error with retry', async () => {
    server.use(preferencesErrorHandler);
    renderDiscovery(<AutomationSummaryWidget />);
    expect(await screen.findByText('Something went wrong.')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    server.use(preferencesSuccessHandler);
    const { container } = renderDiscovery(<AutomationSummaryWidget />);
    await screen.findByText('On');
    expect(await axe(container)).toHaveNoViolations();
  });
});
