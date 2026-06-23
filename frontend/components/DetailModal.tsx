'use client';
import { useState, ReactNode } from 'react';
import { useUpdateExtraction, useDeleteExtraction } from '@/hooks/useDocuments';
import { CATEGORIES, VENDOR_COLORS, Invoice } from '@/lib/data';
import { fmtMoney, fmtDate } from '@/lib/formatters';
import type { ExtractionUpdatePayload } from '@/lib/types';
import Modal from './ui/Modal';
import ConfirmDialog from './ui/ConfirmDialog';
import StatusBadge from './ui/StatusBadge';
import VendorLogo from './ui/VendorLogo';
import Icon from './Icon';

interface DetailModalProps {
  invoice: Invoice;
  startEdit?: boolean;
  onClose: () => void;
}

export default function DetailModal({ invoice, startEdit, onClose }: DetailModalProps) {
  const updateMutation = useUpdateExtraction();
  const deleteMutation = useDeleteExtraction();

  const [edit, setEdit]         = useState(!!startEdit);
  const [form, setForm]         = useState<Invoice>({ ...invoice });
  const [confirmDel, setConfirmDel] = useState(false);

  function set<K extends keyof Invoice>(k: K, v: Invoice[K]): void {
    setForm(f => ({ ...f, [k]: v }));
  }

  function save(): void {
    const amt     = parseFloat(String(form.amount).replace(/[^0-9.]/g, ''));
    const payload: ExtractionUpdatePayload = {
      vendor_name:    form.vendor,
      invoice_number: form.number,
      invoice_date:   form.date,
      amount:         isNaN(amt) ? null : amt,
      category:       form.category,
      description:    form.description,
    };
    updateMutation.mutate(
      { id: parseInt(invoice.id), data: payload },
      { onSuccess: onClose },
    );
  }

  function handleDelete(): void {
    deleteMutation.mutate(
      parseInt(invoice.id),
      { onSuccess: onClose },
    );
  }

  const isBusy = updateMutation.isPending || deleteMutation.isPending;

  return (
    <Modal onClose={onClose}>
      <div className="modal-head">
        <div className="row" style={{ gap: 12 }}>
          <VendorLogo vendor={form.vendor} color={VENDOR_COLORS[form.vendor] || form.color} size={42} />
          <div>
            <h3 className="h2" style={{ fontSize: 19 }}>{edit ? 'Edit invoice' : form.vendor}</h3>
            <div className="cap mono">{form.number}</div>
          </div>
        </div>
        <button className="icon-btn" onClick={onClose} aria-label="Close" disabled={isBusy}>
          <Icon name="close" size={18} />
        </button>
      </div>

      <div className="modal-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'var(--bg)', marginBottom: 18 }}>
          <StatusBadge status={form.status} />
          {form.confidence != null && (
            <span className="small muted">
              <span style={{ color: 'var(--green)', fontWeight: 650 }}>{form.confidence}%</span> extraction confidence
            </span>
          )}
          {form.sourceFile && <span className="cap" style={{ marginLeft: 'auto' }}>{form.sourceFile}</span>}
        </div>

        {edit ? (
          <div className="stack" style={{ gap: 16 }}>
            <div className="grid-2">
              <Field label="Vendor name">
                <input className="input" value={form.vendor} onChange={e => set('vendor', e.target.value)} />
              </Field>
              <Field label="Invoice #">
                <input className="input mono" value={form.number} onChange={e => set('number', e.target.value)} />
              </Field>
            </div>
            <div className="grid-2">
              <Field label="Date">
                <input className="input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
              </Field>
              <Field label="Amount">
                <input className="input" value={form.amount ?? ''} onChange={e => set('amount', e.target.value as any)} placeholder="0.00" />
              </Field>
            </div>
            <div className="grid-2">
              <Field label="Category">
                <select className="select" value={form.category} onChange={e => set('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select className="select" value={form.status} onChange={e => set('status', e.target.value as Invoice['status'])}>
                  {(['extracted', 'processing', 'failed', 'pending'] as const).map(s => (
                    <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Description">
              <textarea className="input" rows={3} value={form.description} onChange={e => set('description', e.target.value)} />
            </Field>
          </div>
        ) : (
          <div className="stack" style={{ gap: 0 }}>
            <ReadRow label="Date"        val={fmtDate(form.date)} />
            <ReadRow label="Amount"      val={<span className="amount" style={{ fontSize: 18 }}>{fmtMoney(form.amount)}</span>} />
            <ReadRow label="Category"    val={<span className="badge badge-gray">{form.category}</span>} />
            <ReadRow label="Description" val={form.description} />
          </div>
        )}
      </div>

      <div className="modal-foot">
        {edit ? (
          <>
            <button className="btn btn-danger" onClick={() => setConfirmDel(true)} disabled={isBusy}>
              <Icon name="trash" size={16} />
            </button>
            <div style={{ flex: 1 }} />
            <button className="btn btn-secondary" onClick={() => { setForm({ ...invoice }); setEdit(false); }} disabled={isBusy}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={save} disabled={isBusy}>
              {updateMutation.isPending
                ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving…</>
                : <><Icon name="check" size={16} /> Save changes</>}
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-ghost" onClick={() => setConfirmDel(true)} disabled={isBusy}>
              <Icon name="trash" size={16} /> Delete
            </button>
            <div style={{ flex: 1 }} />
            <button className="btn btn-primary" onClick={() => setEdit(true)}>
              <Icon name="edit" size={16} /> Edit
            </button>
          </>
        )}
      </div>

      {confirmDel && (
        <ConfirmDialog
          title="Delete invoice?"
          message={`This will permanently remove ${form.vendor} (${form.number}). This cannot be undone.`}
          confirmLabel="Delete invoice"
          onCancel={() => setConfirmDel(false)}
          onConfirm={handleDelete}
        />
      )}
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="field">
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function ReadRow({ label, val }: { label: string; val: ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, padding: '13px 0', borderBottom: '1px solid var(--line-2)' }}>
      <span className="small" style={{ fontWeight: 600, color: 'var(--ink-2)', flexShrink: 0 }}>{label}</span>
      <span className="body" style={{ textAlign: 'right' }}>{val}</span>
    </div>
  );
}
