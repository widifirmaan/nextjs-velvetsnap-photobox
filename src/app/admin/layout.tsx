'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Layers, Server, Clock, DollarSign, Image, Loader2 } from 'lucide-react';
import styles from './layout.module.css';
import { useState, useEffect, useCallback } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    setNavigating(false);
  }, [pathname]);

  const handleNavClick = useCallback(() => {
    setNavigating(true);
  }, []);

  const navLinks = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/templates', label: 'Templates', icon: Layers },
    { href: '/admin/devices', label: 'Devices', icon: Server },
    { href: '/admin/template-studio', label: 'Strips Studio', icon: Image },
  ];

  const bottomLinks = [
    { href: '/admin/history', label: 'History', icon: Clock },
    { href: '/admin/finance', label: 'Finance', icon: DollarSign },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    if (href === '/admin/templates') return pathname.startsWith('/admin/templates');
    return pathname.startsWith(href);
  };

  const renderNavLink = (link: { href: string; label: string; icon: any }) => {
    const Icon = link.icon;
    return (
      <Link
        key={link.href}
        href={link.href}
        onClick={handleNavClick}
        className={`${styles.navLink} ${isActive(link.href) ? styles.navLinkActive : ''}`}
      >
        <Icon size={20} /> {link.label}
      </Link>
    );
  };

  const renderBottomNavItem = (link: { href: string; label: string; icon: any }) => {
    const Icon = link.icon;
    return (
      <Link
        key={link.href}
        href={link.href}
        onClick={handleNavClick}
        className={`${styles.bottomNavItem} ${isActive(link.href) ? styles.bottomNavItemActive : ''}`}
        title={link.label}
      >
        <Icon size={24} />
        <span className={styles.bottomNavLabel}>{link.label}</span>
      </Link>
    );
  };

  return (
    <div className={styles.adminLayout}>
      {navigating && (
        <div className={styles.navLoader}>
          <div className={styles.navLoaderInner}>
            <Loader2 className="spin" size={32} />
            <span>Loading...</span>
          </div>
        </div>
      )}

      <div className={`glass-panel ${styles.sidebar}`}>
        <div className={styles.brand}>VelvetSnap</div>
        <nav className={styles.nav}>
          {navLinks.map(renderNavLink)}
          <div className={styles.navDivider} />
          {bottomLinks.map(renderNavLink)}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link
            href="/"
            className={styles.navLink}
            style={{ color: 'var(--text-secondary)' }}
          >
            &larr; Return to App
          </Link>
        </div>
      </div>

      <div className={styles.content}>
        {children}
        <footer className={styles.contentFooter}>
          <span>Velvetsnap Photobooth Platform by <a href="https://widifirmaan.web.id" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>W</a></span>
        </footer>
      </div>

      <div className={styles.mobileTopBar}>
        <span>VelvetSnap Photobooth Platform</span>
      </div>

      <nav className={styles.bottomNav}>
        {navLinks.map(renderBottomNavItem)}
        {bottomLinks.map(renderBottomNavItem)}
      </nav>
    </div>
  );
}
