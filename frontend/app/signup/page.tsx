'use client';
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { useSignup } from '@/hooks/useAuth';

interface ValidationState {
  length: boolean;
  uppercase: boolean;
  number: boolean;
}

function Rule({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      {ok
        ? <Check size={13} style={{ color: 'var(--green)', flexShrink: 0 }} />
        : <X    size={13} style={{ color: 'var(--red)',   flexShrink: 0 }} />}
      <span className="cap" style={{ color: ok ? 'var(--green)' : 'var(--ink-3)' }}>{label}</span>
    </div>
  );
}

export default function SignupPage() {
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPassword, setShowPw] = useState(false);
  const [showConfirm, setShowCf]  = useState(false);
  const [confirmErr, setConfirmErr] = useState('');
  const signup = useSignup();

  const validation: ValidationState = {
    length:    password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number:    /[0-9]/.test(password),
  };
  const passwordValid  = Object.values(validation).every(Boolean);
  const passwordsMatch = password === confirm && password.length > 0;
  const canSubmit      = name.trim().length >= 2 && email && passwordValid && passwordsMatch && !signup.isPending;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!passwordsMatch) { setConfirmErr('Passwords do not match'); return; }
    setConfirmErr('');
    signup.mutate({ email: email.trim(), password });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)', padding: 'var(--lg)' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--xl)' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, margin: '0 auto 14px',
            background: 'linear-gradient(135deg, var(--blue), #6366F1)',
            display: 'grid', placeItems: 'center', boxShadow: '0 4px 16px rgba(59,130,246,.35)',
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <h1 className="h2">Create account</h1>
          <p className="small" style={{ marginTop: 6, color: 'var(--ink-2)' }}>Join InvoiceAI Pro today</p>
        </div>

        {/* Card */}
        <div className="card card-pad">

          {/* API error banner */}
          {signup.isError && (
            <div style={{
              background: 'var(--red-50)', border: '1px solid var(--red)', borderRadius: 'var(--r)',
              padding: '10px 14px', marginBottom: 'var(--md)', display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <X size={16} style={{ color: 'var(--red)', flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 13, color: 'var(--red)', margin: 0 }}>
                {(signup.error as any)?.response?.data?.detail || 'Signup failed. Please try again.'}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--md)' }}>

            {/* Full name */}
            <div className="field">
              <label className="label" htmlFor="name">Full name</label>
              <div className="input-wrap">
                <svg className="ic" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <input id="name" type="text" className="input" placeholder="Alex Rivera" minLength={2}
                  value={name} onChange={e => setName(e.target.value)} required disabled={signup.isPending} />
              </div>
            </div>

            {/* Email */}
            <div className="field">
              <label className="label" htmlFor="email">Email address</label>
              <div className="input-wrap">
                <svg className="ic" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                <input id="email" type="email" className="input" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required disabled={signup.isPending} />
              </div>
            </div>

            {/* Password */}
            <div className="field">
              <label className="label" htmlFor="password">Password</label>
              <div className="input-wrap" style={{ position: 'relative' }}>
                <svg className="ic" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input id="password" type={showPassword ? 'text' : 'password'} className="input"
                  placeholder="••••••••" style={{ paddingRight: 40,
                    borderColor: password ? (passwordValid ? 'var(--green)' : undefined) : undefined }}
                  value={password} onChange={e => setPassword(e.target.value)} required disabled={signup.isPending} />
                <button type="button" onClick={() => setShowPw(v => !v)} tabIndex={-1}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', padding: 2, display: 'flex' }}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {/* Validation checklist */}
              {password.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 6 }}>
                  <Rule ok={validation.length}    label="At least 8 characters" />
                  <Rule ok={validation.uppercase} label="At least 1 uppercase letter" />
                  <Rule ok={validation.number}    label="At least 1 number" />
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="field">
              <label className="label" htmlFor="confirm">Confirm password</label>
              <div className="input-wrap" style={{ position: 'relative' }}>
                <svg className="ic" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input id="confirm" type={showConfirm ? 'text' : 'password'} className="input"
                  placeholder="••••••••" style={{ paddingRight: 40,
                    borderColor: confirm ? (passwordsMatch ? 'var(--green)' : 'var(--red)') : undefined }}
                  value={confirm} onChange={e => { setConfirm(e.target.value); setConfirmErr(''); }} required disabled={signup.isPending} />
                <button type="button" onClick={() => setShowCf(v => !v)} tabIndex={-1}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', padding: 2, display: 'flex' }}>
                  {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {(confirmErr || (confirm && !passwordsMatch)) && (
                <p style={{ fontSize: 12, color: 'var(--red)', margin: '4px 0 0' }}>Passwords do not match</p>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={!canSubmit} style={{ width: '100%', marginTop: 4 }}>
              {signup.isPending
                ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating account…</>
                : 'Create account'}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p className="small" style={{ textAlign: 'center', marginTop: 'var(--lg)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--blue)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
