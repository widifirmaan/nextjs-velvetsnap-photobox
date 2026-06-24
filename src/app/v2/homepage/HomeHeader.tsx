'use client';
import styles from '../page.module.css';

export default function HomeHeader() {
  return (
    <div className={styles.homeHeader}>
      <div>
        <div className={styles.homeBrand}>
          <span className={styles.homeBrandAccent}>VELVET</span>SNAP
        </div>
        <div className={styles.homeTagline}>Est. 2024 — Photobooth Studio</div>
      </div>
      <div className={styles.homeHeaderNav}>
        <a href="/strips-studio" className={styles.homeHeaderLink}>STUDIO</a>
        <a href="/admin/login" className={styles.homeHeaderLink}>ADMIN</a>
      </div>
    </div>
  );
}
