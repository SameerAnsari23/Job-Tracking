import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { server } from '@/test/server';
import { env } from '@/app/env';
import { http, HttpResponse } from 'msw';
import { renderDashboard } from '../tests/testUtils';
import { OnboardingProgressWidget } from './OnboardingProgressWidget';
import { profileSuccessHandler } from '../tests/mocks/dashboardHandlers';

const url = (path: string) => `${env.apiBaseUrl}${path}`;

describe('OnboardingProgressWidget', () => {
  it('shows the loading skeleton before data arrives', () => {
    server.use(profileSuccessHandler);
    renderDashboard(<OnboardingProgressWidget />);
    expect(screen.getByRole('status', { name: 'Loading Onboarding' })).toBeInTheDocument();
  });

  it('renders the real completion score and a checklist derived from real fields', async () => {
    server.use(profileSuccessHandler);
    renderDashboard(<OnboardingProgressWidget />);

    expect(await screen.findByText('72%')).toBeInTheDocument();
    expect(screen.getByText('Add a headline')).toBeInTheDocument();
    expect(screen.getByText('Add skills')).toBeInTheDocument();
    expect(screen.getByText('Upload a resume')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Complete your profile' })).toBeInTheDocument();
  });

  it('omits the completion CTA once the profile is 100% complete', async () => {
    server.use(
      http.get(url('/profile/me'), () =>
        HttpResponse.json({
          success: true,
          data: {
            headline: 'x',
            skills: [{ name: 'x' }],
            experience: [{ id: '1' }],
            resumeMetadata: { filename: 'x' },
            jobSearchPreferences: { targetTitles: ['x'] },
            completionScore: 100,
          },
        }),
      ),
    );
    renderDashboard(<OnboardingProgressWidget />);
    await screen.findByText('100%');
    expect(screen.queryByRole('link', { name: 'Complete your profile' })).not.toBeInTheDocument();
  });

  it('shows an error with retry, and retry refetches', async () => {
    let calls = 0;
    server.use(
      http.get(url('/profile/me'), () => {
        calls += 1;
        return calls === 1
          ? HttpResponse.json(
              { success: false, error: { code: 'INTERNAL_ERROR', message: 'Could not load your profile.' } },
              { status: 500 },
            )
          : HttpResponse.json({
              success: true,
              data: {
                headline: 'x',
                skills: [],
                experience: [],
                resumeMetadata: null,
                jobSearchPreferences: { targetTitles: [] },
                completionScore: 40,
              },
            });
      }),
    );
    const user = userEvent.setup();
    renderDashboard(<OnboardingProgressWidget />);

    expect(await screen.findByText('Could not load your profile.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('40%')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    server.use(profileSuccessHandler);
    const { container } = renderDashboard(<OnboardingProgressWidget />);
    await screen.findByText('72%');
    expect(await axe(container)).toHaveNoViolations();
  });
});
