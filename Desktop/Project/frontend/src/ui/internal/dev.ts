/**
 * Dev-only contract warnings for the component library.
 *
 * This is the ONE file in ui/ sanctioned to read import.meta.env (see the
 * eslint exemption): ui/ must stay decoupled from @/app, and these guards
 * must be tree-shaken from production builds via the static DEV flag.
 */
export function warnDev(condition: boolean, message: string): void {
  if (import.meta.env.DEV && condition) {
    console.warn(message);
  }
}
