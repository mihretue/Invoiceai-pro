'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { User, LogOut } from 'lucide-react';
import { useApp } from '@/lib/context';
import { useUserProfile, useLogout } from '@/hooks/useAuth';
import Icon from './Icon';

const LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/invoices',  label: 'Invoices'  },
  { href: '/settings',  label: 'Settings'  },
];

function initials(email: string): string {
  return email.slice(0, 2).toUpperCase();
}

export default function Nav() {
  const pathname  = usePathname();
  const router    = useRouter();
  const { theme, setTheme } = useApp();
  const { data: user }      = useUserProfile();
  const logout              = useLogout();

  const [menuOpen,   setMenuOpen]   = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const avatarLabel = user ? initials(user.email) : '??';

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close dropdown on route change
  useEffect(() => { setAvatarOpen(false); }, [pathname]);

  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="brand">
          <div className="brand-mark">
            <Icon name="sparkle" size={17} />
          </div>
          InvoiceAI <span style={{ color: 'var(--blue)', marginLeft: -4 }}>Pro</span>
        </div>

        <div className="nav-links">
          {LINKS.map(l => (
            <Link key={l.href} href={l.href} className={`nav-link${pathname === l.href ? ' active' : ''}`}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="nav-spacer" />

        <button className="icon-btn" title="Notifications">
          <Icon name="bell" size={18} />
        </button>
        <button
          className="icon-btn"
          title="Toggle theme"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          <Icon name={theme === 'light' ? 'moon' : 'sun'} size={18} />
        </button>

        {/* Avatar with dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            className="avatar"
            title={user?.email ?? 'Account'}
            onClick={() => setAvatarOpen(o => !o)}
            style={{ cursor: 'pointer', border: 'none', background: undefined }}
            aria-expanded={avatarOpen}
            aria-haspopup="true"
          >
            {avatarLabel}
          </button>

          {avatarOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              width: 200, background: 'var(--surface)',
              border: '1px solid var(--line)', borderRadius: 12,
              boxShadow: '0 8px 24px rgba(0,0,0,.12)',
              overflow: 'hidden', zIndex: 200,
            }}>
              {/* User info header */}
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--line-2)' }}>
                <p className="small" style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email ?? 'Account'}
                </p>
                <p className="cap" style={{ color: 'var(--ink-3)', marginTop: 2 }}>Signed in</p>
              </div>

              {/* Profile link */}
              <button
                onClick={() => { setAvatarOpen(false); router.push('/settings'); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', background: 'none', border: 'none',
                  cursor: 'pointer', color: 'var(--ink)', fontSize: 14,
                  textAlign: 'left',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <User size={15} style={{ color: 'var(--ink-2)', flexShrink: 0 }} />
                Profile
              </button>

              {/* Logout */}
              <button
                onClick={() => { setAvatarOpen(false); logout.mutate(); }}
                disabled={logout.isPending}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', background: 'none', border: 'none',
                  cursor: 'pointer', color: 'var(--red)', fontSize: 14,
                  textAlign: 'left', borderTop: '1px solid var(--line-2)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <LogOut size={15} style={{ flexShrink: 0 }} />
                {logout.isPending ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          )}
        </div>

        <button
          className="icon-btn mob-toggle"
          aria-label="Menu"
          onClick={() => setMenuOpen(o => !o)}
        >
          <Icon name={menuOpen ? 'close' : 'menu'} size={18} />
        </button>
      </div>

      <div className={`mob-menu${menuOpen ? ' open' : ''}`}>
        {LINKS.map(l => (
          <Link key={l.href} href={l.href} className={`nav-link${pathname === l.href ? ' active' : ''}`}
            onClick={() => setMenuOpen(false)}>
            {l.label}
          </Link>
        ))}
        <Link href="/settings" className="nav-link" onClick={() => setMenuOpen(false)}>
          Profile
        </Link>
        <button className="nav-link" onClick={() => { setMenuOpen(false); logout.mutate(); }}
          style={{ width: '100%', textAlign: 'left' }}>
          Sign out
        </button>
      </div>
    </nav>
  );
}
