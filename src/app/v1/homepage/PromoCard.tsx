'use client';
import { Heart } from 'lucide-react';
import styles from '@/app/main/page.module.css';

export default function PromoCard({ html }: { html?: string }) {
  return (
    <div className={styles.cardPromo}>
      {html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : (
        <>
          <Heart size={22} />
          <div className={styles.cardPromoContent}>
            <span className={styles.promoLabel}>Promo</span>
            <span className={styles.promoValue}>Cetak ke-2 GRATIS</span>
          </div>
        </>
      )}
    </div>
  );
}
