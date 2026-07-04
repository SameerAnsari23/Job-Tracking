import type { Meta, StoryObj } from '@storybook/react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { typeScale } from './typography';

const meta: Meta = { title: 'Tokens/Typography' };
export default meta;

const SAMPLE = 'Software Engineer — Infrastructure at Stripe';

export const Scale: StoryObj = {
  render: () => (
    <Box sx={{ p: 8, display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 720 }}>
      {(Object.keys(typeScale) as Array<keyof typeof typeScale>).map((name) => {
        const t = typeScale[name];
        return (
          <Box key={name}>
            <Typography
              variant="caption"
              component="div"
              color="text.secondary"
              sx={{ mb: 1, fontVariantNumeric: 'tabular-nums' }}
            >
              {name} — {t.fontSize}/{t.lineHeight} · {t.fontWeight} · {t.letterSpacing}
            </Typography>
            <Box component="div" sx={{ ...t, fontFamily: 'inherit' }}>
              {SAMPLE}
            </Box>
          </Box>
        );
      })}
    </Box>
  ),
};

export const MuiVariants: StoryObj = {
  render: () => (
    <Box sx={{ p: 8, display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 720 }}>
      <Typography variant="h1">h1 — Page hero</Typography>
      <Typography variant="h2">h2 — Page title</Typography>
      <Typography variant="h3">h3 — Section title</Typography>
      <Typography variant="h4">h4 — Sub-section</Typography>
      <Typography variant="h5">h5 — Section heading</Typography>
      <Typography variant="h6">h6 — Widget heading</Typography>
      <Typography variant="subtitle1">subtitle1 — Card title (text-md)</Typography>
      <Typography variant="body1">body1 — Primary body text (text-base, 15px/24px)</Typography>
      <Typography variant="body2">body2 — Secondary body (text-sm, 13px/20px)</Typography>
      <Typography variant="caption">caption — Micro copy, timestamps (text-xs)</Typography>
      <Typography variant="overline">overline — Section label (label-xs)</Typography>
    </Box>
  ),
};
