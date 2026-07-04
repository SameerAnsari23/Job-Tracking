import { RouterProvider } from 'react-router-dom';
import { Providers } from './Providers';
import { router } from '@/routes';

/**
 * Root component — the only component main.tsx knows about.
 * Providers wrap the router per the Phase 16.5 provider hierarchy.
 */
export function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  );
}
