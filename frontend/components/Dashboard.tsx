'use client';
import { useDashboardData, useCategoryBreakdown } from '@/hooks/useDocuments';
import { VENDOR_COLORS } from '@/lib/data';
import { fmtMoney, fmtDate } from '@/lib/formatters';
import Icon from './Icon';
import Metric from './ui/Metric';
import VendorLogo from './ui/VendorLogo';
import BarChart from './BarChart';
import UploadZone from './UploadZone';

export default function Dashboard() {
  const { data: summary, isPending: summaryPending } = useDashboardData();
  const { data: breakdown }                          = useCategoryBreakdown();

  const total    = summary?.total_amount ?? 0;
  const totalDoc = summary?.total_documents ?? 0;
  const avg      = totalDoc ? total / totalDoc : 0;
  const recent   = summary?.recent_extractions ?? [];

  const chartData = (breakdown?.data ?? [])
    .map(d => ({ label: d.category, value: Math.round(d.amount) }))
    .filter(d => d.value > 0)
    .slice(0, 6);

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

      {summaryPending ? (
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="card" style={{ flex: 1, height: 96, background: 'var(--hover)', borderRadius: 'var(--r)' }} />
          ))}
        </div>
      ) : (
        <div className="metrics-grid">
          <Metric icon="doc"    label="Total documents" value={totalDoc}        trend={0}  tint="blue" />
          <Metric icon="dollar" label="Total amount"     value={fmtMoney(total)} trend={0}  tint="green" />
          <Metric icon="wallet" label="Avg. invoice"     value={fmtMoney(avg)}  trend={0}  tint="cyan" />
          <Metric icon="clock"  label="Categories"       value={breakdown?.data.length ?? 0} tint="orange" />
        </div>
      )}

      <div className="dash-grid">
        <div className="stack">
          <div className="card card-pad">
            <div className="card-head">
              <h3 className="h3">Upload invoice</h3>
              <span className="badge badge-gray">
                <Icon name="sparkle" size={12} /> AI extraction
              </span>
            </div>
            <UploadZone big />
          </div>

          <div className="card card-pad">
            <div className="card-head">
              <h3 className="h3">Expenses by category</h3>
              <span className="small muted">{fmtMoney(total)} total</span>
            </div>
            {chartData.length
              ? <BarChart data={chartData} />
              : <p className="small muted" style={{ padding: '40px 0', textAlign: 'center' }}>No data yet — upload an invoice to get started</p>}
          </div>
        </div>

        <div className="card card-pad">
          <div className="card-head">
            <h3 className="h3">Recent activity</h3>
          </div>
          <div className="activity">
            {recent.length === 0 && !summaryPending && (
              <p className="small muted" style={{ padding: '40px 0', textAlign: 'center' }}>No invoices yet</p>
            )}
            {recent.map(ext => {
              const vendor = ext.vendor_name || 'Unknown';
              const color  = VENDOR_COLORS[vendor] || '#6B7280';
              return (
                <div key={ext.id} className="act-item">
                  <VendorLogo vendor={vendor} color={color} size={38} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="body" style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {vendor}
                    </div>
                    <div className="cap">{fmtDate(ext.extracted_at)} · {ext.category || 'Other'}</div>
                  </div>
                  <div className="amount">{fmtMoney(ext.amount)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
