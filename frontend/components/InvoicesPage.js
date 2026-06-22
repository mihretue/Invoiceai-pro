'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { useToasts } from '@/lib/context';
import { CATEGORIES } from '@/lib/data';
import { fmtMoney, fmtDateShort } from '@/lib/formatters';
import Icon from './Icon';
import VendorLogo from './ui/VendorLogo';
import StatusBadge from './ui/StatusBadge';
import ConfirmDialog from './ui/ConfirmDialog';
import ToastHost from './ui/Toasts';
import DetailModal from './DetailModal';

function SortHeader({ label, col, sort, setSort, align }) {
  const active = sort.col === col;
  return (
    <th
      onClick={() => setSort(s => ({ col, dir: s.col === col && s.dir === 'asc' ? 'desc' : 'asc' }))}
      style={align === 'right' ? { textAlign: 'right' } : undefined}
    >
      <span className="th-inner" style={align === 'right' ? { flexDirection: 'row-reverse' } : undefined}>
        {label}
        <Icon
          name={active ? (sort.dir === 'asc' ? 'arrowUp' : 'arrowDown') : 'sort'}
          size={13}
          style={active ? { opacity: 1, color: 'var(--blue)' } : undefined}
        />
      </span>
    </th>
  );
}

const PER_PAGE = 8;

export default function InvoicesPage() {
  const { invoices, deleteInvoice } = useApp();
  const { toasts, push, remove } = useToasts();
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState({ col: 'date', dir: 'desc' });
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState(null); // { invoice, edit }
  const [confirm, setConfirm] = useState(null);

  let rows = invoices.filter(i => {
    if (cat !== 'all' && i.category !== cat) return false;
    if (status !== 'all' && i.status !== status) return false;
    if (search && !i.vendor.toLowerCase().includes(search.toLowerCase()) &&
        !i.number.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  rows = [...rows].sort((a, b) => {
    const dir = sort.dir === 'asc' ? 1 : -1;
    let av = a[sort.col], bv = b[sort.col];
    if (sort.col === 'amount') { av = av || 0; bv = bv || 0; }
    if (typeof av === 'string') return av.localeCompare(bv) * dir;
    return (av - bv) * dir;
  });

  const pages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const cur = Math.min(page, pages);
  const pageRows = rows.slice((cur - 1) * PER_PAGE, cur * PER_PAGE);

  useEffect(() => { setPage(1); }, [search, cat, status]);

  function exportCSV() {
    const head = ['Invoice #', 'Vendor', 'Date', 'Amount', 'Category', 'Status'];
    const lines = rows.map(i => [i.number, i.vendor, i.date, i.amount ?? '', i.category, i.status]);
    const csv = [head, ...lines].map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'invoices.csv';
    a.click();
    URL.revokeObjectURL(a.href);
    push(`Exported ${rows.length} invoices to CSV`, 'success');
  }

  const activeFilters = cat !== 'all' || status !== 'all' || search;

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="h1">Invoices</h1>
          <p className="body muted sub">{rows.length} of {invoices.length} documents</p>
        </div>
        <button className="btn btn-secondary" onClick={exportCSV}>
          <Icon name="download" size={17} /> Export CSV
        </button>
      </div>

      <div className="filters">
        <div className="input-wrap" style={{ position: 'relative' }}>
          <Icon name="search" size={17} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }} />
          <input
            className="input"
            style={{ paddingLeft: 36 }}
            placeholder="Search vendor or invoice #…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="select" value={cat} onChange={e => setCat(e.target.value)}>
          <option value="all">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="select" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="all">All statuses</option>
          {['extracted', 'processing', 'failed'].map(s => (
            <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        {activeFilters && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setCat('all'); setStatus('all'); }}>
            <Icon name="close" size={14} /> Clear
          </button>
        )}
      </div>

      <div className="card">
        {rows.length === 0 ? (
          <div className="empty">
            <div className="empty-ic"><Icon name="search" size={30} /></div>
            <h3 className="h3">No invoices match</h3>
            <p className="small">Try adjusting your filters or search.</p>
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <SortHeader label="Vendor"    col="vendor" sort={sort} setSort={setSort} />
                    <SortHeader label="Invoice #" col="number" sort={sort} setSort={setSort} />
                    <SortHeader label="Date"      col="date"   sort={sort} setSort={setSort} />
                    <SortHeader label="Amount"    col="amount" sort={sort} setSort={setSort} align="right" />
                    <th className="no-sort">Category</th>
                    <th className="no-sort">Status</th>
                    <th className="no-sort" style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map(inv => (
                    <tr key={inv.id} onClick={() => setDetail({ invoice: inv })}>
                      <td>
                        <div className="vendor-cell">
                          <VendorLogo vendor={inv.vendor} color={inv.color} />
                          <div>
                            <div style={{ fontWeight: 600 }}>{inv.vendor}</div>
                            <div className="cap">{inv.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="mono small">{inv.number}</td>
                      <td className="small">{fmtDateShort(inv.date)}</td>
                      <td className="amount" style={{ textAlign: 'right' }}>{fmtMoney(inv.amount)}</td>
                      <td><span className="badge badge-gray">{inv.category}</span></td>
                      <td><StatusBadge status={inv.status} /></td>
                      <td>
                        <div className="row-actions" onClick={e => e.stopPropagation()}>
                          <button className="act-btn" title="View" onClick={() => setDetail({ invoice: inv })}>
                            <Icon name="eye" size={16} />
                          </button>
                          <button className="act-btn" title="Edit" onClick={() => setDetail({ invoice: inv, edit: true })}>
                            <Icon name="edit" size={16} />
                          </button>
                          <button className="act-btn" title="Download" onClick={() => push(`Downloading ${inv.number}…`, 'info')}>
                            <Icon name="download" size={16} />
                          </button>
                          <button className="act-btn danger" title="Delete" onClick={() => setConfirm(inv)}>
                            <Icon name="trash" size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pager">
              <span className="small muted">Page {cur} of {pages} · {rows.length} results</span>
              <div className="pg-btns">
                <button className="pg" disabled={cur === 1} onClick={() => setPage(cur - 1)}>
                  <Icon name="chevL" size={15} />
                </button>
                {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                  <button key={p} className={`pg${p === cur ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                ))}
                <button className="pg" disabled={cur === pages} onClick={() => setPage(cur + 1)}>
                  <Icon name="chevR" size={15} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {detail && (
        <DetailModal
          invoice={detail.invoice}
          startEdit={detail.edit}
          onClose={() => setDetail(null)}
          pushToast={push}
        />
      )}

      {confirm && (
        <ConfirmDialog
          title="Delete invoice?"
          message={`This will permanently remove ${confirm.vendor} (${confirm.number}). This cannot be undone.`}
          confirmLabel="Delete invoice"
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            deleteInvoice(confirm.id);
            push(`Deleted ${confirm.number}`, 'success');
            setConfirm(null);
          }}
        />
      )}

      <ToastHost toasts={toasts} remove={remove} />
    </div>
  );
}
