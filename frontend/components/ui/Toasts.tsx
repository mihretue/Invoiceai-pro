'use client';
import { useEffect } from 'react';
import Icon from '../Icon';
interface ToastItem {
  id: number;
  msg: string;
  type: 'success' | 'error' | 'info';
}

const TYPE_ICON: Record<string, string> = { success: 'checkCircle', error: 'xCircle', info: 'info' };

interface ToastProps {
  toast: ToastItem;
  remove: (id: number) => void;
}

function Toast({ toast, remove }: ToastProps) {
  useEffect(() => {
    if (toast.type === 'error') return;
    const dur = toast.type === 'info' ? 3000 : 3800;
    const id = setTimeout(() => remove(toast.id), dur);
    return () => clearTimeout(id);
  }, [toast, remove]);

  return (
    <div className={`toast t-${toast.type}`} onClick={() => remove(toast.id)}>
      <div className="t-ic">
        <Icon name={TYPE_ICON[toast.type] || 'info'} size={16} />
      </div>
      <span>{toast.msg}</span>
    </div>
  );
}

interface ToastHostProps {
  toasts: ToastItem[];
  remove: (id: number) => void;
}

export default function ToastHost({ toasts, remove }: ToastHostProps) {
  return (
    <div className="toasts">
      {toasts.map(t => <Toast key={t.id} toast={t} remove={remove} />)}
    </div>
  );
}
