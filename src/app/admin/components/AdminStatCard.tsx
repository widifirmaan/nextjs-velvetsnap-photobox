import styles from './admin-stat-card.module.css';

interface Props {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'blue' | 'green' | 'orange' | 'purple';
  subtext?: string;
  delay?: number;
}

export default function AdminStatCard({ icon, label, value, color, subtext, delay = 0 }: Props) {
  return (
    <div
      className={styles.card}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className={`${styles.icon} ${styles[color]}`}>
        {icon}
      </div>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{value}</p>
      {subtext && <p className={styles.subtext}>{subtext}</p>}
    </div>
  );
}
