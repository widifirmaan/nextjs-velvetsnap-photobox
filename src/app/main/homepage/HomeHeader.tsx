'use client';
import { MapPin } from 'lucide-react';
import { Camera as CameraIcon, MessageCircle, Sparkles } from 'lucide-react';
import styles from '@/app/main/page.module.css';

export default function HomeHeader({ tooltipVisible, setTooltipVisible }: {
  tooltipVisible: boolean; setTooltipVisible: (v: boolean) => void;
}) {
  return (
    <header className={styles.header}>
      <div
        className={styles.location}
        onMouseEnter={() => setTooltipVisible(true)}
        onMouseLeave={() => setTooltipVisible(false)}
      >
        <MapPin size={16} />
        <span>Jakarta</span>
        <div className={`${styles.tooltip} ${tooltipVisible ? styles.tooltipVisible : ''}`}>
          <div className={styles.tooltipImage}>
            <div className={styles.tooltipPlaceholder}>📍 VelvetSnap Booth</div>
          </div>
        </div>
      </div>
      <nav className={styles.nav}>
        <a href="https://instagram.com" target="_blank" rel="noopener" className={styles.navLink}>
          <CameraIcon size={16} /> Instagram
        </a>
        <span className={styles.navSep} />
        <a href="https://wa.me/628123456789" target="_blank" rel="noopener" className={styles.navLink}>
          <MessageCircle size={16} /> WhatsApp
        </a>
        <span className={styles.navSep} />
        <a href="/templates" className={styles.navLink}>Templates</a>
        <span className={styles.navSep} />
        <a href="/strips-studio" className={styles.navLink}>
          <Sparkles size={14} /> Studio
        </a>
      </nav>
    </header>
  );
}
