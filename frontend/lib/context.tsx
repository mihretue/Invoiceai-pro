'use client';
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export interface Tweaks {
  accent: string;
  radius: number;
  density: 'compact' | 'regular' | 'comfy';
  font: string;
}

export interface AppContextType {
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  tweaks: Tweaks;
  setTweak: (key: keyof Tweaks, val: Tweaks[keyof Tweaks]) => void;
}

const AppContext = createContext<AppContextType | null>(null);

function hexToRgb(h: string): number[] {
  h = h.replace('#', '');
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
}
function rgbToHex(r: number[]): string {
  return '#' + r.map(x => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join('');
}
function shade(hex: string, amt: number): string {
  return rgbToHex(hexToRgb(hex).map(c => c + (amt < 0 ? c * amt : (255 - c) * amt)));
}
function mix(a: string, b: string, t: number): string {
  const ra = hexToRgb(a), rb = hexToRgb(b);
  return rgbToHex(ra.map((c, i) => c + (rb[i] - c) * t));
}

function applyTweaks(t: Tweaks): void {
  const root = document.documentElement;
  root.style.setProperty('--blue', t.accent);
  root.style.setProperty('--blue-600', shade(t.accent, -0.10));
  root.style.setProperty('--blue-700', shade(t.accent, -0.20));
  root.style.setProperty('--blue-100', mix(t.accent, '#ffffff', 0.82));
  root.style.setProperty('--r', t.radius + 'px');
  root.style.setProperty('--r-lg', (t.radius + 4) + 'px');
  root.style.setProperty('--r-sm', Math.max(2, t.radius - 4) + 'px');
  root.style.setProperty('--font',
    t.font === 'System' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    : t.font === 'Mono' ? '"Roboto Mono", ui-monospace, monospace'
    : `"${t.font}", -apple-system, sans-serif`
  );
  const dens: Record<string, number> = { compact: 18, regular: 24, comfy: 30 };
  root.style.setProperty('--lg', (dens[t.density] || 24) + 'px');
}

const TWEAK_DEFAULTS: Tweaks = { accent: '#3B82F6', radius: 10, density: 'regular', font: 'Inter' };

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [tweaks, setTweaksState] = useState<Tweaks>(TWEAK_DEFAULTS);

  useEffect(() => {
    const saved = (localStorage.getItem('iap_theme') || 'light') as 'light' | 'dark';
    setThemeState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('iap_theme', theme);
  }, [theme]);

  useEffect(() => {
    applyTweaks(tweaks);
  }, [tweaks]);

  const setTheme = useCallback((t: 'light' | 'dark') => setThemeState(t), []);

  const setTweak = useCallback((key: keyof Tweaks, val: Tweaks[keyof Tweaks]) => {
    setTweaksState(prev => ({ ...prev, [key]: val }));
  }, []);

  return (
    <AppContext.Provider value={{ theme, setTheme, tweaks, setTweak }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
