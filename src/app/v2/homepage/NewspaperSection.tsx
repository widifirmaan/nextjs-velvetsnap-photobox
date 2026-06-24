import styles from '../page.module.css';

export default function NewspaperSection({ label, children, labelClass }: {
  label?: string; children: React.ReactNode; labelClass?: string;
}) {
  return (
    <div className={styles.leadStory}>
      {label && <div className={labelClass || styles.leadStoryLabel}>{label}</div>}
      {children}
    </div>
  );
}
