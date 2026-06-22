'use client';
import { useEffect } from 'react';
import Icon from '../Icon';

const TYPE_ICON = { success: 'checkCircle', error: 'xCircle', info: 'info' };

function Toast({ toast, remove }) {
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

export default function ToastHost({ toasts, remove }) {
  return (
    <div className="toasts">
      {toasts.map(t => <Toast key={t.id} toast={t} remove={remove} />)}
    </div>
  );
}
