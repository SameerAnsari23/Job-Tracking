import { http, HttpResponse, delay } from 'msw';
import { env } from '@/app/env';

const url = (path: string) => `${env.apiBaseUrl}${path}`;

export const PREFERENCES_FIXTURE = {
  userId: 'user-1',
  isActive: true,
  globalSettings: {
    defaultRemotePreference: 'REMOTE',
    defaultNotificationFrequency: 'DAILY',
    defaultPriority: 'MEDIUM',
  },
  profiles: [
    {
      id: 'profile-1',
      label: 'Backend roles',
      targetRoles: [],
      requiredSkills: [],
      preferredSkills: [],
      experienceLevels: [],
      watchedCompanies: [
        { name: 'Acme', normalizedName: 'acme', domain: null },
        { name: 'Globex', normalizedName: 'globex', domain: null },
      ],
      targetLocations: [],
      remotePreference: 'REMOTE',
      employmentTypes: ['FULL_TIME'],
      salaryExpectation: null,
      notificationFrequency: 'DAILY',
      priority: 'HIGH',
      isActive: true,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'profile-2',
      label: 'Platform roles',
      targetRoles: [],
      requiredSkills: [],
      preferredSkills: [],
      experienceLevels: [],
      watchedCompanies: [{ name: 'Initech', normalizedName: 'initech', domain: null }],
      targetLocations: [],
      remotePreference: 'HYBRID',
      employmentTypes: ['FULL_TIME'],
      salaryExpectation: null,
      notificationFrequency: 'WEEKLY',
      priority: 'MEDIUM',
      isActive: false,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
  ],
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

export const EMPTY_PREFERENCES_FIXTURE = {
  ...PREFERENCES_FIXTURE,
  isActive: false,
  profiles: [],
};

function jobFixture(jobId: string, title: string, companyName: string, publishedAt: string) {
  return {
    jobId,
    title,
    companyName,
    location: { city: 'Remote', region: null, countryCode: null, isRemote: true, isHybrid: false },
    workplaceType: 'REMOTE',
    employmentTypes: ['FULL_TIME'],
    compensationSummary: null,
    source: 'greenhouse',
    applyUrl: 'https://example.com/apply',
    publishedAt,
    lastChangedAt: null,
  };
}

export const RECOMMENDATIONS_FIXTURE = {
  items: [
    jobFixture('job-1', 'Backend Engineer', 'Acme', new Date(Date.now() - 3600_000).toISOString()),
    jobFixture('job-2', 'Platform Engineer', 'Globex', new Date(Date.now() - 7200_000).toISOString()),
  ],
  nextCursor: null,
  hasMore: false,
};

export const preferencesSuccessHandler = http.get(url('/discovery'), () =>
  HttpResponse.json({ success: true, data: PREFERENCES_FIXTURE }),
);
export const preferencesEmptyHandler = http.get(url('/discovery'), () =>
  HttpResponse.json({ success: true, data: EMPTY_PREFERENCES_FIXTURE }),
);
export const preferencesErrorHandler = http.get(url('/discovery'), () =>
  HttpResponse.json(
    { success: false, error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' } },
    { status: 500 },
  ),
);
export const preferencesLoadingHandler = http.get(url('/discovery'), async () => {
  await delay('infinite');
  return HttpResponse.json({ success: true, data: PREFERENCES_FIXTURE });
});

export const recommendationsSuccessHandler = http.get(url('/jobs/recommendations'), () =>
  HttpResponse.json({ success: true, data: RECOMMENDATIONS_FIXTURE }),
);
export const recommendationsEmptyHandler = http.get(url('/jobs/recommendations'), () =>
  HttpResponse.json({ success: true, data: { items: [], nextCursor: null, hasMore: false } }),
);
export const recommendationsErrorHandler = http.get(url('/jobs/recommendations'), () =>
  HttpResponse.json(
    { success: false, error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' } },
    { status: 500 },
  ),
);
export const recommendationsLoadingHandler = http.get(url('/jobs/recommendations'), async () => {
  await delay('infinite');
  return HttpResponse.json({ success: true, data: RECOMMENDATIONS_FIXTURE });
});

export const pauseProfileHandler = http.post(url('/discovery/profiles/:profileId/pause'), () =>
  HttpResponse.json({ success: true, data: PREFERENCES_FIXTURE }),
);
export const resumeProfileHandler = http.post(url('/discovery/profiles/:profileId/resume'), () =>
  HttpResponse.json({ success: true, data: PREFERENCES_FIXTURE }),
);
export const deleteProfileHandler = http.delete(url('/discovery/profiles/:profileId'), () =>
  HttpResponse.json({ success: true, data: PREFERENCES_FIXTURE }),
);
export const activateHandler = http.post(url('/discovery/activate'), () =>
  HttpResponse.json({ success: true, data: PREFERENCES_FIXTURE }),
);
export const deactivateHandler = http.post(url('/discovery/deactivate'), () =>
  HttpResponse.json({ success: true, data: PREFERENCES_FIXTURE }),
);

export const discoverySuccessHandlers = [preferencesSuccessHandler, recommendationsSuccessHandler];
export const discoveryEmptyHandlers = [preferencesEmptyHandler, recommendationsEmptyHandler];
export const discoveryErrorHandlers = [preferencesErrorHandler, recommendationsErrorHandler];
export const discoveryLoadingHandlers = [preferencesLoadingHandler, recommendationsLoadingHandler];
export const discoveryMutationHandlers = [
  pauseProfileHandler,
  resumeProfileHandler,
  deleteProfileHandler,
  activateHandler,
  deactivateHandler,
];
