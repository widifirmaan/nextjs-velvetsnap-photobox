'use client';
import { Sparkles } from 'lucide-react';
import styles from '@/app/main/page.module.css';

export default function CardSmall() {
  return (
    <a href="/strips-studio" className={styles.cardSmall}>
      <div className={styles.cardSmallIcon}>
        <Sparkles size={22} />
      </div>
      <div className={styles.cardSmallBody}>
        <span className={styles.cardSmallTag}>Fitur</span>
        <h3 className={styles.cardSmallTitle}>Kustom Template</h3>
        <p className={styles.cardSmallDesc}>Desain template fotomu sendiri</p>
      </div>
    </a>
  );
}
