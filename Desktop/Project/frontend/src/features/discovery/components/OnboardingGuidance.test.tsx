import { screen, waitFor } from '@testing-library/react';
import { server } from '@/test/server';
import { renderDiscovery } from '../tests/testUtils';
import { OnboardingGuidance } from './OnboardingGuidance';
import { preferencesSuccessHandler, preferencesEmptyHandler } from '../tests/mocks/discoveryHandlers';

describe('OnboardingGuidance', () => {
  it('shows guidance when there are no discovery profiles', async () => {
    server.use(preferencesEmptyHandler);
    renderDiscovery(<OnboardingGuidance />);
    expect(
      await screen.findByText('Set up discovery to get matched automatically'),
    ).toBeInTheDocument();
  });

  it('renders nothing once real profiles exist', async () => {
    server.use(preferencesSuccessHandler);
    const { container } = renderDiscovery(<OnboardingGuidance />);
    await waitFor(() => expect(container).toBeEmptyDOMElement());
    // Give the query time to resolve, then confirm it's still empty (not
    // just empty because loading/error also render null).
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(container).toBeEmptyDOMElement();
  });
});
