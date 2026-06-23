'use client';
import { useState, useEffect, FormEvent, ReactNode } from 'react';
import { Eye, EyeOff, Download, Lock, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/lib/context';
import {
  useUserSettings,
  useUpdateSettings,
  useChangePassword,
  useExportCSV,
  useExportJSON,
} from '@/hooks/useSettings';
import { CATEGORIES } from '@/lib/data';
import Icon from './Icon';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="field">
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

type Tab = 'account' | 'preferences' | 'security' | 'export';
const TABS: [Tab, string][] = [
  ['account',     'Account'],
  ['preferences', 'Preferences'],
  ['security',    'Security'],
  ['export',      'Export'],
];

const INTEGRATIONS: [string, string, boolean][] = [
  ['QuickBooks',    'Sync extracted invoices to your ledger', true],
  ['Google Drive',  'Back up original documents',            false],
  ['Slack',         'Notify a channel on new uploads',       false],
];

export default function SettingsPage() {
  const { theme, setTheme } = useApp();
  const { data: user, isPending: userLoading } = useUserSettings();
  const updateMutation  = useUpdateSettings();
  const passwordMutation = useChangePassword();
  const exportCSV  = useExportCSV();
  const exportJSON = useExportJSON();

  const [tab, setTab] = useState<Tab>('account');

  // ── Account form ──────────────────────────────────────────────────────────
  const [accountForm, setAccountForm] = useState({ email: '', name: '' });

  useEffect(() => {
    if (user) setAccountForm({ email: user.email ?? '', name: '' });
  }, [user]);

  function handleSaveAccount(e: FormEvent) {
    e.preventDefault();
    updateMutation.mutate({ email: accountForm.email });
  }

  // ── Password form ─────────────────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [pwError, setPwError] = useState('');

  function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    if (pwForm.next.length < 8) { setPwError('New password must be at least 8 characters.'); return; }
    if (pwForm.next !== pwForm.confirm) { setPwError('Passwords do not match.'); return; }
    setPwError('');
    passwordMutation.mutate(
      { current_password: pwForm.current, new_password: pwForm.next, confirm_password: pwForm.confirm },
      { onSuccess: () => setPwForm({ current: '', next: '', confirm: '' }) },
    );
  }

  // ── Export form ───────────────────────────────────────────────────────────
  const [expFilters, setExpFilters] = useState({ category: '', vendor: '', dateFrom: '', dateTo: '' });

  function exportParams() {
    return {
      category: expFilters.category  || undefined,
      vendor:   expFilters.vendor    || undefined,
      dateFrom: expFilters.dateFrom  || undefined,
      dateTo:   expFilters.dateTo    || undefined,
    };
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="h1">Settings</h1>
          <p className="body muted sub">Manage your account and preferences.</p>
        </div>
      </div>

      {/* Tab strip */}
      <div className="row" style={{ gap: 4, marginBottom: 24, borderBottom: '1px solid var(--line)', paddingBottom: 0 }}>
        {TABS.map(([id, label]) => (
          <button key={id}
            className={`nav-link${tab === id ? ' active' : ''}`}
            style={{ borderRadius: '8px 8px 0 0', marginBottom: -1 }}
            onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      <div className="card card-pad" style={{ maxWidth: 640 }}>

        {/* ── Account tab ─────────────────────────────────────────────────── */}
        {tab === 'account' && (
          <form onSubmit={handleSaveAccount}>
            <div className="stack" style={{ gap: 18 }}>
              <Field label="Email">
                {userLoading
                  ? <div style={{ height: 40, background: 'var(--hover)', borderRadius: 'var(--r)' }} />
                  : <input className="input" type="email"
                      value={accountForm.email}
                      onChange={e => setAccountForm(f => ({ ...f, email: e.target.value }))} />}
              </Field>
              <Field label="Member since">
                {userLoading
                  ? <div style={{ height: 40, background: 'var(--hover)', borderRadius: 'var(--r)' }} />
                  : <input className="input" readOnly
                      value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : '–'} />}
              </Field>
              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button type="submit" className="btn btn-primary" disabled={updateMutation.isPending}>
                  {updateMutation.isPending
                    ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving…</>
                    : <><Save size={16} /> Save changes</>}
                </button>
                <button type="button" className="btn btn-secondary"
                  onClick={() => toast.info('Password reset link sent to ' + (user?.email ?? ''))}>
                  Reset password
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ── Preferences tab ─────────────────────────────────────────────── */}
        {tab === 'preferences' && (
          <div className="stack" style={{ gap: 18 }}>
            <div className="grid-2">
              <Field label="Default currency">
                <select className="select" defaultValue="USD">
                  {['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR'].map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Date format">
                <select className="select" defaultValue="MM/DD/YYYY">
                  {['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'].map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
            </div>

            {/* Dark mode toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderTop: '1px solid var(--line-2)' }}>
              <div>
                <div className="h3">Dark mode</div>
                <div className="small">Use a dark color theme across the app.</div>
              </div>
              <button className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {theme === 'dark' ? 'On' : 'Off'}
              </button>
            </div>

            {/* Notifications toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderTop: '1px solid var(--line-2)' }}>
              <div>
                <div className="h3">Email notifications</div>
                <div className="small">Receive updates about uploads and extractions.</div>
              </div>
              <button className="btn btn-secondary"
                onClick={() => toast.info('Notification preferences saved')}>
                Enabled
              </button>
            </div>

            {/* Auto-categorize toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderTop: '1px solid var(--line-2)' }}>
              <div>
                <div className="h3">Auto-categorize invoices</div>
                <div className="small">Automatically assign categories using AI extraction.</div>
              </div>
              <button className="btn btn-primary"
                onClick={() => toast.info('Auto-categorize setting saved')}>
                On
              </button>
            </div>

            {/* Integrations */}
            <div style={{ marginTop: 8 }}>
              <h3 className="h3" style={{ marginBottom: 12 }}>Integrations</h3>
              <div className="stack" style={{ gap: 10 }}>
                {INTEGRATIONS.map(([name, desc, conn]) => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, border: '1px solid var(--line)', borderRadius: 12 }}>
                    <div className="metric-ic" style={{ background: 'var(--hover)', color: 'var(--ink-2)' }}>
                      <Icon name="grid" size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="h3" style={{ fontSize: 15 }}>{name}</div>
                      <div className="small">{desc}</div>
                    </div>
                    <button className={`btn btn-sm ${conn ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() => toast[conn ? 'info' : 'success']((conn ? 'Disconnected ' : 'Connected ') + name)}>
                      {conn ? 'Connected' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Security tab ─────────────────────────────────────────────────── */}
        {tab === 'security' && (
          <form onSubmit={handleChangePassword}>
            <div className="stack" style={{ gap: 18 }}>

              {/* Info banner */}
              <div style={{ display: 'flex', gap: 10, padding: '12px 14px', background: 'var(--blue-50)', border: '1px solid var(--blue-100)', borderRadius: 'var(--r)' }}>
                <Lock size={18} style={{ color: 'var(--blue)', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p className="small" style={{ fontWeight: 600, color: 'var(--blue)' }}>Change your password</p>
                  <p className="small" style={{ color: 'var(--blue)', opacity: 0.8 }}>Use a strong, unique password for your account.</p>
                </div>
              </div>

              {/* Current password */}
              <Field label="Current password">
                <div className="input-wrap" style={{ position: 'relative' }}>
                  <svg className="ic" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input type={showPw.current ? 'text' : 'password'} className="input" style={{ paddingRight: 40 }}
                    value={pwForm.current} onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
                    required placeholder="Current password" />
                  <button type="button" tabIndex={-1}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', display: 'flex' }}
                    onClick={() => setShowPw(s => ({ ...s, current: !s.current }))}>
                    {showPw.current ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </Field>

              {/* New password */}
              <Field label="New password">
                <div className="input-wrap" style={{ position: 'relative' }}>
                  <svg className="ic" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input type={showPw.next ? 'text' : 'password'} className="input"
                    style={{ paddingRight: 40, borderColor: pwForm.next && pwForm.next.length >= 8 ? 'var(--green)' : undefined }}
                    value={pwForm.next} onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))}
                    required placeholder="New password (min 8 chars)" />
                  <button type="button" tabIndex={-1}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', display: 'flex' }}
                    onClick={() => setShowPw(s => ({ ...s, next: !s.next }))}>
                    {showPw.next ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                <p className="cap" style={{ marginTop: 4, color: 'var(--ink-3)' }}>At least 8 characters</p>
              </Field>

              {/* Confirm password */}
              <Field label="Confirm new password">
                <div className="input-wrap" style={{ position: 'relative' }}>
                  <svg className="ic" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input type={showPw.confirm ? 'text' : 'password'} className="input"
                    value={pwForm.confirm} onChange={e => { setPwForm(f => ({ ...f, confirm: e.target.value })); setPwError(''); }}
                    required placeholder="Repeat new password"
                    style={{ paddingRight: 40, borderColor: pwForm.confirm ? (pwForm.confirm === pwForm.next ? 'var(--green)' : 'var(--red)') : undefined }} />
                  <button type="button" tabIndex={-1}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', display: 'flex' }}
                    onClick={() => setShowPw(s => ({ ...s, confirm: !s.confirm }))}>
                    {showPw.confirm ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {pwError && <p style={{ fontSize: 12, color: 'var(--red)', marginTop: 4 }}>{pwError}</p>}
              </Field>

              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}
                disabled={passwordMutation.isPending || !pwForm.current || !pwForm.next || !pwForm.confirm}>
                {passwordMutation.isPending
                  ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Changing…</>
                  : <><Lock size={16} /> Change password</>}
              </button>
            </div>
          </form>
        )}

        {/* ── Export tab ───────────────────────────────────────────────────── */}
        {tab === 'export' && (
          <div className="stack" style={{ gap: 20 }}>

            {/* Info banner */}
            <div style={{ display: 'flex', gap: 10, padding: '12px 14px', background: 'var(--green-50, #f0fdf4)', border: '1px solid #bbf7d0', borderRadius: 'var(--r)' }}>
              <Download size={18} style={{ color: 'var(--green)', flexShrink: 0, marginTop: 2 }} />
              <div>
                <p className="small" style={{ fontWeight: 600, color: 'var(--green)' }}>Export your data</p>
                <p className="small" style={{ color: 'var(--green)', opacity: 0.85 }}>
                  Download all invoices as CSV (for spreadsheets) or JSON (for integrations).
                </p>
              </div>
            </div>

            {/* Filters */}
            <div style={{ padding: '16px', background: 'var(--hover)', borderRadius: 'var(--r)' }}>
              <h3 className="h3" style={{ marginBottom: 14 }}>Filter data <span className="cap" style={{ fontWeight: 400 }}>(optional)</span></h3>
              <div className="grid-2" style={{ gap: 12 }}>
                <Field label="Category">
                  <select className="select" value={expFilters.category}
                    onChange={e => setExpFilters(f => ({ ...f, category: e.target.value }))}>
                    <option value="">All categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Vendor name">
                  <input className="input" value={expFilters.vendor} placeholder="e.g. Amazon"
                    onChange={e => setExpFilters(f => ({ ...f, vendor: e.target.value }))} />
                </Field>
                <Field label="From date">
                  <input type="date" className="input" value={expFilters.dateFrom}
                    onChange={e => setExpFilters(f => ({ ...f, dateFrom: e.target.value }))} />
                </Field>
                <Field label="To date">
                  <input type="date" className="input" value={expFilters.dateTo}
                    onChange={e => setExpFilters(f => ({ ...f, dateTo: e.target.value }))} />
                </Field>
              </div>
              {(expFilters.category || expFilters.vendor || expFilters.dateFrom || expFilters.dateTo) && (
                <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 10 }}
                  onClick={() => setExpFilters({ category: '', vendor: '', dateFrom: '', dateTo: '' })}>
                  <Icon name="close" size={14} /> Clear filters
                </button>
              )}
            </div>

            {/* Export buttons */}
            <div className="grid-2" style={{ gap: 14 }}>
              <div className="card card-pad" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
                <h3 className="h3" style={{ marginBottom: 4 }}>Export as CSV</h3>
                <p className="small" style={{ marginBottom: 14 }}>Perfect for spreadsheets and data analysis</p>
                <button className="btn btn-primary btn-lg" style={{ width: '100%' }}
                  onClick={() => exportCSV.mutate(exportParams())}
                  disabled={exportCSV.isPending}>
                  {exportCSV.isPending
                    ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Exporting…</>
                    : <><Download size={17} /> Export CSV</>}
                </button>
              </div>

              <div className="card card-pad" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                <h3 className="h3" style={{ marginBottom: 4 }}>Export as JSON</h3>
                <p className="small" style={{ marginBottom: 14 }}>Perfect for integrations and backups</p>
                <button className="btn btn-primary btn-lg" style={{ width: '100%' }}
                  onClick={() => exportJSON.mutate(exportParams())}
                  disabled={exportJSON.isPending}>
                  {exportJSON.isPending
                    ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Exporting…</>
                    : <><Download size={17} /> Export JSON</>}
                </button>
              </div>
            </div>

            <div style={{ padding: '12px 14px', background: 'var(--hover)', borderRadius: 'var(--r)' }}>
              <p className="small"><strong>Tip:</strong> Files are downloaded with a timestamp, e.g. <code className="mono">invoices-2026-06-23.csv</code></p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
