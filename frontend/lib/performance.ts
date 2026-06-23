// Performance monitoring utilities (client-side only)

export function trackPageLoad(pageName: string): void {
  if (typeof window === 'undefined') return;
  const t = performance.now();
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Perf] ${pageName} loaded in ${t.toFixed(0)}ms`);
    if (t > 3000) console.warn(`[Perf] SLOW: ${pageName} took ${t.toFixed(0)}ms`);
  }
}

export function trackAPICall(endpoint: string, durationMs: number): void {
  if (process.env.NODE_ENV === 'development' && durationMs > 2000) {
    console.warn(`[Perf] Slow API: ${endpoint} took ${durationMs.toFixed(0)}ms`);
  }
}

export function optimizeImages(): void {
  if (typeof document === 'undefined') return;
  document.querySelectorAll<HTMLImageElement>('img:not([loading])').forEach(img => {
    img.loading = 'lazy';
  });
}

export function measureVitals(): void {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return;
  // Largest Contentful Paint
  new PerformanceObserver(list => {
    list.getEntries().forEach(e => console.log('[Vitals] LCP:', e.startTime.toFixed(0), 'ms'));
  }).observe({ entryTypes: ['largest-contentful-paint'] });
  // Cumulative Layout Shift
  new PerformanceObserver(list => {
    list.getEntries().forEach((e: any) => {
      if (e.value > 0.1) console.warn('[Vitals] CLS shift:', e.value.toFixed(4));
    });
  }).observe({ entryTypes: ['layout-shift'] });
}
