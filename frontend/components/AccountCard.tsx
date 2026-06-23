'use client';
import { User, Mail, Calendar } from 'lucide-react';
import { useUserSettings } from '@/hooks/useSettings';
import { fmtDate } from '@/lib/formatters';

export default function AccountCard() {
  const { data: user, isPending } = useUserSettings();

  if (isPending) {
    return (
      <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--hover)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 10, width: '40%', background: 'var(--hover)', borderRadius: 4, marginBottom: 6 }} />
              <div style={{ height: 14, width: '70%', background: 'var(--hover)', borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const rows: [typeof User, string, string][] = [
    [User,     'Name',         user?.email?.split('@')[0] ?? '–'],
    [Mail,     'Email',        user?.email ?? '–'],
    [Calendar, 'Member since', fmtDate(user?.created_at)],
  ];

  return (
    <div className="card card-pad">
      <h3 className="h3" style={{ marginBottom: 16 }}>Account</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {rows.map(([Ic, label, val], i) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < rows.length - 1 ? '1px solid var(--line-2)' : 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--blue-50)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Ic size={18} style={{ color: 'var(--blue)' }} />
            </div>
            <div>
              <p className="cap" style={{ color: 'var(--ink-3)' }}>{label}</p>
              <p className="body" style={{ fontWeight: 600 }}>{val}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
