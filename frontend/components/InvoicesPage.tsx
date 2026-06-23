'use client';
import { useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { useExtractions, useDeleteExtraction } from '@/hooks/useDocuments';
import { CATEGORIES, VENDOR_COLORS, Invoice } from '@/lib/data';
import { fmtMoney, fmtDateShort } from '@/lib/formatters';
import type { ApiExtraction } from '@/lib/types';
import Icon from './Icon';
import VendorLogo from './ui/VendorLogo';
import StatusBadge from './ui/StatusBadge';
import ConfirmDialog from './ui/ConfirmDialog';
import DetailModal from './DetailModal';

function toInvoice(ext: ApiExtraction): Invoice {
  const vendor = ext.vendor_name || 'Unknown';
  return {
    id:          String(ext.id),
    number:      ext.invoice_number || `EXT-${ext.id}`,
    vendor,
    color:       VENDOR_COLORS[vendor] || '#6B7280',
    date:        ext.invoice_date || ext.extracted_at.slice(0, 10),
    amount:      ext.amount,
    category:    ext.category || 'Other',
    status:      'extracted',
    description: ext.description || '',
    confidence:  null,
  };
}

interface SortState { col: string; dir: 'asc' | 'desc'; }

function SortHeader({ label, col, sort, setSort, align }: {
  label: string; col: string; sort: SortState;
  setSort: React.Dispatch<React.SetStateAction<SortState>>; align?: 'right';
}) {
  const active = sort.col === col;
  return (
    <th onClick={() => setSort(s => ({ col, dir: s.col === col && s.dir === 'asc' ? 'desc' : 'asc' }))}
      style={align === 'right' ? { textAlign: 'right' } : undefined}>
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
  const { data: extractions = [], isPending } = useExtractions();
  const deleteMutation = useDeleteExtraction();

  const invoices = extractions.map(toInvoice);

  const [search, setSearch]           = useState('');
  const [cat, setCat]                 = useState('all');
  const [status, setStatus]           = useState('all');
  const [sort, setSort]               = useState<SortState>({ col: 'date', dir: 'desc' });
  const [page, setPage]               = useState(1);
  const [detail, setDetail]           = useState<{ invoice: Invoice; edit?: boolean } | null>(null);
  const [confirm, setConfirm]         = useState<Invoice | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkConfirm, setBulkConfirm] = useState(false);

  let rows = invoices.filter(i => {
    if (cat !== 'all' && i.category !== cat) return false;
    if (status !== 'all' && i.status !== status) return false;
    if (search && !i.vendor.toLowerCase().includes(search.toLowerCase()) &&
        !i.number.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  rows = [...rows].sort((a, b) => {
    const dir = sort.dir === 'asc' ? 1 : -1;
    const av = (a as any)[sort.col], bv = (b as any)[sort.col];
    const an = sort.col === 'amount' ? (av || 0) : av;
    const bn = sort.col === 'amount' ? (bv || 0) : bv;
    if (typeof an === 'string') return an.localeCompare(bn) * dir;
    return (an - bn) * dir;
  });

  const pages   = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const cur     = Math.min(page, pages);
  const pageRows = rows.slice((cur - 1) * PER_PAGE, cur * PER_PAGE);

  useEffect(() => { setPage(1); setSelectedIds(new Set()); }, [search, cat, status]);

  const allPageSelected = pageRows.length > 0 && pageRows.every(r => selectedIds.has(r.id));

  function toggleSelectAll() {
    if (allPageSelected) {
      setSelectedIds(prev => { const n = new Set(prev); pageRows.forEach(r => n.delete(r.id)); return n; });
    } else {
      setSelectedIds(prev => { const n = new Set(prev); pageRows.forEach(r => n.add(r.id)); return n; });
    }
  }

  function toggleSelectRow(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function confirmBulkDelete() {
    const ids = Array.from(selectedIds);
    ids.forEach(id => deleteMutation.mutate(parseInt(id)));
    setSelectedIds(new Set());
    setBulkConfirm(false);
  }

  function exportCSV(): void {
    const head  = ['Invoice #', 'Vendor', 'Date', 'Amount', 'Category', 'Status'];
    const lines = rows.map(i => [i.number, i.vendor, i.date, i.amount ?? '', i.category, i.status]);
    const csv   = [head, ...lines].map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob  = new Blob([csv], { type: 'text/csv' });
    const a     = document.createElement('a');
    a.href      = URL.createObjectURL(blob);
    a.download  = 'invoices.csv';
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success(`Exported ${rows.length} invoices to CSV`);
  }

  if (isPending) {
    return (
      <div>
        <div className="page-head">
          <div><h1 className="h1">Invoices</h1></div>
        </div>
        <div className="card" style={{ height: 300, display: 'grid', placeItems: 'center' }}>
          <div className="spinner" />
        </div>
      </div>
    );
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
          <input className="input" style={{ paddingLeft: 36 }} placeholder="Search vendor or invoice #…"
            value={search} onChange={e => setSearch(e.target.value)} />
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

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px', marginBottom: 12,
          background: 'var(--blue-50)', border: '1px solid var(--blue-100)', borderRadius: 'var(--r)',
        }}>
          <span className="small" style={{ fontWeight: 600, color: 'var(--blue)' }}>
            {selectedIds.size} item{selectedIds.size !== 1 ? 's' : ''} selected
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelectedIds(new Set())}>
              <Icon name="close" size={14} /> Clear
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => setBulkConfirm(true)}>
              <Trash2 size={14} /> Delete selected
            </button>
          </div>
        </div>
      )}

      <div className="card">
        {rows.length === 0 ? (
          <div className="empty">
            <div className="empty-ic"><Icon name="search" size={30} /></div>
            <h3 className="h3">{invoices.length === 0 ? 'No invoices yet' : 'No invoices match'}</h3>
            <p className="small">{invoices.length === 0 ? 'Upload an invoice to get started.' : 'Try adjusting your filters or search.'}</p>
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th className="no-sort" style={{ width: 40 }}>
                      <input type="checkbox" checked={allPageSelected} onChange={toggleSelectAll} />
                    </th>
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
                    <tr key={inv.id} onClick={() => setDetail({ invoice: inv })}
                      className={selectedIds.has(inv.id) ? 'selected' : ''}>
                      <td onClick={e => toggleSelectRow(inv.id, e)}>
                        <input type="checkbox" checked={selectedIds.has(inv.id)} onChange={() => {}} />
                      </td>
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
                          <button className="act-btn" title="View"  onClick={() => setDetail({ invoice: inv })}>
                            <Icon name="eye" size={16} />
                          </button>
                          <button className="act-btn" title="Edit"  onClick={() => setDetail({ invoice: inv, edit: true })}>
                            <Icon name="edit" size={16} />
                          </button>
                          <button className="act-btn" title="Download" onClick={() => toast.info(`Downloading ${inv.number}…`)}>
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
        />
      )}

      {confirm && (
        <ConfirmDialog
          title="Delete invoice?"
          message={`This will permanently remove ${confirm.vendor} (${confirm.number}). This cannot be undone.`}
          confirmLabel="Delete invoice"
          isPending={deleteMutation.isPending}
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            deleteMutation.mutate(parseInt(confirm!.id), { onSuccess: () => setConfirm(null), onError: () => setConfirm(null) });
          }}
        />
      )}

      {bulkConfirm && (
        <ConfirmDialog
          title={`Delete ${selectedIds.size} invoice${selectedIds.size !== 1 ? 's' : ''}?`}
          message={`This will permanently remove ${selectedIds.size} selected invoice${selectedIds.size !== 1 ? 's' : ''}. This cannot be undone.`}
          confirmLabel="Delete all selected"
          isPending={deleteMutation.isPending}
          onCancel={() => setBulkConfirm(false)}
          onConfirm={confirmBulkDelete}
        />
      )}
    </div>
  );
}
