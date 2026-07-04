import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Side-effect import FIRST: validates the environment and fail-fasts with a
// rendered error screen before anything else loads (Phase 16.5 §1.1).
import '@/app/env';

// Self-hosted Inter — no font CDN (CSP-friendly, offline-safe).
import '@fontsource-variable/inter';

import { App } from '@/app/App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found in index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
