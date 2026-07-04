import type { Meta, StoryObj } from '@storybook/react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import {
  accent,
  accentDark,
  neutralLight,
  neutralDark,
  semanticLight,
  semanticDark,
  sidebar,
  chartsLight,
} from './colors';

/**
 * Token showcase — rendered FROM the token objects so these stories cannot
 * drift from the implementation. Use the toolbar to flip light/dark.
 */
const meta: Meta = { title: 'Tokens/Colors' };
export default meta;

function Swatch({ name, value, dark }: { name: string; value: string; dark?: boolean }) {
  return (
    <Box sx={{ width: 108 }}>
      <Box
        sx={{
          height: 48,
          borderRadius: 1.5,
          bgcolor: value,
          border: '1px solid',
          borderColor: 'divider',
        }}
      />
      <Typography variant="caption" component="div" sx={{ mt: 1, fontWeight: 500 }}>
        {name}
        {dark ? ' (dark)' : ''}
      </Typography>
      <Typography variant="caption" component="div" color="text.secondary">
        {value}
      </Typography>
    </Box>
  );
}

function Row({
  title,
  scale,
  dark,
}: {
  title: string;
  scale: Record<string, string>;
  dark?: boolean;
}) {
  return (
    <Box sx={{ mb: 8 }}>
      <Typography variant="overline" component="div" sx={{ mb: 2, color: 'text.secondary' }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {Object.entries(scale).map(([k, v]) => (
          <Swatch key={k} name={k} value={v} dark={dark} />
        ))}
      </Box>
    </Box>
  );
}

export const Scales: StoryObj = {
  render: function ScalesStory() {
    const theme = useTheme();
    const dark = theme.palette.mode === 'dark';
    return (
      <Box sx={{ p: 8 }}>
        <Row title="Accent" scale={dark ? accentDark : accent} dark={dark} />
        <Row title="Neutral" scale={dark ? neutralDark : neutralLight} dark={dark} />
        <Row title="Semantic" scale={dark ? semanticDark : semanticLight} dark={dark} />
        <Row title="Sidebar (always dark — both themes)" scale={sidebar} />
        <Row
          title="Charts"
          scale={{
            series1: chartsLight.series1,
            series2: chartsLight.series2,
            series3: chartsLight.series3,
          }}
        />
      </Box>
    );
  },
};
