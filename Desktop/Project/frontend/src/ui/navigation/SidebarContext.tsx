import { createContext, useContext } from 'react';

export interface SidebarContextValue {
  collapsed: boolean;
}

export const SidebarContext = createContext<SidebarContextValue>({ collapsed: false });

export function useSidebarContext(): SidebarContextValue {
  return useContext(SidebarContext);
}
