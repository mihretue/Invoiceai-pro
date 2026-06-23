const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  info(message: string, data?: unknown): void {
    if (isDev) console.log(`[INFO] ${message}`, ...(data !== undefined ? [data] : []));
  },
  warn(message: string, data?: unknown): void {
    console.warn(`[WARN] ${message}`, ...(data !== undefined ? [data] : []));
  },
  error(message: string, err?: unknown): void {
    console.error(`[ERROR] ${message}`, ...(err !== undefined ? [err] : []));
    // Plug in Sentry or another error tracker here:
    // Sentry.captureException(err)
  },
  debug(message: string, data?: unknown): void {
    if (isDev) console.debug(`[DEBUG] ${message}`, ...(data !== undefined ? [data] : []));
  },
  page(name: string): void {
    if (isDev) console.log(`[NAV] ${name}`);
  },
  event(name: string, data?: unknown): void {
    if (isDev) console.log(`[EVENT] ${name}`, ...(data !== undefined ? [data] : []));
    // Plug in analytics here:
    // analytics.track(name, data)
  },
};
