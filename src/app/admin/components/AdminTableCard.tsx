// File: src/app/admin/components/AdminTableCard.tsx
// Description: Auto-added top comment for easier file identification.

import styles from './admin-table-card.module.css';

interface Props {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export default function AdminTableCard({ title, action, children }: Props) {
  return (
    <div className={`card card-md ${styles.card}`}>
      {(title || action) && (
        <div className={styles.header}>
          {title && <h2 className={styles.title}>{title}</h2>}
          {action}
        </div>
      )}
      <div className={styles.scrollWrap}>
        {children}
      </div>
    </div>
  );
}
