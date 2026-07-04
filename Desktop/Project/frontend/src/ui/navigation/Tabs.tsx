import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import MuiTabs from '@mui/material/Tabs';
import MuiTab from '@mui/material/Tab';
import { useTheme } from '@mui/material/styles';
import { neutralLight, neutralDark, radius, duration, easing, typeScale } from '@/theme';
import { Icon } from '../foundation/Icon';
import type { IconName } from '../foundation/Icon';
import { Badge } from '../foundation/Badge';
import { useRovingTabIndex } from './internal/useRovingTabIndex';

export interface TabItem {
  value: string;
  label: string;
  icon?: IconName;
  /** Rendered as a small count badge next to the label. */
  count?: number;
  disabled?: boolean;
  /** Panel content. Omit entirely if the PAGE renders content externally. */
  content?: ReactNode;
}

export type TabsVariant = 'underline' | 'segmented';

export interface TabsProps {
  items: TabItem[];
  variant?: TabsVariant;
  /** Controlled selection. */
  value?: string;
  /** Uncontrolled initial selection. */
  defaultValue?: string;
  onChange?: (value: string) => void;
  'aria-label'?: string;
}

function TabLabel({ item }: { item: TabItem }) {
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5 }}>
      {item.icon && <Icon name={item.icon} size={16} />}
      {item.label}
      {item.count !== undefined && <Badge tone="neutral">{String(item.count)}</Badge>}
    </Box>
  );
}

/**
 * Tab navigation (Phase 16.4): underline variant wraps MUI Tabs directly
 * (native roving tabindex, scrollable overflow, sliding indicator — no
 * reason to reimplement what MUI already gives for free). Segmented
 * variant is visually unrelated to MUI's Tab styling (pill container, no
 * MUI equivalent) so it's a small custom tablist built on the same
 * useRovingTabIndex hook BottomNavigation uses — one hook, two consumers,
 * not duplicated logic.
 *
 * Lazy mounting: a panel's `content` is not created until its tab is first
 * selected; once mounted it stays in the DOM (hidden, not unmounted) so
 * scroll position and internal state survive tab switches.
 */
export function Tabs({
  items,
  variant = 'underline',
  value: valueProp,
  defaultValue,
  onChange,
  'aria-label': ariaLabel,
}: TabsProps) {
  const theme = useTheme();
  const baseId = useId();

  const [internalValue, setInternalValue] = useState(defaultValue ?? items[0]?.value ?? '');
  const value = valueProp ?? internalValue;
  const [mounted, setMounted] = useState<Set<string>>(new Set([value]));

  const select = (next: string) => {
    if (valueProp === undefined) setInternalValue(next);
    setMounted((prev) => (prev.has(next) ? prev : new Set(prev).add(next)));
    onChange?.(next);
  };

  const hasPanels = items.some((i) => i.content !== undefined);

  // Called unconditionally regardless of variant (Rules of Hooks) — unused
  // when variant="underline", where MUI Tabs owns roving tabindex natively.
  const roving = useRovingTabIndex(
    items.length,
    Math.max(
      0,
      items.findIndex((i) => i.value === value),
    ),
  );

  const panels = hasPanels && (
    <>
      {items.map((item) =>
        mounted.has(item.value) ? (
          <Box
            key={item.value}
            role="tabpanel"
            id={`${baseId}-panel-${item.value}`}
            aria-labelledby={`${baseId}-tab-${item.value}`}
            hidden={value !== item.value}
          >
            {item.content}
          </Box>
        ) : null,
      )}
    </>
  );

  if (variant === 'segmented') {
    const n = theme.palette.mode === 'dark' ? neutralDark : neutralLight;

    return (
      <Box>
        <Box
          role="tablist"
          aria-label={ariaLabel}
          onKeyDown={(e) => roving.onKeyDown(e, 'horizontal')}
          sx={{
            display: 'inline-flex',
            gap: 0.5,
            p: 0.5,
            backgroundColor: n[100],
            borderRadius: `${radius.md}px`,
          }}
        >
          {items.map((item, index) => {
            const selected = value === item.value;
            return (
              <Box
                key={item.value}
                component="button"
                type="button"
                role="tab"
                id={`${baseId}-tab-${item.value}`}
                aria-selected={selected}
                aria-controls={hasPanels ? `${baseId}-panel-${item.value}` : undefined}
                disabled={item.disabled}
                tabIndex={roving.tabIndexFor(index)}
                ref={roving.registerItem(index)}
                onClick={() => {
                  roving.setFocusedIndex(index);
                  select(item.value);
                }}
                sx={{
                  border: 'none',
                  cursor: item.disabled ? 'not-allowed' : 'pointer',
                  opacity: item.disabled ? 0.4 : 1,
                  height: 30,
                  px: 2.5,
                  borderRadius: `${radius.sm}px`,
                  backgroundColor: selected ? theme.palette.background.paper : 'transparent',
                  boxShadow: selected ? theme.shadows[1] : 'none',
                  color: theme.palette.text.primary,
                  ...typeScale.textSm,
                  fontWeight: 500,
                  transition: `background-color ${duration.fast}ms ${easing.easeOut}`,
                }}
              >
                <TabLabel item={item} />
              </Box>
            );
          })}
        </Box>
        {panels}
      </Box>
    );
  }

  return (
    <Box>
      <MuiTabs
        value={value}
        onChange={(_, next) => select(next)}
        aria-label={ariaLabel}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
      >
        {items.map((item) => (
          <MuiTab
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            label={<TabLabel item={item} />}
            id={`${baseId}-tab-${item.value}`}
            aria-controls={hasPanels ? `${baseId}-panel-${item.value}` : undefined}
          />
        ))}
      </MuiTabs>
      {panels}
    </Box>
  );
}
