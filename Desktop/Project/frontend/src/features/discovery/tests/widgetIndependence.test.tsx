import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/server';
import { env } from '@/app/env';
import { signIn, renderDiscovery } from './testUtils';
import { DiscoveryPage } from '../pages/DiscoveryPage';
import {
  PREFERENCES_FIXTURE,
  RECOMMENDATIONS_FIXTURE,
  preferencesSuccessHandler,
} from './mocks/discoveryHandlers';

const url = (path: string) => `${env.apiBaseUrl}${path}`;

/**
 * The backend exposes profiles/companies/settings through exactly ONE
 * endpoint, so those widgets necessarily share one query and one failure
 * mode together (see useDiscoveryPreferences.ts) — but Discovery Activity
 * is a genuinely separate endpoint. These tests prove that boundary holds:
 * a failure/slowness on one side never touches the other, and retrying one
 * never refetches the other.
 */
describe('Discovery — widget independence', () => {
  beforeEach(() => signIn());

  it('a failing Discovery Activity does not affect the preferences-derived widgets', async () => {
    server.use(
      preferencesSuccessHandler,
      http.get(url('/jobs/recommendations'), () =>
        HttpResponse.json(
          { success: false, error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' } },
          { status: 500 },
        ),
      ),
    );
    renderDiscovery(<DiscoveryPage />);

    expect(await screen.findByText('Backend roles')).toBeInTheDocument();
    expect(screen.getByText('1 of 2 profiles active')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
  });

  it('a failing preferences query does not affect Discovery Activity', async () => {
    server.use(
      http.get(url('/discovery'), () =>
        HttpResponse.json(
          { success: false, error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' } },
          { status: 500 },
        ),
      ),
      http.get(url('/jobs/recommendations'), () =>
        HttpResponse.json({ success: true, data: RECOMMENDATIONS_FIXTURE }),
      ),
    );
    renderDiscovery(<DiscoveryPage />);

    expect(await screen.findByText('Backend Engineer at Acme')).toBeInTheDocument();
    // Every widget backed by /discovery shows the shared failure.
    expect(screen.getAllByText('Something went wrong.').length).toBeGreaterThan(0);
  });

  it('a slow Discovery Activity does not block the faster preferences widgets from rendering', async () => {
    server.use(
      preferencesSuccessHandler,
      http.get(url('/jobs/recommendations'), async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return HttpResponse.json({ success: true, data: RECOMMENDATIONS_FIXTURE });
      }),
    );
    renderDiscovery(<DiscoveryPage />);

    expect(await screen.findByText('Backend roles')).toBeInTheDocument();
    // Activity is still loading at this point — its own region announces so.
    expect(screen.getByRole('status', { name: 'Loading Discovery Activity' })).toBeInTheDocument();

    expect(await screen.findByText('Backend Engineer at Acme', {}, { timeout: 2000 })).toBeInTheDocument();
  });

  it('retrying the preferences query does not refetch Discovery Activity', async () => {
    let preferencesCalls = 0;
    let recommendationsCalls = 0;
    server.use(
      http.get(url('/discovery'), () => {
        preferencesCalls += 1;
        return preferencesCalls === 1
          ? HttpResponse.json(
              { success: false, error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' } },
              { status: 500 },
            )
          : HttpResponse.json({ success: true, data: PREFERENCES_FIXTURE });
      }),
      http.get(url('/jobs/recommendations'), () => {
        recommendationsCalls += 1;
        return HttpResponse.json({ success: true, data: RECOMMENDATIONS_FIXTURE });
      }),
    );
    const user = userEvent.setup();
    renderDiscovery(<DiscoveryPage />);

    await screen.findByText('Backend Engineer at Acme');
    await waitFor(() => expect(recommendationsCalls).toBe(1));
    expect(screen.getAllByText('Something went wrong.').length).toBeGreaterThan(0);

    await user.click(screen.getAllByRole('button', { name: 'Try again' })[0]!);

    await waitFor(() => expect(screen.getByText('Backend roles')).toBeInTheDocument());
    expect(preferencesCalls).toBe(2);
    expect(recommendationsCalls).toBe(1);
  });
});
