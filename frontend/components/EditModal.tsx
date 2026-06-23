'use client';
import { useState, useEffect, FormEvent } from 'react';
import { AlertCircle } from 'lucide-react';
import { useUpdateExtraction } from '@/hooks/useDocuments';
import { CATEGORIES } from '@/lib/data';
import { fmtMoney } from '@/lib/formatters';
import type { ApiExtraction, ExtractionUpdatePayload } from '@/lib/types';
import Modal from './ui/Modal';
import Icon from './Icon';

interface EditModalProps {
  extraction: ApiExtraction | null | undefined;
  onClose: () => void;
}

interface FormState {
  vendor_name:    string;
  invoice_number: string;
  invoice_date:   string;
  amount:         string;
  currency:       string;
  category:       string;
  description:    string;
}

interface FormErrors {
  vendor_name?: string;
  amount?: string;
  category?: string;
  invoice_date?: string;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p style={{ fontSize: 12, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
      <AlertCircle size={13} /> {msg}
    </p>
  );
}

export default function EditModal({ extraction, onClose }: EditModalProps) {
  const updateMutation = useUpdateExtraction();

  const [form, setForm]     = useState<FormState>({ vendor_name: '', invoice_number: '', invoice_date: '', amount: '', currency: 'USD', category: '', description: '' });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (extraction) {
      setForm({
        vendor_name:    extraction.vendor_name    ?? '',
        invoice_number: extraction.invoice_number ?? '',
        invoice_date:   extraction.invoice_date   ?? '',
        amount:         extraction.amount != null ? String(extraction.amount) : '',
        currency:       extraction.currency        || 'USD',
        category:       extraction.category        ?? '',
        description:    extraction.description     ?? '',
      });
      setErrors({});
    }
  }, [extraction]);

  function change(k: keyof FormState, v: string) {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k as keyof FormErrors]) {
      setErrors(e => { const n = { ...e }; delete n[k as keyof FormErrors]; return n; });
    }
  }

  function validate(): boolean {
    const errs: FormErrors = {};
    if (!form.vendor_name.trim()) errs.vendor_name = 'Vendor name is required';
    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0) errs.amount = 'Amount must be greater than 0';
    if (!form.category) errs.category = 'Category is required';
    if (!form.invoice_date) errs.invoice_date = 'Date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!extraction || !validate()) return;

    const payload: ExtractionUpdatePayload = {
      vendor_name:    form.vendor_name    || undefined,
      invoice_number: form.invoice_number || undefined,
      invoice_date:   form.invoice_date   || undefined,
      amount:         form.amount ? parseFloat(form.amount) : null,
      currency:       form.currency,
      category:       form.category       || undefined,
      description:    form.description    || undefined,
    };
    updateMutation.mutate({ id: extraction.id, data: payload }, { onSuccess: onClose });
  }

  if (!extraction) return null;

  const subtotal = parseFloat(form.amount) || 0;

  return (
    <Modal onClose={onClose}>
      {/* Header */}
      <div className="modal-head">
        <div>
          <h2 className="h2" style={{ fontSize: 19 }}>Edit Invoice</h2>
          <p className="small muted" style={{ marginTop: 3 }}>Verify and update extracted data</p>
        </div>
        <button className="icon-btn" onClick={onClose} disabled={updateMutation.isPending} aria-label="Close">
          <Icon name="close" size={18} />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="stack" style={{ gap: 16 }}>

            {/* Row 1 — Vendor & Amount */}
            <div className="grid-2">
              <div className="field">
                <label className="label" htmlFor="em-vendor">Vendor name *</label>
                <input id="em-vendor" className={`input${errors.vendor_name ? ' error' : ''}`}
                  value={form.vendor_name} onChange={e => change('vendor_name', e.target.value)}
                  placeholder="e.g. Amazon Business" />
                <FieldError msg={errors.vendor_name} />
              </div>
              <div className="field">
                <label className="label" htmlFor="em-amount">Amount ($) *</label>
                <div className="input-wrap" style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none' }}>$</span>
                  <input id="em-amount" type="number" step="0.01" min="0"
                    className={`input${errors.amount ? ' error' : ''}`} style={{ paddingLeft: 22 }}
                    value={form.amount} onChange={e => change('amount', e.target.value)}
                    placeholder="0.00" />
                </div>
                <FieldError msg={errors.amount} />
              </div>
            </div>

            {/* Row 2 — Category & Date */}
            <div className="grid-2">
              <div className="field">
                <label className="label" htmlFor="em-cat">Category *</label>
                <select id="em-cat" className={`select${errors.category ? ' error' : ''}`}
                  value={form.category} onChange={e => change('category', e.target.value)}>
                  <option value="">— select —</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <FieldError msg={errors.category} />
              </div>
              <div className="field">
                <label className="label" htmlFor="em-date">Date *</label>
                <input id="em-date" type="date"
                  className={`input${errors.invoice_date ? ' error' : ''}`}
                  value={form.invoice_date} onChange={e => change('invoice_date', e.target.value)} />
                <FieldError msg={errors.invoice_date} />
              </div>
            </div>

            {/* Row 3 — Invoice # & Currency */}
            <div className="grid-2">
              <div className="field">
                <label className="label" htmlFor="em-num">Invoice #</label>
                <input id="em-num" className="input mono"
                  value={form.invoice_number} onChange={e => change('invoice_number', e.target.value)}
                  placeholder="e.g. INV-0042" />
              </div>
              <div className="field">
                <label className="label" htmlFor="em-cur">Currency</label>
                <select id="em-cur" className="select"
                  value={form.currency} onChange={e => change('currency', e.target.value)}>
                  {['USD', 'EUR', 'GBP', 'CAD', 'AUD'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="field">
              <label className="label" htmlFor="em-desc">Description / Notes</label>
              <textarea id="em-desc" className="input" rows={3}
                value={form.description} onChange={e => change('description', e.target.value)}
                placeholder="Additional notes…" />
            </div>

            {/* Total summary */}
            <div style={{ background: 'var(--blue-50)', border: '1px solid var(--blue-100)', borderRadius: 'var(--r)', padding: '10px 14px' }}>
              <p className="small">
                <strong>Total amount:</strong>{' '}
                <span className="amount" style={{ fontSize: 15 }}>{fmtMoney(subtotal)}</span>
              </p>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="modal-foot">
          <button type="button" className="btn btn-secondary" style={{ flex: 1 }}
            onClick={onClose} disabled={updateMutation.isPending}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }}
            disabled={updateMutation.isPending}>
            {updateMutation.isPending
              ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving…</>
              : <><Icon name="check" size={16} /> Save changes</>}
          </button>
        </div>
      </form>
    </Modal>
  );
}
