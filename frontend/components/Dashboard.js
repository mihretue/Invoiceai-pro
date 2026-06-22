'use client';
import { useApp } from '@/lib/context';
import { useToasts } from '@/lib/context';
import { CATEGORIES } from '@/lib/data';
import { fmtMoney, fmtDate } from '@/lib/formatters';
import Icon from './Icon';
import Metric from './ui/Metric';
import VendorLogo from './ui/VendorLogo';
import StatusBadge from './ui/StatusBadge';
import ToastHost from './ui/Toasts';
import BarChart from './BarChart';
import UploadZone from './UploadZone';
import DetailModal from './DetailModal';
import { useState } from 'react';

export default function Dashboard() {
  const { invoices, addInvoice } = useApp();
  const { toasts, push, remove } = useToasts();
  const [detail, setDetail] = useState(null);

  const extracted = invoices.filter(i => i.status === 'extracted');
  const total = extracted.reduce((s, i) => s + (i.amount || 0), 0);
  const avg = extracted.length ? total / extracted.length : 0;
  const processing = invoices.filter(i => i.status === 'processing').length;

  const byCat = {};
  extracted.forEach(i => { byCat[i.category] = (byCat[i.category] || 0) + i.amount; });
  const chartData = CATEGORIES
    .map(c => ({ label: c, value: Math.round(byCat[c] || 0) }))
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const recent = invoices.slice(0, 6);

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="h1">Dashboard</h1>
          <p className="body muted sub">Upload an invoice and InvoiceAI extracts the details automatically.</p>
        </div>
        <span className="badge badge-green" style={{ height: 28 }}>
          <span className="dot" style={{ background: 'var(--green)' }} /> All systems operational
        </span>
      </div>

      <div className="metrics-grid">
        <Metric icon="doc"    label="Total documents" value={invoices.length} trend={15}  tint="blue" />
        <Metric icon="dollar" label="Total amount"     value={fmtMoney(total)} trend={8}  tint="green" />
        <Metric icon="wallet" label="Avg. invoice"     value={fmtMoney(avg)}  trend={-3}  tint="cyan" />
        <Metric icon="clock"  label="Processing"       value={processing}                 tint="orange" />
      </div>

      <div className="dash-grid">
        <div className="stack">
          <div className="card card-pad">
            <div className="card-head">
              <h3 className="h3">Upload invoice</h3>
              <span className="badge badge-gray">
                <Icon name="sparkle" size={12} /> AI extraction
              </span>
            </div>
            <UploadZone onExtracted={addInvoice} pushToast={push} big />
          </div>

          <div className="card card-pad">
            <div className="card-head">
              <h3 className="h3">Expenses by category</h3>
              <span className="small muted">{fmtMoney(total)} total</span>
            </div>
            {chartData.length
              ? <BarChart data={chartData} />
              : <p className="small muted" style={{ padding: '40px 0', textAlign: 'center' }}>No data yet</p>}
          </div>
        </div>

        <div className="card card-pad">
          <div className="card-head">
            <h3 className="h3">Recent activity</h3>
          </div>
          <div className="activity">
            {recent.map(inv => (
              <div
                key={inv.id}
                className="act-item"
                style={{ cursor: 'pointer' }}
                onClick={() => setDetail(inv)}
              >
                <VendorLogo vendor={inv.vendor} color={inv.color} size={38} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="body" style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {inv.vendor}
                  </div>
                  <div className="cap">{fmtDate(inv.date)} · {inv.category}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="amount">{fmtMoney(inv.amount)}</div>
                  {inv.status !== 'extracted' && (
                    <div style={{ marginTop: 3 }}><StatusBadge status={inv.status} /></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {detail && (
        <DetailModal
          invoice={detail}
          onClose={() => setDetail(null)}
          pushToast={push}
        />
      )}
      <ToastHost toasts={toasts} remove={remove} />
    </div>
  );
}
