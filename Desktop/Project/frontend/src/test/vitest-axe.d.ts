/* eslint-disable @typescript-eslint/no-empty-object-type -- module
   augmentation requires interface merging even with no new members */
import 'vitest';
import type { AxeMatchers } from 'vitest-axe/matchers';

declare module 'vitest' {
  interface Assertion extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
