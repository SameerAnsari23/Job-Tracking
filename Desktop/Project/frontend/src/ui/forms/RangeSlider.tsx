import { useId, useState } from 'react';
import Box from '@mui/material/Box';
import MuiSlider from '@mui/material/Slider';
import OutlinedInput from '@mui/material/OutlinedInput';
import { useTheme } from '@mui/material/styles';
import { accent, accentDark, neutralLight, neutralDark, typeScale } from '@/theme';

export interface RangeSliderProps {
  /** Group label ("Salary range"). */
  label: string;
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  /**
   * Commits on slider RELEASE and on input blur/Enter (Phase 16.3 — no
   * query spam while dragging).
   */
  onChange: (value: [number, number]) => void;
  /** Formats values for display and aria-valuetext ("$80,000"). */
  format?: (value: number) => string;
  disabled?: boolean;
}

/**
 * Dual-thumb range with paired number inputs — the INPUTS are the
 * accessible source of truth; the slider is a pointer enhancement
 * (Phase 16.4). 16px accent thumbs on a neutral track.
 */
export function RangeSlider({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  format = String,
  disabled = false,
}: RangeSliderProps) {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const n = dark ? neutralDark : neutralLight;
  const a = dark ? accentDark : accent;
  const groupId = useId();

  // Local drag state — parent sees values only on commit.
  const [draft, setDraft] = useState<[number, number] | null>(null);
  const [inputs, setInputs] = useState<[string, string] | null>(null);

  const shown = draft ?? value;
  const inputShown = inputs ?? [String(shown[0]), String(shown[1])];

  const clamp = (v: number) => Math.max(min, Math.min(max, v));

  const commitInput = (index: 0 | 1) => {
    const parsed = Number(inputShown[index]);
    setInputs(null);
    if (Number.isNaN(parsed)) return;
    const next: [number, number] = [...value];
    next[index] = clamp(parsed);
    if (next[0] > next[1]) next.sort((x, y) => x - y);
    onChange(next);
  };

  return (
    <Box
      role="group"
      aria-labelledby={`${groupId}-label`}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <Box
        id={`${groupId}-label`}
        sx={{ ...typeScale.textSm, fontWeight: 500, color: theme.palette.text.primary }}
      >
        {label}
      </Box>
      <Box sx={{ px: 2 }}>
        <MuiSlider
          value={shown}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={(_, v) => setDraft(v as [number, number])}
          onChangeCommitted={(_, v) => {
            setDraft(null);
            onChange(v as [number, number]);
          }}
          getAriaLabel={(index) => `${label} ${index === 0 ? 'minimum' : 'maximum'}`}
          getAriaValueText={format}
          valueLabelDisplay="auto"
          valueLabelFormat={format}
          sx={{
            color: a[500],
            height: 4,
            '& .MuiSlider-thumb': {
              width: 16,
              height: 16,
              backgroundColor: a[500],
              '&:hover, &.Mui-focusVisible': { boxShadow: `0 0 0 4px ${a[200]}` },
            },
            '& .MuiSlider-rail': { backgroundColor: n[200], opacity: 1 },
          }}
        />
      </Box>
      <Box sx={{ display: 'flex', gap: 3 }}>
        {([0, 1] as const).map((index) => (
          <OutlinedInput
            key={index}
            value={inputShown[index]}
            disabled={disabled}
            onChange={(e) => {
              const next: [string, string] = [...inputShown];
              next[index] = e.target.value;
              setInputs(next);
            }}
            onBlur={() => commitInput(index)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitInput(index);
            }}
            inputProps={{
              inputMode: 'numeric',
              'aria-label': `${label} ${index === 0 ? 'minimum' : 'maximum'} value`,
            }}
            fullWidth
            sx={{ height: 36, '& input': { fontVariantNumeric: 'tabular-nums' } }}
          />
        ))}
      </Box>
    </Box>
  );
}
