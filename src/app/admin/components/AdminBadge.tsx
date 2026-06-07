import styles from './admin-badge.module.css';

const statusMap: Record<string, string> = {
  paid: 'success',
  completed: 'success',
  active: 'success',
  pending: 'warning',
  pending_payment: 'warning',
  processing: 'info',
  cancelled: 'info',
  draft: 'info',
};

export default function AdminBadge({ status }: { status: string }) {
  const key = status.toLowerCase().replace(/\s+/g, '_');
  const variant = statusMap[key] || 'info';
  return <span className={`${styles.badge} ${styles[variant]}`}>{status}</span>;
}
