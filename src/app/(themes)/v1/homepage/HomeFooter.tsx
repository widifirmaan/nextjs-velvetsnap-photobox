'use client';
import Link from 'next/link';
import { Camera as CameraIcon, MessageCircle, Sparkles } from 'lucide-react';
import styles from '@/app/(themes)/v1/page.module.css';

export default function HomeFooter({ branding }: { branding: { appName: string; footer: { text: string } } }) {
  return (
    <footer className={styles.footer}>
      <nav className={styles.nav}>
        <a href="https://instagram.com" target="_blank" rel="noopener" className={styles.navLink}>
          <CameraIcon size={16} /> Instagram
        </a>
        <span className={styles.navSep} />
        <a href="https://wa.me/628123456789" target="_blank" rel="noopener" className={styles.navLink}>
          <MessageCircle size={16} /> WhatsApp
        </a>
        <span className={styles.navSep} />
        <Link href="/?step=1" className={styles.navLink}>Templates</Link>
        <span className={styles.navSep} />
        <Link href="/admin/template-studio" className={styles.navLink}>
          <Sparkles size={14} /> Studio
        </Link>
      </nav>
      <p className={styles.footerText}>
        {branding.footer.text}
      </p>
    </footer>
  );
}
