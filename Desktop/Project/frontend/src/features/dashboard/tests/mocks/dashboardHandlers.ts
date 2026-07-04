import { http, HttpResponse, delay } from 'msw';
import { env } from '@/app/env';

/**
 * Shared MSW handler factories for the Dashboard's five endpoints — reused
 * by both Storybook (browser worker) and Vitest (node server), mirroring
 * the Phase 18.0 pattern. Response shapes match the confirmed backend DTOs
 * exactly (JobSearchPageResultDto, UserProfileDto, DiscoveryPreferencesDto,
 * NotificationApplicationDto).
 */
const url = (path: string) => `${env.apiBaseUrl}${path}`;

export const PROFILE_FIXTURE = {
  headline: 'Backend Engineer',
  bio: null,
  location: null,
  avatarUrl: null,
  skills: [{ name: 'TypeScript', proficiency: 'ADVANCED', yearsOfExperience: 5 }],
  experience: [
    {
      id: 'exp-1',
      title: 'Senior Engineer',
      company: 'Acme',
      startDate: '2021-01-01T00:00:00.000Z',
      endDate: null,
      isCurrent: true,
      description: null,
      location: null,
    },
  ],
  education: [],
  resumeMetadata: {
    filename: 'resume.pdf',
    mimeType: 'application/pdf',
    fileSize: 102400,
    storageKey: 'resumes/u1.pdf',
    uploadedAt: '2025-01-01T00:00:00.000Z',
  },
  notificationPreferences: {
    channels: { email: { enabled: true }, telegram: { enabled: false, chatId: null } },
    events: { newMatch: true, dailyDigest: false, weeklyDigest: true, applicationUpdates: true },
  },
  jobSearchPreferences: {
    isOpenToWork: true,
    remotePreference: 'REMOTE',
    targetLocations: [],
    jobTypes: ['FULL_TIME'],
    targetTitles: ['Backend Engineer'],
    salaryExpectation: null,
    noticePeriodDays: 30,
  },
  completionScore: 72,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

export const DISCOVERY_FIXTURE = {
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
      priority: 'MEDIUM',
      isActive: true,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
  ],
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
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

export const NOTIFICATIONS_FIXTURE = [
  {
    id: 'notif-1',
    type: 'NEW_MATCH',
    title: 'New match found',
    message: 'Backend Engineer at Acme matches your profile.',
    metadata: {},
    isRead: false,
    createdAt: new Date(Date.now() - 1800_000).toISOString(),
    readAt: null,
  },
  {
    id: 'notif-2',
    type: 'APPLICATION_UPDATE',
    title: 'Application viewed',
    message: 'Globex viewed your application.',
    metadata: {},
    isRead: true,
    createdAt: new Date(Date.now() - 86400_000).toISOString(),
    readAt: new Date(Date.now() - 80000_000).toISOString(),
  },
];

export const profileSuccessHandler = http.get(url('/profile/me'), () =>
  HttpResponse.json({ success: true, data: PROFILE_FIXTURE }),
);
export const discoverySuccessHandler = http.get(url('/discovery'), () =>
  HttpResponse.json({ success: true, data: DISCOVERY_FIXTURE }),
);
export const recommendationsSuccessHandler = http.get(url('/jobs/recommendations'), () =>
  HttpResponse.json({ success: true, data: RECOMMENDATIONS_FIXTURE }),
);
export const savedJobsSuccessHandler = http.get(url('/jobs/saved'), () =>
  HttpResponse.json({
    success: true,
    data: { items: RECOMMENDATIONS_FIXTURE.items.slice(0, 1), nextCursor: null, hasMore: false },
  }),
);
export const notificationsSuccessHandler = http.get(url('/notifications'), () =>
  HttpResponse.json({ success: true, data: { items: NOTIFICATIONS_FIXTURE } }),
);

export const dashboardSuccessHandlers = [
  profileSuccessHandler,
  discoverySuccessHandler,
  recommendationsSuccessHandler,
  savedJobsSuccessHandler,
  notificationsSuccessHandler,
];

export const dashboardEmptyHandlers = [
  http.get(url('/profile/me'), () =>
    HttpResponse.json({
      success: true,
      data: { ...PROFILE_FIXTURE, skills: [], experience: [], resumeMetadata: null, headline: null, completionScore: 10 },
    }),
  ),
  http.get(url('/discovery'), () =>
    HttpResponse.json({ success: true, data: { ...DISCOVERY_FIXTURE, profiles: [] } }),
  ),
  http.get(url('/jobs/recommendations'), () =>
    HttpResponse.json({ success: true, data: { items: [], nextCursor: null, hasMore: false } }),
  ),
  http.get(url('/jobs/saved'), () =>
    HttpResponse.json({ success: true, data: { items: [], nextCursor: null, hasMore: false } }),
  ),
  http.get(url('/notifications'), () => HttpResponse.json({ success: true, data: { items: [] } })),
];

export const dashboardErrorHandlers = [
  http.get(url('/profile/me'), () =>
    HttpResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' } },
      { status: 500 },
    ),
  ),
  http.get(url('/discovery'), () =>
    HttpResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' } },
      { status: 500 },
    ),
  ),
  http.get(url('/jobs/recommendations'), () =>
    HttpResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' } },
      { status: 500 },
    ),
  ),
  http.get(url('/jobs/saved'), () =>
    HttpResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' } },
      { status: 500 },
    ),
  ),
  http.get(url('/notifications'), () =>
    HttpResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' } },
      { status: 500 },
    ),
  ),
];

/** Adds a visible delay so Storybook loading states are actually observable. */
export const dashboardLoadingHandlers = [
  http.get(url('/profile/me'), async () => {
    await delay('infinite');
    return HttpResponse.json({ success: true, data: PROFILE_FIXTURE });
  }),
  http.get(url('/discovery'), async () => {
    await delay('infinite');
    return HttpResponse.json({ success: true, data: DISCOVERY_FIXTURE });
  }),
  http.get(url('/jobs/recommendations'), async () => {
    await delay('infinite');
    return HttpResponse.json({ success: true, data: RECOMMENDATIONS_FIXTURE });
  }),
  http.get(url('/jobs/saved'), async () => {
    await delay('infinite');
    return HttpResponse.json({ success: true, data: { items: [], nextCursor: null, hasMore: false } });
  }),
  http.get(url('/notifications'), async () => {
    await delay('infinite');
    return HttpResponse.json({ success: true, data: { items: [] } });
  }),
];
