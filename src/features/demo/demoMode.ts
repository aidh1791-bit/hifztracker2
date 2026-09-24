/**
 * Demo Mode Flag
 * In production (live deployment), VITE_DEMO_MODE defaults to false or undefined.
 * Demo passcodes and mock logins are disabled unless explicitly enabled in dev environment.
 */
export const DEMO_MODE =
  (typeof (import.meta as any)?.env?.VITE_DEMO_MODE !== 'undefined'
    ? (import.meta as any).env.VITE_DEMO_MODE === 'true'
    : (typeof process !== 'undefined' && process.env?.VITE_DEMO_MODE === 'true'));

