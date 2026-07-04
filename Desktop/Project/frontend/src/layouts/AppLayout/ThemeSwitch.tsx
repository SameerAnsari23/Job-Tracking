import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import { Icon } from '@/ui/foundation/Icon';
import { Tooltip } from '@/ui/foundation/Tooltip';
import { useUiStore } from '@/shared/stores/uiStore';

/**
 * Toggles the resolved theme (light ↔ dark), including out of 'system' —
 * clicking always commits to the opposite of whatever is currently
 * displayed, since theme.palette.mode is already the resolved value
 * (Providers.tsx handles the 'system' → prefers-color-scheme resolution).
 */
export function ThemeSwitch() {
  const theme = useTheme();
  const setThemeMode = useUiStore((s) => s.setThemeMode);
  const isDark = theme.palette.mode === 'dark';
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <Tooltip content={label}>
      <IconButton aria-label={label} onClick={() => setThemeMode(isDark ? 'light' : 'dark')}>
        <Icon name={isDark ? 'sun' : 'moon'} size={18} />
      </IconButton>
    </Tooltip>
  );
}
