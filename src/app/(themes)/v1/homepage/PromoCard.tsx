// File: src/app/(themes)/v1/homepage/PromoCard.tsx
// Description: Auto-added top comment for easier file identification.

'use client';
import { Heart } from 'lucide-react';
import styles from '@/app/(themes)/v1/page.module.css';

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
