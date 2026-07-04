import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { Icon } from '../foundation/Icon';
import { Typography } from '../foundation/Typography';

export interface KeyValuePair {
  key: string;
  value: string;
  mono?: boolean;
  /** Shows a copy button next to this row's value. */
  copyable?: boolean;
}

export interface KeyValueProps {
  pairs: KeyValuePair[];
  /** vertical stacks key above value per row; inline is a 2-column row. */
  layout?: 'inline' | 'vertical';
  /** Copy handler — receives the value; component never touches the clipboard API itself. */
  onCopy?: (value: string) => void;
}

/**
 * Definition list (job details, admin config — Phase 16.4). Inline mode
 * collapses to vertical below `sm` automatically; `layout="vertical"`
 * forces it everywhere.
 */
export function KeyValue({ pairs, layout = 'inline', onCopy }: KeyValueProps) {
  const forcedVertical = layout === 'vertical';

  return (
    <Box component="dl" sx={{ m: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {pairs.map((pair) => (
        <Box
          key={pair.key}
          sx={{
            display: 'flex',
            flexDirection: forcedVertical ? 'column' : { xs: 'column', sm: 'row' },
            gap: forcedVertical ? 0.5 : { xs: 0.5, sm: 4 },
          }}
        >
          <Box component="dt" sx={{ width: forcedVertical ? 'auto' : { sm: 140 }, flexShrink: 0 }}>
            <Typography variant="textSm" color="secondary">
              {pair.key}
            </Typography>
          </Box>
          <Box
            component="dd"
            sx={{ m: 0, flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 2 }}
          >
            <Typography variant="textSm" mono={pair.mono} truncate={1}>
              {pair.value}
            </Typography>
            {pair.copyable && (
              <IconButton
                aria-label={`Copy ${pair.key}`}
                size="small"
                onClick={() => onCopy?.(pair.value)}
              >
                <Icon name="copy" size={14} />
              </IconButton>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
