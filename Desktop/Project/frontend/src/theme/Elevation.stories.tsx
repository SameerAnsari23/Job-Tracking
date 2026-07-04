import type { Meta, StoryObj } from '@storybook/react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { shadowsLight, shadowsDark } from './shadows';
import { radius } from './radius';
import { space } from './spacing';

const meta: Meta = { title: 'Tokens/Elevation & Spacing' };
export default meta;

export const Shadows: StoryObj = {
  render: function ShadowsStory() {
    const theme = useTheme();
    const sh = theme.palette.mode === 'dark' ? shadowsDark : shadowsLight;
    return (
      <Box sx={{ p: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {(Object.keys(sh) as Array<keyof typeof sh>).map((k) => (
          <Box key={k} sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                width: 120,
                height: 80,
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: sh[k],
              }}
            />
            <Typography variant="caption" sx={{ mt: 2, display: 'block' }}>
              shadow-{k}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  },
};

export const Radius: StoryObj = {
  render: () => (
    <Box sx={{ p: 12, display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
      {(Object.entries(radius) as Array<[string, number]>).map(([k, v]) => (
        <Box key={k} sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'primary.light',
              borderRadius: `${Math.min(v, 40)}px`,
            }}
          />
          <Typography variant="caption" sx={{ mt: 2, display: 'block' }}>
            {k} ({v}px)
          </Typography>
        </Box>
      ))}
    </Box>
  ),
};

export const Spacing: StoryObj = {
  render: () => (
    <Box sx={{ p: 12, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {(Object.entries(space) as Array<[string, number]>).map(([k, v]) => (
        <Box key={k} sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Typography
            variant="caption"
            sx={{ width: 96, fontVariantNumeric: 'tabular-nums', color: 'text.secondary' }}
          >
            space-{k} · {v}px
          </Typography>
          <Box sx={{ height: 16, width: v, bgcolor: 'primary.main', borderRadius: 0.5 }} />
        </Box>
      ))}
    </Box>
  ),
};
