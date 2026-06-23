'use client';
import { useState } from 'react';
import { Eye } from 'lucide-react';
import { useDeleteExtraction, useExtraction } from '@/hooks/useDocuments';
import { fmtMoney, fmtDateShort } from '@/lib/formatters';
import type { ApiExtraction } from '@/lib/types';
import { VENDOR_COLORS } from '@/lib/data';
import Icon from './Icon';
import EditModal from './EditModal';
import StatusBadge from './ui/StatusBadge';
import VendorLogo from './ui/VendorLogo';
import ConfirmDialog from './ui/ConfirmDialog';

const PER_PAGE = 10;

interface DocumentTableProps {
  extractions: ApiExtraction[];
  isLoading?: boolean;
  onSelectionChange?: (ids: number[]) => void;
}

export default function DocumentTable({ extractions, isLoading, onSelectionChange }: DocumentTableProps) {
  const [page, setPage]       = useState(1);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const deleteMutation = useDeleteExtraction();
  const { data: editingExtraction } = useExtraction(editingId);

  const pages    = Math.max(1, Math.ceil(extractions.length / PER_PAGE));
  const cur      = Math.min(page, pages);
  const pageRows = extractions.slice((cur - 1) * PER_PAGE, cur * PER_PAGE);

  function updateSelected(next: Set<number>) {
    setSelected(next);
    onSelectionChange?.(Array.from(next));
  }

  function toggleAll() {
    const next = selected.size === pageRows.length
      ? new Set<number>()
      : new Set(pageRows.map(e => e.id));
    updateSelected(next);
  }

  function toggleRow(id: number) {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    updateSelected(next);
  }

  function openEdit(id: number) {
    setEditingId(id);
  }

  function closeEdit() {
    setEditingId(null);
  }

  if (isLoading) {
    return (
      <div className="card" style={{ height: 280, display: 'grid', placeItems: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (extractions.length === 0) {
    return (
      <div className="card">
        <div className="empty">
          <div className="empty-ic"><Eye size={30} /></div>
          <h3 className="h3">No documents found</h3>
          <p className="small">Upload an invoice above to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th className="no-sort" style={{ width: 40 }}>
                  <input type="checkbox"
                    checked={selected.size === pageRows.length && pageRows.length > 0}
                    onChange={toggleAll}
                  />
                </th>
                <th>Vendor</th>
                <th>Invoice #</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th className="no-sort">Category</th>
                <th className="no-sort">Status</th>
                <th className="no-sort" style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map(ext => {
                const vendor = ext.vendor_name || 'Unknown';
                const color  = VENDOR_COLORS[vendor] || '#6B7280';
                return (
                  <tr key={ext.id} className={selected.has(ext.id) ? 'selected' : ''}>
                    <td onClick={e => e.stopPropagation()}>
                      <input type="checkbox"
                        checked={selected.has(ext.id)}
                        onChange={() => toggleRow(ext.id)}
                      />
                    </td>
                    <td>
                      <div className="vendor-cell">
                        <VendorLogo vendor={vendor} color={color} />
                        <span style={{ fontWeight: 600 }}>{vendor}</span>
                      </div>
                    </td>
                    <td className="mono small">{ext.invoice_number || `EXT-${ext.id}`}</td>
                    <td className="small">{fmtDateShort(ext.invoice_date || ext.extracted_at)}</td>
                    <td className="amount" style={{ textAlign: 'right' }}>{fmtMoney(ext.amount)}</td>
                    <td><span className="badge badge-gray">{ext.category || 'Other'}</span></td>
                    <td><StatusBadge status="extracted" /></td>
                    <td>
                      <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                        <button className="act-btn" title="Edit" onClick={() => openEdit(ext.id)}>
                          <Icon name="edit" size={16} />
                        </button>
                        <button className="act-btn danger" title="Delete"
                          onClick={() => setConfirmId(ext.id)}
                          disabled={deleteMutation.isPending}>
                          <Icon name="trash" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="pager">
            <span className="small muted">Page {cur} of {pages} · {extractions.length} results</span>
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
        )}
      </div>

      {/* Edit modal — fetches fresh data when editingId is set */}
      {editingId !== null && (
        <EditModal extraction={editingExtraction} onClose={closeEdit} />
      )}

      {/* Per-row delete confirmation */}
      {confirmId !== null && (
        <ConfirmDialog
          title="Delete document?"
          message="This will permanently remove the extraction. This cannot be undone."
          confirmLabel="Delete"
          isPending={deleteMutation.isPending}
          onCancel={() => setConfirmId(null)}
          onConfirm={() => {
            deleteMutation.mutate(confirmId!, {
              onSuccess: () => {
                updateSelected(new Set([...selected].filter(id => id !== confirmId)));
                setConfirmId(null);
              },
              onError: () => setConfirmId(null),
            });
          }}
        />
      )}
    </>
  );
}
