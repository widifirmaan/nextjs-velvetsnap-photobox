'use client';
import styles from '../page.module.css';
import HomeHeader from './HomeHeader';
import HomeFooter from './HomeFooter';

export default function HomePage({ onStart }: { onStart: () => void }) {
  return (
    <div className={styles.homepage}>
      <HomeHeader />
      <div className={styles.heroSection}>
        <h1 className={styles.heroTitle}>CAPTURE THE MOMENT</h1>
        <p className={styles.heroSubtitle}>
          Step into our vintage photobooth — pick a frame, snap your photos, and
          walk away with a timeless keepsake. No frills, just memories.
        </p>
        <button className={styles.heroBtn} onClick={onStart}>
          START SESSION →
        </button>
      </div>
      <div style={{ padding: '24px' }}>
        <h3 className={styles.sectionHeadline}>HOW IT WORKS</h3>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 16, paddingTop: 20,
        }}>
          {[
            { step: '01', title: 'PICK A FRAME', desc: 'Choose from our collection of vintage-inspired frames.' },
            { step: '02', title: 'SNAP PHOTOS', desc: 'Strike a pose as our booth captures the moment.' },
            { step: '03', title: 'EDIT & ADJUST', desc: 'Tweak brightness, contrast, and positioning.' },
            { step: '04', title: 'PRINT & SHARE', desc: 'Get your photo strip and share it with the world.' },
          ].map((item) => (
            <div key={item.step} style={{
              border: '3px solid var(--np-border)', padding: 16,
              background: 'var(--np-card)', boxShadow: 'var(--np-shadow-sm)',
            }}>
              <div style={{
                fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 900,
                color: 'var(--np-accent)', lineHeight: 1, marginBottom: 8,
              }}>{item.step}</div>
              <div style={{
                fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4,
              }}>{item.title}</div>
              <div style={{
                fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--np-text-secondary)',
                lineHeight: 1.5,
              }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
      <HomeFooter />
    </div>
  );
}
