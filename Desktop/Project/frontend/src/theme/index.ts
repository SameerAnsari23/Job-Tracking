/**
 * Theme barrel — the public surface of the token system.
 * Application code imports tokens from '@/theme', never from MUI defaults.
 */
export * from './colors';
export * from './typography';
export * from './spacing';
export * from './radius';
export * from './shadows';
export * from './motion';
export * from './breakpoints';
export * from './zIndex';
export * from './opacity';
export { lightTheme, darkTheme, buildTheme } from './theme';
