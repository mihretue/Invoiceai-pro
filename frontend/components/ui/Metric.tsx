import Icon from '../Icon';

const TINT: Record<string, [string, string]> = {
  blue:   ['var(--blue-50)', 'var(--blue)'],
  green:  ['var(--green-50)', 'var(--green)'],
  orange: ['var(--orange-50)', 'var(--orange)'],
  cyan:   ['#ECFEFF', 'var(--cyan)'],
};

interface MetricProps {
  icon: string;
  label: string;
  value: string | number;
  trend?: number | null;
  tint?: string;
}

export default function Metric({ icon, label, value, trend, tint }: MetricProps) {
  const [bg, fg] = TINT[tint || ''] || TINT.blue;
  return (
    <div className="card metric">
      <div className="metric-top">
        <div className="metric-ic" style={{ background: bg, color: fg }}>
          <Icon name={icon} size={19} />
        </div>
        <span className="metric-label">{label}</span>
      </div>
      <div className="metric-val">{value}</div>
      {trend != null && (
        <div className={`metric-trend ${trend >= 0 ? 'trend-up' : 'trend-down'}`}>
          <Icon name={trend >= 0 ? 'trendUp' : 'trendDown'} size={14} />
          {(trend >= 0 ? '+' : '') + trend}% vs last month
        </div>
      )}
    </div>
  );
}
