'use client';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { FileText, DollarSign, TrendingUp, Users } from 'lucide-react';
import {
  useDashboardSummary,
  useCategoryBreakdown,
  useMonthlyTrend,
  useTopVendors,
} from '@/hooks/useDashboard';
import MetricCard from '@/components/MetricCard';
import UploadZone from '@/components/UploadZone';
import { fmtMoney } from '@/lib/formatters';

function ChartCard({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="card card-pad">
      <div className="card-head" style={{ marginBottom: 16 }}>
        <h3 className="h3">{title}</h3>
        {sub && <span className="small muted">{sub}</span>}
      </div>
      {children}
    </div>
  );
}

const CHART_COLORS = {
  bar:  '#3B82F6',
  line: '#22C55E',
};

export default function DashboardPage() {
  const { data: summary,   isPending: summaryPending }   = useDashboardSummary();
  const { data: breakdown, isPending: breakdownPending } = useCategoryBreakdown();
  const { data: trend,     isPending: trendPending }     = useMonthlyTrend();
  const { data: vendors,   isPending: vendorsPending }   = useTopVendors();

  const total    = summary?.total_amount ?? 0;
  const totalDoc = summary?.total_documents ?? 0;
  const avg      = totalDoc ? total / totalDoc : 0;
  const catCount = breakdown?.data.length ?? 0;

  const barData  = (breakdown?.data ?? []).map(d => ({ name: d.category, amount: Math.round(d.amount) }));
  const lineData = (trend?.data ?? []).map(d => ({ name: d.month, amount: Math.round(d.amount) }));
  const topVendors = (vendors?.data ?? []).slice(0, 5);

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="h1">Dashboard</h1>
          <p className="body muted sub">Your invoice overview at a glance.</p>
        </div>
        <span className="badge badge-green" style={{ height: 28 }}>
          <span className="dot" style={{ background: 'var(--green)' }} /> AI ready
        </span>
      </div>

      {/* Metric cards */}
      <div className="metrics-grid" style={{ marginBottom: 24 }}>
        <MetricCard
          label="Total documents"
          value={totalDoc}
          sub="All time uploads"
          icon={<FileText size={20} />}
          tint="blue"
          loading={summaryPending}
        />
        <MetricCard
          label="Total amount"
          value={fmtMoney(total)}
          sub="Across all invoices"
          icon={<DollarSign size={20} />}
          tint="green"
          loading={summaryPending}
        />
        <MetricCard
          label="Average invoice"
          value={fmtMoney(avg)}
          sub="Per document"
          icon={<TrendingUp size={20} />}
          tint="cyan"
          loading={summaryPending}
        />
        <MetricCard
          label="Categories"
          value={catCount}
          sub="Distinct spend types"
          icon={<Users size={20} />}
          tint="purple"
          loading={breakdownPending}
        />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

        {/* Bar chart — spend by category */}
        <ChartCard title="Spend by category" sub={fmtMoney(breakdown?.total ?? 0) + ' total'}>
          {breakdownPending ? (
            <div style={{ height: 240, background: 'var(--hover)', borderRadius: 8 }} />
          ) : barData.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--ink-3)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--ink-3)' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                <Tooltip
                  formatter={(v: number) => [fmtMoney(v), 'Amount']}
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="amount" fill={CHART_COLORS.bar} radius={[4, 4, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 240, display: 'grid', placeItems: 'center' }}>
              <p className="small muted">No data yet — upload an invoice to get started</p>
            </div>
          )}
        </ChartCard>

        {/* Line chart — monthly trend */}
        <ChartCard title="Monthly trend" sub={fmtMoney(trend?.total ?? 0) + ' this period'}>
          {trendPending ? (
            <div style={{ height: 240, background: 'var(--hover)', borderRadius: 8 }} />
          ) : lineData.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={lineData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--ink-3)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--ink-3)' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                <Tooltip
                  formatter={(v: number) => [fmtMoney(v), 'Amount']}
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 12 }}
                />
                <Line dataKey="amount" stroke={CHART_COLORS.line} strokeWidth={2.5}
                  dot={{ fill: CHART_COLORS.line, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 240, display: 'grid', placeItems: 'center' }}>
              <p className="small muted">No trend data yet</p>
            </div>
          )}
        </ChartCard>
      </div>

      {/* Bottom row: upload + top vendors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        <div className="card card-pad">
          <div className="card-head" style={{ marginBottom: 16 }}>
            <h3 className="h3">Upload invoice</h3>
            <span className="badge badge-gray" style={{ fontSize: 11 }}>AI extraction</span>
          </div>
          <UploadZone big />
        </div>

        {/* Top vendors */}
        <ChartCard title="Top vendors" sub="By total spend">
          {vendorsPending ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} style={{ height: 36, background: 'var(--hover)', borderRadius: 6 }} />
              ))}
            </div>
          ) : topVendors.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {topVendors.map((v, i) => {
                const max = topVendors[0].total_amount || 1;
                const pct = Math.round((v.total_amount / max) * 100);
                return (
                  <div key={v.vendor_name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                    <span className="cap" style={{ width: 18, color: 'var(--ink-3)', textAlign: 'right', flexShrink: 0 }}>
                      {i + 1}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span className="body" style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {v.vendor_name}
                        </span>
                        <span className="small" style={{ flexShrink: 0, marginLeft: 8 }}>{fmtMoney(v.total_amount)}</span>
                      </div>
                      <div style={{ height: 4, background: 'var(--hover)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: CHART_COLORS.bar, borderRadius: 4, transition: 'width .3s' }} />
                      </div>
                    </div>
                    <span className="cap" style={{ flexShrink: 0, color: 'var(--ink-3)' }}>{v.count}×</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ height: 180, display: 'grid', placeItems: 'center' }}>
              <p className="small muted">No vendors yet</p>
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
