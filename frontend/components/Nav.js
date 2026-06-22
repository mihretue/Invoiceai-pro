'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useApp } from '@/lib/context';
import Icon from './Icon';

const LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/invoices', label: 'Invoices' },
  { href: '/settings', label: 'Settings' },
];

export default function Nav({ pushToast }) {
  const pathname = usePathname();
  const { theme, setTheme } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

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
            <Link
              key={l.href}
              href={l.href}
              className={`nav-link${pathname === l.href ? ' active' : ''}`}
            >
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
        <div className="avatar" title="Alex Rivera">AR</div>

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
          <Link
            key={l.href}
            href={l.href}
            className={`nav-link${pathname === l.href ? ' active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
