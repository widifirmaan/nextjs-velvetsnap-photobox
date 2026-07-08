// File: src/app/(themes)/v1/homepage/HomeHeader.tsx
// Description: Auto-added top comment for easier file identification.

'use client';
import { MapPin } from 'lucide-react';
import styles from '@/app/(themes)/v1/page.module.css';

export default function HomeHeader({ tooltipVisible, setTooltipVisible, branding }: {
  tooltipVisible: boolean; setTooltipVisible: (v: boolean) => void;
  branding: { header: { location: string; navItems: string } };
}) {
  let navItems: { label: string; url: string }[] = [];
  try { navItems = JSON.parse(branding.header.navItems); } catch (e) { console.warn('HomeHeader: invalid navItems JSON', e); }

  return (
    <header className={styles.header}>
      <div
        className={styles.location}
        onMouseEnter={() => setTooltipVisible(true)}
        onMouseLeave={() => setTooltipVisible(false)}
      >
        <MapPin size={16} />
        <span>{branding.header.location}</span>
        <div className={`${styles.tooltip} ${tooltipVisible ? styles.tooltipVisible : ''}`}>
          <div className={styles.tooltipContent}>{branding.header.location}</div>
        </div>
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
