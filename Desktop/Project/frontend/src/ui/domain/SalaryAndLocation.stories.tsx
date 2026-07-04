import type { Meta, StoryObj } from '@storybook/react';
import Box from '@mui/material/Box';
import { SalaryDisplay } from './SalaryDisplay';
import { LocationDisplay } from './LocationDisplay';

const meta: Meta = { title: 'Domain/SalaryDisplay · LocationDisplay' };
export default meta;

export const SalaryRanges: StoryObj = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <SalaryDisplay
        compensation={{ min: 180_000, max: 220_000, currency: 'USD', period: 'ANNUAL' }}
      />
      <SalaryDisplay
        compensation={{ min: 150_000, max: null, currency: 'USD', period: 'ANNUAL' }}
      />
      <SalaryDisplay
        compensation={{ min: null, max: 200_000, currency: 'USD', period: 'ANNUAL' }}
      />
      <SalaryDisplay compensation={null} />
      <Box sx={{ fontSize: 12, color: 'text.secondary' }}>
        ↑ undisclosed renders nothing (blank line above)
      </Box>
    </Box>
  ),
};

export const SalaryFullFormat: StoryObj = {
  render: () => (
    <SalaryDisplay
      format="full"
      compensation={{ min: 180_000, max: 220_000, currency: 'USD', period: 'ANNUAL' }}
    />
  ),
};

export const SalaryMultipleCurrencies: StoryObj = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <SalaryDisplay
        compensation={{ min: 80_000, max: 100_000, currency: 'EUR', period: 'ANNUAL' }}
        locale="de-DE"
      />
      <SalaryDisplay
        compensation={{ min: 60_000, max: 90_000, currency: 'GBP', period: 'ANNUAL' }}
        locale="en-GB"
      />
      <SalaryDisplay
        compensation={{ min: 8_000_000, max: 12_000_000, currency: 'JPY', period: 'ANNUAL' }}
        locale="ja-JP"
      />
    </Box>
  ),
};

export const SalaryIntervals: StoryObj = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <SalaryDisplay compensation={{ min: 40, max: 60, currency: 'USD', period: 'HOURLY' }} />
      <SalaryDisplay
        compensation={{ min: 8_000, max: 12_000, currency: 'USD', period: 'MONTHLY' }}
      />
    </Box>
  ),
};

export const LocationVariants: StoryObj = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <LocationDisplay city="San Francisco" region="CA" country="US" />
      <LocationDisplay city="San Francisco" region="CA" country="US" workplaceType="HYBRID" />
      <LocationDisplay workplaceType="REMOTE" />
      <LocationDisplay country="Germany" />
      <LocationDisplay city="Berlin" country="Germany" compact />
      <LocationDisplay
        city="San Francisco"
        region="CA"
        country="US"
        additionalLocations={['New York, NY', 'Austin, TX']}
      />
    </Box>
  ),
};
