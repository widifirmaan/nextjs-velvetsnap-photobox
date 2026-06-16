'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Layers, Server, Clock, Film, Loader2, LogOut, Settings2, User, Users } from 'lucide-react';
import styles from './layout.module.css';
import { useState, useEffect, useCallback, useRef } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [isRoot, setIsRoot] = useState(true);
  const [username, setUsername] = useState('');
  const navTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (pathname === '/admin/login') { setAuthed(true); return; }
    const token = sessionStorage.getItem('admin_session_token');
    if (token) {
      setAuthed(true);
      const savedRoot = sessionStorage.getItem('admin_is_root');
      const savedUser = sessionStorage.getItem('admin_username');
      if (savedRoot !== null) setIsRoot(savedRoot === '1');
      if (savedUser) setUsername(savedUser);
      fetch('/api/admin/session', { headers: { Authorization: 'Bearer ' + token } })
        .then((r) => {
          if (r.ok) return r.json();
          sessionStorage.removeItem('admin_session_token');
          sessionStorage.removeItem('admin_is_root');
          sessionStorage.removeItem('admin_account_id');
          sessionStorage.removeItem('admin_username');
          router.replace('/admin/login');
          return null;
        })
        .then((data) => {
          if (data) {
            setIsRoot(data.isRoot);
            setUsername(data.username || '');
            sessionStorage.setItem('admin_is_root', data.isRoot ? '1' : '0');
            if (data.accountId) sessionStorage.setItem('admin_account_id', data.accountId);
            if (data.username) sessionStorage.setItem('admin_username', data.username);
            // Sync to localStorage for kiosk pages
            if (data.accountId && !data.isRoot) {
              localStorage.setItem('velvetsnap_account_id', data.accountId);
            } else {
              localStorage.removeItem('velvetsnap_account_id');
            }
          }
        })
        .catch(() => {
          sessionStorage.removeItem('admin_session_token');
          sessionStorage.removeItem('admin_is_root');
          sessionStorage.removeItem('admin_account_id');
          sessionStorage.removeItem('admin_username');
          router.replace('/admin/login');
        });
    } else {
      fetch('/api/admin/session')
        .then((r) => { if (r.ok) { setAuthed(true); } else router.replace('/admin/login'); })
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

  useEffect(() => { clearNav(); }, [pathname, clearNav]);

  const rootNavLinks = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/history', label: 'History', icon: Clock },
    { href: '/admin/templates', label: 'Templates', icon: Layers },
    { href: '/admin/template-studio', label: 'Strips Studio', icon: Film },
    { href: '/admin/accounts', label: 'Accounts', icon: Users },
    { href: '/admin/devices', label: 'Devices', icon: Server },
    { href: '/admin/settings', label: 'Settings', icon: Settings2 },
  ];

  const accountNavLinks = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/history', label: 'History', icon: Clock },
    { href: '/admin/templates', label: 'Templates', icon: Layers },
    { href: '/admin/settings', label: 'My Settings', icon: Settings2 },
  ];

  const navLinks = isRoot ? rootNavLinks : accountNavLinks;

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

  const handleLogout = () => {
    sessionStorage.removeItem('admin_session_token');
    sessionStorage.removeItem('admin_is_root');
    sessionStorage.removeItem('admin_account_id');
    sessionStorage.removeItem('admin_username');
    localStorage.removeItem('velvetsnap_account_id');
    fetch('/api/admin/login', { method: 'DELETE' }).then(() => router.push('/admin/login'));
  };

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
        <div className={styles.accountInfo}>
          <User size={14} />
          <span>{username} {isRoot ? '(Root)' : ''}</span>
        </div>
        <nav className={styles.nav}>
          {navLinks.map(renderNavLink)}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/" className={`${styles.navLink} ${styles.sidebarLink}`}>&larr; Return to App</Link>
          <button onClick={handleLogout} className={styles.logoutBtn}>
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
      </nav>
    </div>
  );
}
