'use client';
import { useState, useEffect } from 'react';
import { fmtMoney, fmtMoneyShort } from '@/lib/formatters';

interface BarDataItem {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarDataItem[];
}

export default function BarChart({ data }: BarChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const max = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="chart">
      {data.map((d, i) => (
        <div className="bar-col" key={d.label}>
          <div className="bar-track">
            <div
              className="bar"
              style={{
                height: mounted ? (d.value / max * 100) + '%' : '0%',
                transitionDelay: (i * 55) + 'ms',
              }}
              title={`${d.label}: ${fmtMoney(d.value)}`}
            >
              <span className="bar-val">{fmtMoneyShort(d.value)}</span>
            </div>
          </div>
          <div className="bar-label">{d.label}</div>
        </div>
      ))}
    </div>
  );
}
