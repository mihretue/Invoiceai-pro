'use client';
import { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: ReactNode;
  tint?: 'blue' | 'green' | 'orange' | 'cyan' | 'purple';
  loading?: boolean;
}

const TINTS: Record<string, string> = {
  blue:   '#3B82F6',
  green:  '#22C55E',
  orange: '#F97316',
  cyan:   '#06B6D4',
  purple: '#8B5CF6',
};

export default function MetricCard({ label, value, sub, icon, tint = 'blue', loading }: MetricCardProps) {
  const color = TINTS[tint];

  if (loading) {
    return (
      <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--hover)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 12, width: '60%', background: 'var(--hover)', borderRadius: 6, marginBottom: 8 }} />
            <div style={{ height: 22, width: '40%', background: 'var(--hover)', borderRadius: 6 }} />
          </div>
        </div>
        {sub && <div style={{ height: 11, width: '50%', background: 'var(--hover)', borderRadius: 5 }} />}
      </div>
    );
  }

  return (
    <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {icon && (
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: `${color}18`, color, display: 'grid', placeItems: 'center',
          }}>
            {icon}
          </div>
        )}
        <div>
          <p className="cap" style={{ color: 'var(--ink-2)', marginBottom: 2 }}>{label}</p>
          <p className="h2" style={{ fontSize: 22, lineHeight: 1 }}>{value}</p>
        </div>
      </div>
      {sub && <p className="cap" style={{ color: 'var(--ink-3)' }}>{sub}</p>}
    </div>
  );
}
