// File: src/app/(themes)/v1/homepage/HomeHeader.tsx
// Description: Auto-added top comment for easier file identification.

'use client';
import Image from 'next/image';
import styles from '@/app/(themes)/v1/page.module.css';

export default function HomeHeader({ branding }: {
  branding: { appName: string; logo: string; header: { navItems: string } };
}) {
  let navItems: { label: string; url: string }[] = [];
  try { navItems = JSON.parse(branding.header.navItems); } catch (e) { console.warn('HomeHeader: invalid navItems JSON', e); }

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        {branding.logo ? (
          <Image src={branding.logo} alt="" className={styles.brandLogo} width={32} height={32} style={{ objectFit: 'contain' }} />
        ) : (
          <svg width="32" height="32" viewBox="0 0 56 56" fill="none" className={styles.brandLogo}>
            <rect x="4" y="12" width="48" height="34" rx="8" fill="var(--mn-text)" />
            <circle cx="28" cy="29" r="11" fill="var(--mn-card)" />
            <circle cx="28" cy="29" r="7" fill="var(--mn-text)" />
            <rect x="39" y="8" width="12" height="4" rx="2" fill="var(--mn-text)" />
            <path d="M48 18l4-2" stroke="var(--mn-text)" strokeWidth="2" strokeLinecap="round" />
            <path d="M18 8l-3 4" stroke="var(--accent-color)" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="18" cy="6" r="1.5" fill="var(--accent-color)" />
          </svg>
        )}
        <span className={styles.brandName}>{branding.appName}</span>
      </div>
      <nav className={styles.nav}>
        {navItems.map((item, i) => (
          <span key={item.url}>
            {i > 0 && <span className={styles.navSep} />}
            <a href={item.url} target={item.url.startsWith('http') ? '_blank' : undefined}
              rel={item.url.startsWith('http') ? 'noopener' : undefined}
              className={styles.navLink}>
              {item.label}
            </a>
          </span>
        ))}
      </nav>
    </header>
  );
}
