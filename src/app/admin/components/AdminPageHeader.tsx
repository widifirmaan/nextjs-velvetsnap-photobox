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
        <h1 className="title" style={{ textAlign: 'left', marginBottom: '8px' }}>{title}</h1>
        <p className="subtitle" style={{ textAlign: 'left', marginBottom: 0 }}>{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
