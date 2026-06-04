'use client';

import { Heart } from 'lucide-react';
import styles from '@/app/page.module.css';

export default function PromoCard() {
  return (
    <div className={styles.cardPromo}>
      <Heart size={22} />
      <div className={styles.cardPromoContent}>
        <span className={styles.promoLabel}>Promo</span>
        <span className={styles.promoValue}>Cetak ke-2 GRATIS</span>
      </div>
    </div>
  );
}
