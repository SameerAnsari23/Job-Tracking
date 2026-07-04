import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Collapse from '@mui/material/Collapse';
import { useTheme } from '@mui/material/styles';
import { neutralLight, neutralDark, duration, easing } from '@/theme';
import { Typography } from '../foundation/Typography';
import { Icon } from '../foundation/Icon';

export interface AccordionItemSpec {
  id: string;
  title: string;
  content: ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItemSpec[];
  /** single: opening one closes the rest. */
  mode?: 'single' | 'multiple';
  defaultOpen?: string[];
  /** Controlled open set (optional). */
  open?: string[];
  onOpenChange?: (open: string[]) => void;
}

/**
 * Collapsible sections (Phase 16.4): borderless per the theme reset,
 * hairline separators, chevron rotation, height animation via Collapse,
 * button + region ARIA pattern. Uncontrolled by default, controllable.
 */
export function Accordion({
  items,
  mode = 'multiple',
  defaultOpen = [],
  open: openProp,
  onOpenChange,
}: AccordionProps) {
  const theme = useTheme();
  const n = theme.palette.mode === 'dark' ? neutralDark : neutralLight;
  const baseId = useId();

  const [internalOpen, setInternalOpen] = useState<string[]>(defaultOpen);
  const open = openProp ?? internalOpen;

  const toggle = (id: string) => {
    const isOpen = open.includes(id);
    const next = isOpen ? open.filter((o) => o !== id) : mode === 'single' ? [id] : [...open, id];
    if (openProp === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  return (
    <Box>
      {items.map((item, index) => {
        const isOpen = open.includes(item.id);
        const headerId = `${baseId}-${item.id}-header`;
        const panelId = `${baseId}-${item.id}-panel`;
        return (
          <Box
            key={item.id}
            data-state={isOpen ? 'open' : 'closed'}
            sx={{ borderTop: index > 0 ? `1px solid ${n[100]}` : 'none' }}
          >
            <ButtonBase
              id={headerId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              disabled={item.disabled}
              onClick={() => toggle(item.id)}
              sx={{
                width: '100%',
                justifyContent: 'space-between',
                py: 4,
                px: 1,
                textAlign: 'left',
              }}
            >
              <Typography variant="textMd" as="span">
                {item.title}
              </Typography>
              <Box
                component="span"
                sx={{
                  display: 'inline-flex',
                  color: theme.palette.text.secondary,
                  transform: isOpen ? 'rotate(180deg)' : 'none',
                  transition: `transform ${duration.fast}ms ${easing.easeOut}`,
                }}
              >
                <Icon name="chevronDown" size={16} />
              </Box>
            </ButtonBase>
            <Collapse in={isOpen} timeout={duration.base}>
              <Box id={panelId} role="region" aria-labelledby={headerId} sx={{ px: 1, pb: 5 }}>
                {item.content}
              </Box>
            </Collapse>
          </Box>
        );
      })}
    </Box>
  );
}
