'use client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, FormEvent } from 'react';
import { ChevronLeft, Save } from 'lucide-react';
import { useExtraction, useUpdateExtraction } from '@/hooks/useDocuments';
import { CATEGORIES } from '@/lib/data';
import { fmtMoney, fmtDate } from '@/lib/formatters';
import type { ExtractionUpdatePayload } from '@/lib/types';
import Icon from '@/components/Icon';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id     = Number(params.id);

  const { data: extraction, isPending, error } = useExtraction(id);
  const updateMutation = useUpdateExtraction();

  const [form, setForm] = useState<ExtractionUpdatePayload & { currency: string }>({
    vendor_name:    '',
    invoice_number: '',
    invoice_date:   '',
    amount:         undefined,
    currency:       'USD',
    category:       '',
    description:    '',
  });

  useEffect(() => {
    if (extraction) {
      setForm({
        vendor_name:    extraction.vendor_name    ?? '',
        invoice_number: extraction.invoice_number ?? '',
        invoice_date:   extraction.invoice_date   ?? '',
        amount:         extraction.amount          ?? undefined,
        currency:       extraction.currency        || 'USD',
        category:       extraction.category        ?? '',
        description:    extraction.description     ?? '',
      });
    }
  }, [extraction]);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const payload: ExtractionUpdatePayload = {
      vendor_name:    form.vendor_name    || undefined,
      invoice_number: form.invoice_number || undefined,
      invoice_date:   form.invoice_date   || undefined,
      amount:         form.amount != null ? Number(form.amount) : null,
      currency:       form.currency,
      category:       form.category       || undefined,
      description:    form.description    || undefined,
    };
    updateMutation.mutate({ id, data: payload }, {
      onSuccess: () => router.push('/invoices'),
    });
  }

  if (isPending) {
    return (
      <div>
        <div className="page-head">
          <Link href="/invoices" className="btn btn-ghost btn-sm"><ChevronLeft size={16} /> Back</Link>
        </div>
        <div className="card card-pad">
          <div className="animate-pulse stack" style={{ gap: 16 }}>
            {[200, 160, 160, 100].map((w, i) => (
              <div key={i} style={{ height: 40, width: w, background: 'var(--hover)', borderRadius: 'var(--r)' }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !extraction) {
    return (
      <div>
        <div className="page-head">
          <Link href="/invoices" className="btn btn-ghost btn-sm"><ChevronLeft size={16} /> Back</Link>
        </div>
        <div className="card card-pad">
          <p className="body" style={{ color: 'var(--red)' }}>Failed to load document. It may have been deleted.</p>
          <Link href="/invoices" className="btn btn-secondary" style={{ marginTop: 16, display: 'inline-flex' }}>
            Back to invoices
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/invoices" className="btn btn-ghost btn-sm">
            <ChevronLeft size={16} /> Back
          </Link>
          <div>
            <h1 className="h1">Edit Invoice</h1>
            <p className="body muted sub">
              {extraction.vendor_name || 'Unknown vendor'} · {fmtDate(extraction.invoice_date)}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="badge badge-green">
            <span className="dot" style={{ background: 'var(--green)' }} /> Extracted
          </span>
          <span className="small muted">ID: {extraction.id}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

        {/* Edit form */}
        <div className="card card-pad">
          <form onSubmit={handleSubmit}>
            <div className="stack" style={{ gap: 20 }}>

              <div className="grid-2">
                <div className="field">
                  <label className="label" htmlFor="vendor_name">Vendor name</label>
                  <div className="input-wrap">
                    <Icon name="grid" size={16} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
                    <input id="vendor_name" className="input" style={{ paddingLeft: 34 }}
                      value={form.vendor_name ?? ''} onChange={e => set('vendor_name', e.target.value)}
                      placeholder="e.g. Amazon Business" />
                  </div>
                </div>
                <div className="field">
                  <label className="label" htmlFor="invoice_number">Invoice #</label>
                  <input id="invoice_number" className="input mono"
                    value={form.invoice_number ?? ''} onChange={e => set('invoice_number', e.target.value)}
                    placeholder="e.g. INV-0042" />
                </div>
              </div>

              <div className="grid-2">
                <div className="field">
                  <label className="label" htmlFor="invoice_date">Date</label>
                  <input id="invoice_date" type="date" className="input"
                    value={form.invoice_date ?? ''} onChange={e => set('invoice_date', e.target.value)} />
                </div>
                <div className="field">
                  <label className="label" htmlFor="amount">Amount</label>
                  <div className="input-wrap">
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', fontSize: 14 }}>$</span>
                    <input id="amount" type="number" step="0.01" min="0" className="input" style={{ paddingLeft: 24 }}
                      value={form.amount ?? ''} onChange={e => set('amount', e.target.value ? parseFloat(e.target.value) : undefined)}
                      placeholder="0.00" />
                  </div>
                </div>
              </div>

              <div className="grid-2">
                <div className="field">
                  <label className="label" htmlFor="category">Category</label>
                  <select id="category" className="select"
                    value={form.category ?? ''} onChange={e => set('category', e.target.value)}>
                    <option value="">— select —</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label className="label" htmlFor="currency">Currency</label>
                  <select id="currency" className="select"
                    value={form.currency} onChange={e => set('currency', e.target.value)}>
                    {['USD', 'EUR', 'GBP', 'CAD', 'AUD'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="field">
                <label className="label" htmlFor="description">Description</label>
                <textarea id="description" className="input" rows={3}
                  value={form.description ?? ''} onChange={e => set('description', e.target.value)}
                  placeholder="Additional notes…" />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <Link href="/invoices" className="btn btn-secondary">Cancel</Link>
                <button type="submit" className="btn btn-primary" disabled={updateMutation.isPending}>
                  {updateMutation.isPending
                    ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving…</>
                    : <><Save size={16} /> Save changes</>}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Read-only summary sidebar */}
        <div className="card card-pad" style={{ position: 'sticky', top: 20 }}>
          <h3 className="h3" style={{ marginBottom: 16 }}>Original extraction</h3>
          <div className="stack" style={{ gap: 0 }}>
            {[
              ['Vendor',     extraction.vendor_name    || '–'],
              ['Invoice #',  extraction.invoice_number || '–'],
              ['Date',       fmtDate(extraction.invoice_date)],
              ['Amount',     fmtMoney(extraction.amount)],
              ['Currency',   extraction.currency],
              ['Category',   extraction.category       || '–'],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--line-2)' }}>
                <span className="small" style={{ color: 'var(--ink-2)', fontWeight: 600 }}>{label}</span>
                <span className="small mono">{val}</span>
              </div>
            ))}
          </div>
          <p className="cap" style={{ marginTop: 14, color: 'var(--ink-3)' }}>
            Extracted {fmtDate(extraction.extracted_at)}
          </p>
        </div>
      </div>
    </div>
  );
}
