// File: src/app/admin/layout.tsx
// Description: Auto-added top comment for easier file identification.

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Layers, Server, Clock, Film, Loader2, LogOut, Settings2, User, Users, type LucideIcon } from 'lucide-react';
import styles from './layout.module.css';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { STORAGE_KEYS, CURTAIN_ANIM_DELAY, CURTAIN_FALLBACK_TIMEOUT } from '@/lib/utils/constants';
import { adminFetch, clearAdminSession, syncAdminSession } from '@/lib/utils/admin-fetch';

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);
  const [curtainPhase, setCurtainPhase] = useState<'idle' | 'closing' | 'opening'>('idle');
  const authed = useMemo(
    () => pathname === '/admin/login' ||
      (typeof window !== 'undefined' && !!sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION_TOKEN)),
    [pathname]
  );
  const [isRoot, setIsRoot] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(STORAGE_KEYS.ADMIN_IS_ROOT) === '1';
  });
  const [username, setUsername] = useState(() => {
    if (typeof window === 'undefined') return '';
    return sessionStorage.getItem(STORAGE_KEYS.ADMIN_USERNAME) || '';
  });
  const [pendingNav, setPendingNav] = useState(false);
  const targetRef = useRef<string | null>(null);

  useEffect(() => {
    if (pathname === '/admin/login') return;
    const token = sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION_TOKEN);
    if (token) {
      adminFetch('/api/admin/session')
        .then((r) => {
          if (r.ok) return r.json();
          sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION_TOKEN);
          sessionStorage.removeItem(STORAGE_KEYS.ADMIN_IS_ROOT);
          sessionStorage.removeItem(STORAGE_KEYS.ADMIN_USERNAME);
          router.replace('/admin/login');
          return null;
        })
        .then((data) => {
          if (data) {
            setIsRoot(data.isRoot);
            setUsername(data.username || '');
            syncAdminSession(data);
          }
        })
        .catch(() => {
          sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION_TOKEN);
          sessionStorage.removeItem(STORAGE_KEYS.ADMIN_IS_ROOT);
          sessionStorage.removeItem(STORAGE_KEYS.ADMIN_USERNAME);
          router.replace('/admin/login');
        });
    } else {
      router.replace('/admin/login');
    }
  }, [pathname, router]);

  useEffect(() => {
    adminFetch('/api/settings')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.system?.accentColor) {
          document.documentElement.style.setProperty('--accent-color', res.data.system.accentColor);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (curtainPhase === 'closing') {
      const t = setTimeout(() => {
        const href = targetRef.current;
        if (href) {
          router.push(href);
          setPendingNav(true);
        }
      }, CURTAIN_ANIM_DELAY);
      return () => clearTimeout(t);
    }
    if (curtainPhase === 'opening') {
      const t = setTimeout(() => {
        setCurtainPhase('idle');
        setNavigating(false);
      }, CURTAIN_ANIM_DELAY);
      return () => clearTimeout(t);
    }
  }, [curtainPhase, router]);

  useEffect(() => {
    if (!pendingNav || !targetRef.current) return;
    const target = targetRef.current;
    const matches = target === '/admin' ? pathname === '/admin' : pathname === target || pathname.startsWith(target + '/');
    if (matches) {
      targetRef.current = null;
      setPendingNav(false);
      setCurtainPhase('opening');
    }
  }, [pathname, pendingNav]);

  useEffect(() => {
    if (!pendingNav) return;
    const t = setTimeout(() => {
      targetRef.current = null;
      setPendingNav(false);
      setCurtainPhase('opening');
    }, CURTAIN_FALLBACK_TIMEOUT);
    return () => clearTimeout(t);
  }, [pendingNav]);

  const isActive = useCallback((href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname === href || pathname.startsWith(href + '/');
  }, [pathname]);

  const rootNavLinks: NavLink[] = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/history', label: 'History', icon: Clock },
    { href: '/admin/templates', label: 'Templates', icon: Layers },
    { href: '/admin/template-studio', label: 'Strips Studio', icon: Film },
    { href: '/admin/accounts', label: 'Accounts', icon: Users },
    { href: '/admin/devices', label: 'Devices', icon: Server },
    { href: '/admin/settings', label: 'Settings', icon: Settings2 },
  ];

  const accountNavLinks: NavLink[] = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/history', label: 'History', icon: Clock },
    { href: '/admin/templates', label: 'Templates', icon: Layers },
    { href: '/admin/settings', label: 'My Settings', icon: Settings2 },
  ];

  const navLinks: NavLink[] = isRoot ? rootNavLinks : accountNavLinks;

  const handleNavClick = useCallback((e: React.MouseEvent, href: string) => {
    e.preventDefault();
    if (curtainPhase !== 'idle') return;
    if (isActive(href)) return;
    targetRef.current = href;
    setCurtainPhase('closing');
    setNavigating(true);
  }, [isActive, curtainPhase]);

  const handleLogout = () => {
    clearAdminSession();
    adminFetch('/api/admin/login', { method: 'DELETE' }).then(() => router.push('/admin/login'));
  };

  const renderNavLink = (link: NavLink) => {
    const Icon = link.icon;
    return (
      <Link
        key={link.href}
        href={link.href}
        onClick={(e) => handleNavClick(e, link.href)}
        className={`${styles.navLink} ${isActive(link.href) ? styles.navLinkActive : ''}`}
        aria-label={link.label}
      >
        <Icon size={20} /> {link.label}
      </Link>
    );
  };

  const renderBottomNavItem = (link: NavLink) => {
    const Icon = link.icon;
    return (
      <Link
        key={link.href}
        href={link.href}
        onClick={(e) => handleNavClick(e, link.href)}
        className={`${styles.bottomNavItem} ${isActive(link.href) ? styles.bottomNavItemActive : ''}`}
        title={link.label}
        aria-label={link.label}
      >
        <Icon size={24} />
        <span className={styles.bottomNavLabel}>{link.label}</span>
      </Link>
    );
  };

  if (pathname === '/admin/login') return <>{children}</>;

  if (!authed) return (
    <div className={styles.loadingScreen}>
      <Loader2 className="spin" size={32} />
    </div>
  );

  return (
    <div className={styles.adminLayout}>
      {navigating && (
        <div className={styles.curtainOverlay}>
          <div className={`${styles.curtainPanel} ${styles.curtainLeft} ${curtainPhase === 'closing' ? styles.closing : curtainPhase === 'opening' ? styles.opening : ''}`} />
          <div className={`${styles.curtainPanel} ${styles.curtainRight} ${curtainPhase === 'closing' ? styles.closing : curtainPhase === 'opening' ? styles.opening : ''}`} />
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
          <button onClick={handleLogout} className={styles.logoutBtn} aria-label="Logout">
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
