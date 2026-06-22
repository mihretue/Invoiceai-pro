'use client';
import { useState } from 'react';
import { useApp } from '@/lib/context';
import { useToasts } from '@/lib/context';
import Icon from './Icon';
import ToastHost from './ui/Toasts';

function Field({ label, children }) {
  return (
    <div className="field">
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

const TABS = [['account', 'Account'], ['preferences', 'Preferences'], ['integrations', 'Integrations']];
const INTEGRATIONS = [
  ['QuickBooks', 'Sync extracted invoices to your ledger', true],
  ['Google Drive', 'Back up original documents', false],
  ['Slack', 'Notify a channel on new uploads', false],
];

export default function SettingsPage() {
  const { theme, setTheme } = useApp();
  const { toasts, push, remove } = useToasts();
  const [tab, setTab] = useState('preferences');

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="h1">Settings</h1>
          <p className="body muted sub">Manage your account and preferences.</p>
        </div>
      </div>

      <div className="row" style={{ gap: 4, marginBottom: 24, borderBottom: '1px solid var(--line)', paddingBottom: 0 }}>
        {TABS.map(([id, label]) => (
          <button
            key={id}
            className={`nav-link${tab === id ? ' active' : ''}`}
            style={{ borderRadius: '8px 8px 0 0', marginBottom: -1 }}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="card card-pad" style={{ maxWidth: 620 }}>
        {tab === 'account' && (
          <div className="stack" style={{ gap: 18 }}>
            <Field label="Full name">
              <input className="input" defaultValue="Alex Rivera" />
            </Field>
            <Field label="Email">
              <input className="input" defaultValue="alex@acmebooks.com" />
            </Field>
            <button
              className="btn btn-secondary"
              style={{ alignSelf: 'flex-start' }}
              onClick={() => push('Password reset link sent', 'info')}
            >
              Change password
            </button>
            <button
              className="btn btn-primary"
              style={{ alignSelf: 'flex-start' }}
              onClick={() => push('Account saved', 'success')}
            >
              Save changes
            </button>
          </div>
        )}

        {tab === 'preferences' && (
          <div className="stack" style={{ gap: 18 }}>
            <div className="grid-2">
              <Field label="Default currency">
                <select className="select" defaultValue="USD">
                  {['USD', 'EUR', 'GBP', 'CAD'].map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Date format">
                <select className="select" defaultValue="MM/DD/YYYY">
                  {['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'].map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderTop: '1px solid var(--line-2)' }}>
              <div>
                <div className="h3">Dark mode</div>
                <div className="small">Use a dark color theme across the app.</div>
              </div>
              <button
                className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? 'On' : 'Off'}
              </button>
            </div>
          </div>
        )}

        {tab === 'integrations' && (
          <div className="stack" style={{ gap: 12 }}>
            {INTEGRATIONS.map(([name, desc, conn]) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, border: '1px solid var(--line)', borderRadius: 12 }}>
                <div className="metric-ic" style={{ background: 'var(--hover)', color: 'var(--ink-2)' }}>
                  <Icon name="grid" size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="h3" style={{ fontSize: 15 }}>{name}</div>
                  <div className="small">{desc}</div>
                </div>
                <button
                  className={`btn btn-sm ${conn ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={() => push((conn ? 'Disconnected ' : 'Connected ') + name, conn ? 'info' : 'success')}
                >
                  {conn ? 'Connected' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ToastHost toasts={toasts} remove={remove} />
    </div>
  );
}
