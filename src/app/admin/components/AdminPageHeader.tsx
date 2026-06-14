import styles from './admin-page-header.module.css';

interface Props {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}

export default function AdminPageHeader({ title, subtitle, action }: Props) {
  return (
    <div className={styles.header}>
      <div>
        <h1 className={`title ${styles.headerTitle}`}>{title}</h1>
        <p className={`subtitle ${styles.headerSubtitle}`}>{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
