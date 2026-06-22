import Icon from '../Icon';

const STATUS_MAP = {
  extracted:  { cls: 'badge-green',  ic: 'check',  label: 'Extracted' },
  processing: { cls: 'badge-orange', ic: 'clock',  label: 'Processing' },
  failed:     { cls: 'badge-red',    ic: 'alert',  label: 'Failed' },
  pending:    { cls: 'badge-gray',   ic: 'clock',  label: 'Pending' },
};

export default function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.pending;
  return (
    <span className={`badge ${s.cls}`}>
      <Icon name={s.ic} size={12} />
      {s.label}
    </span>
  );
}
