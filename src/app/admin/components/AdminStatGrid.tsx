import styles from './admin-stat-card.module.css';

export function AdminStatGrid({ children }: { children: React.ReactNode }) {
  return <div className={styles.grid}>{children}</div>;
}
