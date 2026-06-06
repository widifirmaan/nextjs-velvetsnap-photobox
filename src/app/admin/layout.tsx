'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Layers, Server, Clock, DollarSign, Image } from 'lucide-react';
import styles from './layout.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navLinks = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/templates', label: 'Templates', icon: Layers },
    { href: '/admin/devices', label: 'Devices', icon: Server },
    { href: '/strips-studio', label: 'Strips Studio', icon: Image },
  ];

  const bottomLinks = [
    { href: '/admin/history', label: 'History', icon: Clock },
    { href: '/admin/finance', label: 'Finance', icon: DollarSign },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <div className={styles.adminLayout}>
      <div className={`glass-panel ${styles.sidebar}`}>
        <div className={styles.brand}>VelvetSnap</div>
        <nav className={styles.nav}>
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}
                className={`${styles.navLink} ${isActive(link.href) ? styles.navLinkActive : ''}`}>
                <Icon size={20} /> {link.label}
              </Link>
            );
          })}

          <div className={styles.navDivider} />

          {bottomLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}
                className={`${styles.navLink} ${isActive(link.href) ? styles.navLinkActive : ''}`}>
                <Icon size={20} /> {link.label}
              </Link>
            );
          })}
        </nav>
        
        <div className={styles.footer}>
          <Link href="/" className={styles.navLink} style={{ color: 'var(--text-secondary)' }}>
            &larr; Return to App
          </Link>
        </div>
      </div>
      
      <div className={styles.content}>
        {children}
        <footer className={styles.footer}>
          <span>Velvetsnap Photobooth Platform by <a href="https://widifirmaan.web.id" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>W</a></span>
        </footer>
      </div>
    </div>
  );
}
