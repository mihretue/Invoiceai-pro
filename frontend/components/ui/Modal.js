'use client';
import { useEffect } from 'react';

export default function Modal({ children, onClose, size }) {
  useEffect(() => {
    const handle = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handle);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handle);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="scrim"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`modal${size === 'sm' ? ' sm' : ''}`} role="dialog" aria-modal="true">
        {children}
      </div>
    </div>
  );
}
