import type { LaunchOptions } from 'playwright';

function envTruthy(name: string): boolean {
  const v = process.env[name];
  if (v == null) return false;
  const lower = v.toLowerCase();
  return v === '1' || lower === 'true' || lower === 'yes';
}

/**
 * Chromium launch options that work on macOS, Windows, and Linux.
 * Use HEADLESS=1 (or CI=true) when no GUI is available (common on Windows Server / RDP without desktop).
 */
export function chromiumLaunchOptions(overrides: LaunchOptions = {}): LaunchOptions {
  const headless = envTruthy('HEADLESS') || process.env.CI === 'true';

  return {
    headless,
    ...overrides,
  };
}
