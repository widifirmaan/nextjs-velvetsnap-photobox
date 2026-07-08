// File: src/app/admin/components/AdminEmptyState.tsx
// Description: Auto-added top comment for easier file identification.

import styles from './admin-empty-state.module.css';

interface Props {
  icon?: React.ReactNode;
  title: string;
  description?: string;
}

export default function AdminEmptyState({ icon, title, description }: Props) {
  return (
    <div className={styles.empty}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.desc}>{description}</p>}
    </div>
  );
}
