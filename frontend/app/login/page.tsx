'use client';
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useLogin } from '@/hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const login = useLogin();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login.mutate({ email: email.trim(), password });
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
          <h1 className="h2">InvoiceAI Pro</h1>
          <p className="small" style={{ marginTop: 6, color: 'var(--ink-2)' }}>Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="card card-pad">

          {/* Error banner */}
          {login.isError && (
            <div style={{
              background: 'var(--red-50)', border: '1px solid var(--red)', borderRadius: 'var(--r)',
              padding: '10px 14px', marginBottom: 'var(--md)', display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p style={{ fontSize: 13, color: 'var(--red)', margin: 0 }}>
                {(login.error as any)?.response?.data?.detail || 'Login failed. Please try again.'}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--md)' }}>

            {/* Email */}
            <div className="field">
              <label className="label" htmlFor="email">Email address</label>
              <div className="input-wrap">
                <svg className="ic" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                <input id="email" type="email" className="input" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required disabled={login.isPending} />
              </div>
            </div>

            {/* Password with show/hide */}
            <div className="field">
              <label className="label" htmlFor="password">Password</label>
              <div className="input-wrap" style={{ position: 'relative' }}>
                <svg className="ic" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input id="password" type={showPassword ? 'text' : 'password'} className="input"
                  placeholder="••••••••" style={{ paddingRight: 40 }}
                  value={password} onChange={e => setPassword(e.target.value)} required disabled={login.isPending} />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', padding: 2, display: 'flex' }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={login.isPending} style={{ width: '100%', marginTop: 4 }}>
              {login.isPending
                ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Logging in…</>
                : 'Sign in'}
            </button>
          </form>

          {/* Demo credentials */}
          <div style={{
            marginTop: 'var(--md)', padding: '10px 14px',
            background: 'var(--blue-50)', borderRadius: 'var(--r)', border: '1px solid var(--blue-100)',
          }}>
            <p className="small" style={{ marginBottom: 6 }}><strong>Demo:</strong> test@example.com / password123</p>
            <button type="button" className="btn btn-text" style={{ fontSize: 12, height: 'auto', padding: '2px 0' }}
              onClick={() => { setEmail('test@example.com'); setPassword('password123'); }}>
              Fill demo credentials
            </button>
          </div>
        </div>

        {/* Footer link */}
        <p className="small" style={{ textAlign: 'center', marginTop: 'var(--lg)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" style={{ color: 'var(--blue)', fontWeight: 600, textDecoration: 'none' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
