import Modal from './Modal';
import Icon from '../Icon';

export default function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel }) {
  return (
    <Modal onClose={onCancel} size="sm">
      <div className="modal-head">
        <h3 className="h2" style={{ fontSize: 18 }}>{title}</h3>
        <button className="icon-btn" onClick={onCancel} aria-label="Close">
          <Icon name="close" size={18} />
        </button>
      </div>
      <div className="modal-body">
        <p className="body muted" style={{ lineHeight: 1.55 }}>{message}</p>
      </div>
      <div className="modal-foot">
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onCancel}>Cancel</button>
        <button className="btn btn-danger" style={{ flex: 1 }} onClick={onConfirm}>
          {confirmLabel || 'Confirm'}
        </button>
      </div>
    </Modal>
  );
}
