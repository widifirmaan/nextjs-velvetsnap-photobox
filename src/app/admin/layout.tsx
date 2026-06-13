'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Layers, Server, Clock, DollarSign, Image, Loader2, LogOut, Settings2 } from 'lucide-react';
import styles from './layout.module.css';
import { useState, useEffect, useCallback } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (pathname === '/admin/login') { setAuthed(true); return; }
    fetch('/api/admin/session')
      .then((r) => { if (r.ok) setAuthed(true); else router.replace('/admin/login'); })
      .catch(() => router.replace('/admin/login'));
  }, [pathname, router]);

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
    { href: '/admin/settings', label: 'Settings', icon: Settings2 },
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

  if (!authed) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100dvh', background:'var(--clay-bg)' }}>
      <Loader2 className="spin" size={32} />
    </div>
  );

  if (pathname === '/admin/login') return <>{children}</>;

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

        <div className={styles.sidebarFooter} style={{ display:'flex', flexDirection:'column', gap:2 }}>
          <Link
            href="/"
            className={styles.navLink}
            style={{ color: 'var(--text-secondary)' }}
          >
            &larr; Return to App
          </Link>
          <button
            onClick={() => { fetch('/api/admin/login', { method: 'DELETE' }).then(() => router.push('/admin/login')); }}
            className={styles.navLink}
            style={{ color:'var(--text-secondary)', border:'none', background:'none', cursor:'pointer', textAlign:'left', fontSize:14, padding:'10px 12px', width:'100%', display:'flex', alignItems:'center', gap:10 }}
          >
            <LogOut size={20} /> Logout
          </button>
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
