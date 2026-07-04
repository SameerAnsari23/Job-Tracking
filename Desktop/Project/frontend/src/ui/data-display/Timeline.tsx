import { Fragment, useState } from 'react';
import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import ButtonBase from '@mui/material/ButtonBase';
import { useTheme } from '@mui/material/styles';
import { accent, accentDark, neutralLight, neutralDark, duration, easing } from '@/theme';
import { Icon } from '../foundation/Icon';
import type { IconName } from '../foundation/Icon';
import { Typography } from '../foundation/Typography';

export type TimelineTone = 'neutral' | 'accent' | 'success' | 'warning' | 'error';

export interface TimelineItem {
  id: string;
  icon?: IconName;
  tone?: TimelineTone;
  title: string;
  /** Preformatted display string — no date computation happens here. */
  timestamp?: string;
  description?: ReactNode;
  /** Renders a chevron toggle; description starts collapsed. */
  expandable?: boolean;
  defaultExpanded?: boolean;
  /** Accent dot + connecting bar — the "current role" treatment. */
  current?: boolean;
  /** Group header text rendered ABOVE this item when it differs from the previous item's group. */
  group?: string;
}

export interface TimelineProps {
  items: TimelineItem[];
}

function TimelineEntry({ item }: { item: TimelineItem }) {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const n = dark ? neutralDark : neutralLight;
  const a = dark ? accentDark : accent;
  const [expanded, setExpanded] = useState(item.defaultExpanded ?? false);

  const toneColor: Record<TimelineTone, string> = {
    neutral: n[300],
    accent: a[500],
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
  };
  const dotColor = item.current ? a[500] : toneColor[item.tone ?? 'neutral'];

  return (
    <Box component="li" sx={{ display: 'flex', gap: 4, position: 'relative' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: 20,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            width: item.icon ? 20 : 8,
            height: item.icon ? 20 : 8,
            borderRadius: '50%',
            backgroundColor: item.icon ? 'transparent' : dotColor,
            border: item.icon ? `1.5px solid ${dotColor}` : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: dotColor,
            flexShrink: 0,
            mt: item.icon ? 0 : 0.5,
          }}
        >
          {item.icon && <Icon name={item.icon} size={14} />}
        </Box>
        <Box sx={{ flex: 1, width: '2px', backgroundColor: n[200], mt: 1 }} />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0, pb: 6 }}>
        <Box
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3 }}
        >
          <Typography variant="textMd">{item.title}</Typography>
          {item.timestamp && (
            <Typography variant="textXs" color="secondary" tabularNums as="span">
              {item.timestamp}
            </Typography>
          )}
        </Box>

        {item.expandable ? (
          <>
            <ButtonBase
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mt: 1,
                color: theme.palette.text.secondary,
                fontSize: 13,
              }}
            >
              {expanded ? 'Hide details' : 'Show details'}
              <Box
                sx={{
                  display: 'inline-flex',
                  transform: expanded ? 'rotate(180deg)' : 'none',
                  transition: `transform ${duration.fast}ms ${easing.easeOut}`,
                }}
              >
                <Icon name="chevronDown" size={14} />
              </Box>
            </ButtonBase>
            <Collapse in={expanded} timeout={duration.base}>
              <Box sx={{ mt: 2 }}>{item.description}</Box>
            </Collapse>
          </>
        ) : (
          item.description && <Box sx={{ mt: 1 }}>{item.description}</Box>
        )}
      </Box>
    </Box>
  );
}

/**
 * Vertical rail timeline (Phase 16.2/16.4): profile experience, discovery
 * activity, etc. Grouping is presentational only — pass `group` on each
 * item and a group header renders whenever it changes between consecutive
 * items; no date math happens in this component.
 */
export function Timeline({ items }: TimelineProps) {
  let lastGroup: string | undefined;

  return (
    <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {items.map((item) => {
        const showGroupHeader = item.group !== undefined && item.group !== lastGroup;
        lastGroup = item.group;
        return (
          <Fragment key={item.id}>
            {showGroupHeader && (
              // A group header is presentational, not a timeline entry —
              // but an <ol> may only directly contain <li> elements
              // (axe "list"/"listitem" rules), so it still needs to be one.
              <Box component="li" aria-hidden sx={{ listStyle: 'none' }}>
                <Typography variant="labelXs" color="secondary" as="div">
                  <Box sx={{ ml: 8, mb: 2 }}>{item.group}</Box>
                </Typography>
              </Box>
            )}
            <TimelineEntry item={item} />
          </Fragment>
        );
      })}
    </Box>
  );
}
