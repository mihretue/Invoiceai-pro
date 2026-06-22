'use client';
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { generateSeed } from './data';

const AppContext = createContext(null);

// accent colour helpers (mirrored from original app.jsx)
function hexToRgb(h) {
  h = h.replace('#', '');
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
}
function rgbToHex(r) {
  return '#' + r.map(x => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join('');
}
function shade(hex, amt) {
  return rgbToHex(hexToRgb(hex).map(c => c + (amt < 0 ? c * amt : (255 - c) * amt)));
}
function mix(a, b, t) {
  const ra = hexToRgb(a), rb = hexToRgb(b);
  return rgbToHex(ra.map((c, i) => c + (rb[i] - c) * t));
}

function applyTweaks(t) {
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
  const dens = { compact: 18, regular: 24, comfy: 30 }[t.density] || 24;
  root.style.setProperty('--lg', dens + 'px');
}

const TWEAK_DEFAULTS = { accent: '#3B82F6', radius: 10, density: 'regular', font: 'Inter' };

export function AppProvider({ children }) {
  const [invoices, setInvoices] = useState([]);
  const [theme, setTheme] = useState('light');
  const [tweaks, setTweaksState] = useState(TWEAK_DEFAULTS);

  // initialise client-side (avoids SSR hydration mismatch from Math.random)
  useEffect(() => {
    setInvoices(generateSeed());
    const saved = localStorage.getItem('iap_theme') || 'light';
    setTheme(saved);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('iap_theme', theme);
  }, [theme]);

  useEffect(() => {
    applyTweaks(tweaks);
  }, [tweaks]);

  const setTweak = useCallback((key, val) => {
    setTweaksState(prev => ({ ...prev, [key]: val }));
  }, []);

  const addInvoice = useCallback(inv => {
    setInvoices(list => [inv, ...list]);
  }, []);

  const updateInvoice = useCallback(updated => {
    setInvoices(list => list.map(i => i.id === updated.id ? updated : i));
  }, []);

  const deleteInvoice = useCallback(id => {
    setInvoices(list => list.filter(i => i.id !== id));
  }, []);

  return (
    <AppContext.Provider value={{
      invoices, addInvoice, updateInvoice, deleteInvoice,
      theme, setTheme,
      tweaks, setTweak,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}

// toast hook (self-contained, used per-page)
let _toastId = 0;
export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, type = 'success') => {
    const id = ++_toastId;
    setToasts(t => [...t, { id, msg, type }]);
  }, []);
  const remove = useCallback(id => setToasts(t => t.filter(x => x.id !== id)), []);
  return { toasts, push, remove };
}
