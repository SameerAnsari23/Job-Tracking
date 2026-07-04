import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * UI preferences — persisted to localStorage under 'jobnotify-ui'.
 * The pre-paint script in index.html reads the same key to prevent
 * theme flash; keep the storage name and shape in sync with it.
 */
interface UiState {
  themeMode: ThemeMode;
  sidebarCollapsed: boolean;

  setThemeMode: (mode: ThemeMode) => void;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      themeMode: 'system',
      sidebarCollapsed: false,

      setThemeMode: (themeMode) => set({ themeMode }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    }),
    { name: 'jobnotify-ui' },
  ),
);
