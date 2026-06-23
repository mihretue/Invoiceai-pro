import Icon from '../Icon';
import { InvoiceStatus } from '@/lib/data';

interface StatusConfig {
  cls: string;
  ic: string;
  label: string;
}

const STATUS_MAP: Record<string, StatusConfig> = {
  extracted:  { cls: 'badge-green',  ic: 'check',  label: 'Extracted' },
  processing: { cls: 'badge-orange', ic: 'clock',  label: 'Processing' },
  failed:     { cls: 'badge-red',    ic: 'alert',  label: 'Failed' },
  pending:    { cls: 'badge-gray',   ic: 'clock',  label: 'Pending' },
};

interface StatusBadgeProps {
  status: InvoiceStatus | string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const s = STATUS_MAP[status] || STATUS_MAP.pending;
  return (
    <span className={`badge ${s.cls}`}>
      <Icon name={s.ic} size={12} />
      {s.label}
    </span>
  );
}
