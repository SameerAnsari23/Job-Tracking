import { useCallback, useRef } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { accent, accentDark, neutralLight, neutralDark } from '@/theme';

export interface ResizablePanelProps {
  /** Controlled width — persistence is the caller's concern (uiStore). */
  width: number;
  onWidthChange: (width: number) => void;
  minWidth?: number;
  maxWidth?: number;
  /** Width restored on handle double-click. */
  defaultWidth?: number;
  /** Accessible name for the resize handle. */
  label?: string;
  /** Keyboard resize step (arrow keys on the focused handle). */
  step?: number;
  children: ReactNode;
}

/**
 * Width-adjustable side panel (Phase 16.4): pointer drag, double-click
 * reset, and keyboard arrows on the focusable separator handle
 * (role="separator" aria-orientation="vertical" + value semantics).
 */
export function ResizablePanel({
  width,
  onWidthChange,
  minWidth = 200,
  maxWidth = 480,
  defaultWidth,
  label = 'Resize panel',
  step = 16,
  children,
}: ResizablePanelProps) {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const n = dark ? neutralDark : neutralLight;
  const a = dark ? accentDark : accent;
  const dragState = useRef<{ startX: number; startWidth: number } | null>(null);

  const clamp = useCallback(
    (value: number) => Math.max(minWidth, Math.min(maxWidth, value)),
    [minWidth, maxWidth],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragState.current = { startX: event.clientX, startWidth: width };
    // Guarded: jsdom (tests) does not implement pointer capture.
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current) return;
    const delta = event.clientX - dragState.current.startX;
    onWidthChange(clamp(dragState.current.startWidth + delta));
  };

  const onPointerUp = () => {
    dragState.current = null;
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      onWidthChange(clamp(width - step));
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      onWidthChange(clamp(width + step));
    } else if (event.key === 'Home') {
      event.preventDefault();
      onWidthChange(minWidth);
    } else if (event.key === 'End') {
      event.preventDefault();
      onWidthChange(maxWidth);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: 0, height: '100%' }}>
      <Box sx={{ width, flexShrink: 0, overflowY: 'auto', minWidth: 0 }}>{children}</Box>
      <Box
        role="separator"
        aria-orientation="vertical"
        aria-label={label}
        aria-valuenow={Math.round(width)}
        aria-valuemin={minWidth}
        aria-valuemax={maxWidth}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onKeyDown={onKeyDown}
        onDoubleClick={() => defaultWidth !== undefined && onWidthChange(clamp(defaultWidth))}
        sx={{
          width: 6,
          flexShrink: 0,
          cursor: 'col-resize',
          touchAction: 'none',
          backgroundColor: 'transparent',
          borderLeft: `1px solid ${n[200]}`,
          '&:hover, &:focus-visible': { backgroundColor: a[200] },
        }}
      />
    </Box>
  );
}
