'use client';
import { useState } from 'react';
import { useApp, Tweaks } from '@/lib/context';
import Icon from './Icon';

const ACCENT_OPTIONS: string[] = ['#3B82F6', '#6366F1', '#0EA5E9', '#10B981', '#F97316', '#111827'];
const FONT_OPTIONS: string[] = ['Inter', 'System', 'Manrope', 'Mono'];
const DENSITY_OPTIONS: Array<Tweaks['density']> = ['compact', 'regular', 'comfy'];

function isLight(hex: string): boolean {
  const h = String(hex).replace('#', '').padEnd(6, '0');
  const n = parseInt(h.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148000;
}

export default function TweaksPanel() {
  const { tweaks, setTweak } = useApp();
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed', right: 16, bottom: 16, zIndex: 9999,
          width: 42, height: 42, borderRadius: '50%',
          background: 'var(--blue)', color: '#fff', border: 'none',
          cursor: 'pointer', display: 'grid', placeItems: 'center',
          boxShadow: '0 4px 14px rgba(59,130,246,.5)',
        }}
        title="Open design tweaks"
      >
        <Icon name="sliders" size={18} />
      </button>
    );
  }

  return (
    <div className="twk-panel">
      <div className="twk-hd">
        <b>Tweaks</b>
        <button className="twk-x" onClick={() => setOpen(false)}>✕</button>
      </div>
      <div className="twk-body">
        <div className="twk-sect">Brand</div>

        <div className="twk-row">
          <div className="twk-lbl"><span>Accent</span></div>
          <div className="twk-chips">
            {ACCENT_OPTIONS.map(c => (
              <button
                key={c}
                className="twk-chip"
                data-on={tweaks.accent === c ? '1' : '0'}
                style={{ background: c }}
                onClick={() => setTweak('accent', c)}
                title={c}
              >
                {tweaks.accent === c && (
                  <svg viewBox="0 0 14 14" style={{ position: 'absolute', top: 6, left: 6, width: 13, height: 13 }}>
                    <path d="M3 7.2 5.8 10 11 4.2" fill="none" strokeWidth="2.2"
                      strokeLinecap="round" strokeLinejoin="round"
                      stroke={isLight(c) ? 'rgba(0,0,0,.78)' : '#fff'} />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="twk-row">
          <div className="twk-lbl"><span>Font</span></div>
          <select className="twk-field" value={tweaks.font} onChange={e => setTweak('font', e.target.value)}>
            {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        <div className="twk-sect">Layout</div>

        <div className="twk-row">
          <div className="twk-lbl"><span>Corner radius</span><span className="twk-val">{tweaks.radius}px</span></div>
          <input
            type="range" className="twk-slider"
            min={0} max={18} value={tweaks.radius}
            onChange={e => setTweak('radius', Number(e.target.value))}
          />
        </div>

        <div className="twk-row">
          <div className="twk-lbl"><span>Density</span></div>
          <div className="twk-seg">
            <div className="twk-seg-thumb" style={{
              left: `calc(2px + ${DENSITY_OPTIONS.indexOf(tweaks.density)} * (100% - 4px) / 3)`,
              width: 'calc((100% - 4px) / 3)',
            }} />
            {DENSITY_OPTIONS.map(d => (
              <button key={d} type="button" onClick={() => setTweak('density', d)}>{d}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
