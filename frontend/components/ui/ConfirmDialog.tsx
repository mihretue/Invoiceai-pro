import Modal from './Modal';
import Icon from '../Icon';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ title, message, confirmLabel, isPending, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Modal onClose={onCancel} size="sm">
      <div className="modal-head">
        <h3 className="h2" style={{ fontSize: 18 }}>{title}</h3>
        <button className="icon-btn" onClick={onCancel} aria-label="Close" disabled={isPending}>
          <Icon name="close" size={18} />
        </button>
      </div>
      <div className="modal-body">
        <p className="body muted" style={{ lineHeight: 1.55 }}>{message}</p>
      </div>
      <div className="modal-foot">
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onCancel} disabled={isPending}>Cancel</button>
        <button className="btn btn-danger" style={{ flex: 1 }} onClick={onConfirm} disabled={isPending}>
          {isPending
            ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Deleting…</>
            : (confirmLabel || 'Confirm')}
        </button>
      </div>
    </Modal>
  );
}
