import { useCallback, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

/**
 * Strict roving-tabindex ARIA pattern (WAI-ARIA "menu"/"tablist" style):
 * exactly one item is in the Tab sequence at a time; arrow keys move focus
 * AND the roving index together. Shared by the two components that need
 * this strict single-tab-stop behavior — Tabs (segmented variant) and
 * BottomNavigation. Sidebar deliberately does NOT use this hook (see
 * Sidebar.tsx) — it keeps every item in the normal Tab order and layers
 * arrow keys on top as a convenience, which is a different, simpler
 * interaction model suited to a persistent nav rail rather than a
 * single-purpose widget.
 */
export function useRovingTabIndex(itemCount: number, initialIndex = 0) {
  const [focusedIndex, setFocusedIndex] = useState(Math.min(initialIndex, itemCount - 1));
  const itemRefs = useRef<Array<HTMLElement | null>>([]);

  const registerItem = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      itemRefs.current[index] = el;
    },
    [],
  );

  const focusItem = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(itemCount - 1, index));
      setFocusedIndex(clamped);
      itemRefs.current[clamped]?.focus();
    },
    [itemCount],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent, orientation: 'horizontal' | 'vertical' = 'horizontal') => {
      const nextKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
      const prevKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';

      if (event.key === nextKey) {
        event.preventDefault();
        focusItem((focusedIndex + 1) % itemCount);
      } else if (event.key === prevKey) {
        event.preventDefault();
        focusItem((focusedIndex - 1 + itemCount) % itemCount);
      } else if (event.key === 'Home') {
        event.preventDefault();
        focusItem(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        focusItem(itemCount - 1);
      }
    },
    [focusedIndex, itemCount, focusItem],
  );

  const tabIndexFor = useCallback(
    (index: number) => (index === focusedIndex ? 0 : -1),
    [focusedIndex],
  );

  return { focusedIndex, setFocusedIndex, registerItem, onKeyDown, tabIndexFor, focusItem };
}
