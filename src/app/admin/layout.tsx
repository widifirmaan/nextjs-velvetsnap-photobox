'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Layers, Server, Clock, Image, Loader2, LogOut, Settings2 } from 'lucide-react';
import styles from './layout.module.css';
import { useState, useEffect, useCallback, useRef } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);
  const [authed, setAuthed] = useState(false);
  const navTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (pathname === '/admin/login') { setAuthed(true); return; }
    const token = sessionStorage.getItem('admin_session_token');
    if (token) {
      setAuthed(true);
      fetch('/api/admin/session', { headers: { Authorization: 'Bearer ' + token } })
        .then((r) => { if (!r.ok) { sessionStorage.removeItem('admin_session_token'); router.replace('/admin/login'); } })
        .catch(() => { sessionStorage.removeItem('admin_session_token'); router.replace('/admin/login'); });
    } else {
      fetch('/api/admin/session')
        .then((r) => { if (r.ok) setAuthed(true); else router.replace('/admin/login'); })
        .catch(() => router.replace('/admin/login'));
    }
  }, [pathname, router]);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.system?.accentColor) {
          document.documentElement.style.setProperty('--accent-color', res.data.system.accentColor);
        }
      })
      .catch(() => {});
  }, []);



  const clearNav = useCallback(() => {
    setNavigating(false);
    if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
  }, []);

  useEffect(() => {
    clearNav();
  }, [pathname, clearNav]);

  const navLinks = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/templates', label: 'Templates', icon: Layers },
    { href: '/admin/devices', label: 'Devices', icon: Server },
    { href: '/admin/template-studio', label: 'Strips Studio', icon: Image },
    { href: '/admin/settings', label: 'Settings', icon: Settings2 },
  ];

  const bottomLinks = [
    { href: '/admin/history', label: 'History', icon: Clock },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname === href || pathname.startsWith(href + '/');
  };

  const handleNavClick = useCallback((href: string) => {
    if (isActive(href)) return;
    setNavigating(true);
    if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
    navTimeoutRef.current = setTimeout(() => setNavigating(false), 5000);
  }, [isActive]);

  const renderNavLink = (link: { href: string; label: string; icon: any }) => {
    const Icon = link.icon;
    return (
      <Link
        key={link.href}
        href={link.href}
        onClick={() => handleNavClick(link.href)}
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
        onClick={() => handleNavClick(link.href)}
        className={`${styles.bottomNavItem} ${isActive(link.href) ? styles.bottomNavItemActive : ''}`}
        title={link.label}
      >
        <Icon size={24} />
        <span className={styles.bottomNavLabel}>{link.label}</span>
      </Link>
    );
  };

  if (!authed) return (
    <div className={styles.loadingScreen}>
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

      <div className={`card ${styles.sidebar}`}>
        <div className={styles.brand}>VelvetSnap</div>
        <nav className={styles.nav}>
          {navLinks.map(renderNavLink)}
          <div className={styles.navDivider} />
          {bottomLinks.map(renderNavLink)}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/" className={`${styles.navLink} ${styles.sidebarLink}`}>&larr; Return to App</Link>
          <button onClick={() => { sessionStorage.removeItem('admin_session_token'); fetch('/api/admin/login', { method: 'DELETE' }).then(() => router.push('/admin/login')); }} className={styles.logoutBtn}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {children}
        <footer className={styles.contentFooter}>
          <span>Velvetsnap Photobooth Platform by <a href="https://widifirmaan.web.id" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>W</a></span>
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
