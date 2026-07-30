import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
      <p className="text-sm text-ink-600 mb-6">{message}</p>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button variant="danger" onClick={onConfirm} disabled={loading}>
          {loading ? 'Procesando...' : 'Confirmar'}
        </Button>
      </div>
    </Modal>
  );
}
