import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import Box from '@mui/material/Box';
import { JobCard } from './JobCard';
import type { JobCardData } from './JobCard';
import { CompanyCard } from './CompanyCard';
import { ProfileCard } from './ProfileCard';
import { DiscoveryCard } from './DiscoveryCard';
import { Button } from '../foundation/Button';

const meta: Meta = { title: 'Data Display/JobCard · CompanyCard · ProfileCard · DiscoveryCard' };
export default meta;

const JOB: JobCardData = {
  id: '1',
  title: 'Software Engineer, Infrastructure',
  companyName: 'Stripe',
  location: 'San Francisco, CA',
  workplaceType: 'REMOTE',
  employmentTypeLabel: 'Full-time',
  compensation: { min: 180_000, max: 220_000, currency: 'USD', period: 'ANNUAL' },
  isNew: true,
  postedAt: '2h ago',
  skills: ['Go', 'Kubernetes', 'PostgreSQL'],
};

export const JobCardVariants: StoryObj = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 640 }}>
      <JobCard job={JOB} variant="compact" onSave={() => {}} />
      <JobCard job={JOB} variant="standard" onSave={() => {}} onSelect={() => {}} />
      <JobCard job={JOB} variant="featured" onSave={() => {}} saved />
      <JobCard.Skeleton variant="standard" />
    </Box>
  ),
};

export const JobCardNoCompensation: StoryObj = {
  render: () => (
    <Box sx={{ maxWidth: 640 }}>
      <JobCard job={{ ...JOB, compensation: null, employmentTypeLabel: null }} onSave={() => {}} />
    </Box>
  ),
};

function SaveToggleDemo() {
  const [saved, setSaved] = useState(false);
  return <JobCard job={JOB} saved={saved} onSave={() => setSaved((s) => !s)} />;
}

export const SaveInteraction: StoryObj = {
  render: () => <SaveToggleDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const save = canvas.getByRole('button', { name: /Save/ });
    await userEvent.click(save);
    await expect(canvas.getByRole('button', { name: /Unsave/ })).toBeInTheDocument();
  },
};

export const CompanyCards: StoryObj = {
  render: () => (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
      <CompanyCard
        name="Stripe"
        rating={4.6}
        hiringStatus="actively-hiring"
        openPositions={142}
        description="Financial infrastructure for the internet."
        followSlot={
          <Button variant="secondary" size="sm">
            Follow
          </Button>
        }
      />
      <CompanyCard name="Notion" hiringStatus="selectively-hiring" openPositions={12} />
    </Box>
  ),
};

export const ProfileCards: StoryObj = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 420 }}>
      <ProfileCard
        name="Sam Ansari"
        title="Senior Product Manager"
        completion={75}
        skills={['Product Strategy', 'SQL', 'Figma']}
        badges={[{ label: 'Open to work', tone: 'success' }]}
        actions={
          <Button variant="ghost" size="sm">
            Edit profile
          </Button>
        }
      />
      <ProfileCard name="Sam Ansari" title="Senior Product Manager" compact />
    </Box>
  ),
};

export const DiscoveryCards: StoryObj = {
  render: () => (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
      <DiscoveryCard
        label="Backend Engineer"
        active
        priority="HIGH"
        watchedCompanies={['Stripe', 'Notion', 'Vercel', 'Figma', 'Linear']}
        notificationFrequency="Daily digest"
        lastExecution="15 minutes ago"
        onPause={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
      <DiscoveryCard
        label="Product Manager"
        active={false}
        priority="LOW"
        watchedCompanies={['Airbnb']}
        onResume={() => {}}
        onEdit={() => {}}
      />
    </Box>
  ),
};

export const DiscoveryCardExpandWatchlist: StoryObj = {
  render: () => (
    <DiscoveryCard
      label="Backend Engineer"
      active
      watchedCompanies={['Stripe', 'Notion', 'Vercel', 'Figma', 'Linear']}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '+2 more' }));
    await expect(canvas.getByText('Linear')).toBeInTheDocument();
  },
};
