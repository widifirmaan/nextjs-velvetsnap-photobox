import styles from './admin-section-title.module.css';

export default function AdminSectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className={styles.sectionTitle}>{children}</h2>;
}
