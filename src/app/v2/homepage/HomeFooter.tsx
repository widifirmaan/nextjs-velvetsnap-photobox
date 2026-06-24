'use client';
import styles from '../page.module.css';

export default function HomeFooter({ footerText }: { footerText?: string }) {
  const year = new Date().getFullYear();
  return (
    <div className={styles.newspaperFooter}>
      <div className={styles.mastheadMeta}>
        <span>© {year}</span>
        <span>{footerText || 'VelvetSnap Photobooth Platform'}</span>
        <a href="/admin/login" className={styles.mastheadLink}>Admin</a>
      </div>
    </div>
  );
}
