'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import styles from '@/app/v1/page.module.css';

export default function IntroCard({ txCount, tmplCount, branding, onStart }: {
  txCount: number; tmplCount: number;
  branding: { appName: string; appTagline: string; heroSubtitle: string; logo: string; header: { location: string } };
  onStart: (e: React.MouseEvent) => void;
}) {
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    fetch('/api/admin/session')
      .then((r) => { if (!r.ok) setShowLogin(true); })
      .catch(() => setShowLogin(true));
  }, []);

  return (
    <div className={styles.introCard}>
      <div className={styles.introContent}>
        <div className={styles.logoWrap}>
          {branding.logo ? (
            <Image src={branding.logo} alt="" className={styles.logo} width={56} height={56} style={{ objectFit:'contain' }} />
          ) : (
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" className={styles.logo}>
              <rect x="4" y="12" width="48" height="34" rx="8" fill="var(--mn-text)" />
              <circle cx="28" cy="29" r="11" fill="var(--mn-card)" />
              <circle cx="28" cy="29" r="7" fill="var(--mn-text)" />
              <rect x="39" y="8" width="12" height="4" rx="2" fill="var(--mn-text)" />
              <path d="M48 18l4-2" stroke="var(--mn-text)" strokeWidth="2" strokeLinecap="round" />
              <path d="M18 8l-3 4" stroke="var(--accent-color)" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="18" cy="6" r="1.5" fill="var(--accent-color)" />
            </svg>
          )}
          <div className={styles.logoText}>
            <h1 className={styles.logoTitle}>{branding.appName}</h1>
            <span className={styles.logoSub}>{branding.appTagline}</span>
          </div>
        </div>
        <span className={styles.logoSubMobile}>{branding.appTagline}</span>
        <p className={styles.introDesc}>{branding.heroSubtitle}</p>
        <div className={styles.introStats}>
          <div className={styles.statItem}>
            <span className={styles.statNum}>{txCount || 0}+</span>
            <span className={styles.statLabel}>Tercetak</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNum}>{tmplCount || 0}+</span>
            <span className={styles.statLabel}>Template</span>
          </div>
        </div>
        <div className={styles.introActions}>
          <button className={styles.introCta} onClick={onStart}>
            Mulai <ExternalLink size={14} />
          </button>
          {showLogin && (
            <a href="/admin/login" className={styles.introCta} style={{
              background:'transparent', color:'var(--accent-color)',
              border:'1.5px solid var(--accent-color)', marginTop:0,
            }}>
              Login
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
