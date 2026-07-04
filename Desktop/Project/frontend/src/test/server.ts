import { setupServer } from 'msw/node';
import type { RequestHandler } from 'msw';

/**
 * MSW server for tests. Handlers are registered per-feature as milestones
 * land (blueprint §4.6 step 8); the bootstrap ships an empty registry.
 * Fixtures shared with Storybook live in src/test/fixtures/.
 */
export const handlers: RequestHandler[] = [];

export const server = setupServer(...handlers);
