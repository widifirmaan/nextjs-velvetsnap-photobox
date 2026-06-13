import AdminModal from './AdminModal';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  variant?: 'danger' | 'primary';
}

export default function AdminConfirmModal({
  open, onClose, onConfirm, title, message,
  confirmLabel = 'Hapus', loading = false, variant = 'danger',
}: Props) {
  return (
    <AdminModal open={open} onClose={onClose} title={title}>
      <p style={{ marginBottom: 24, color: 'var(--text-secondary)' }}>{message}</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Batal</button>
        <button className={`btn ${variant === 'primary' ? 'btn-primary' : 'btn-danger'}`} onClick={onConfirm} disabled={loading}>
          {loading ? (variant === 'primary' ? 'Menyimpan...' : 'Menghapus...') : confirmLabel}
        </button>
      </div>
    </AdminModal>
  );
}
