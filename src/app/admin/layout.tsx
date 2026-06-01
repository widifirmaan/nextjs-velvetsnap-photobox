import Link from 'next/link';
import { LayoutDashboard, Layers, Server, Clock, DollarSign, Image } from 'lucide-react';
import styles from './layout.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.adminLayout}>
      <div className={`glass-panel ${styles.sidebar}`}>
        <div className={styles.brand}>VelvetSnap</div>
        <nav className={styles.nav}>
          <Link href="/admin" className={styles.navLink}>
            <LayoutDashboard size={20} /> Overview
          </Link>
          <Link href="/admin/templates" className={styles.navLink}>
            <Layers size={20} /> Templates
          </Link>
          <Link href="/admin/devices" className={styles.navLink}>
            <Server size={20} /> Devices
          </Link>
          <Link href="/strips-studio" className={styles.navLink}>
            <Image size={20} /> Strips Studio
          </Link>

          <div className={styles.navDivider} />

          <Link href="/admin/history" className={styles.navLink}>
            <Clock size={20} /> History
          </Link>
          <Link href="/admin/finance" className={styles.navLink}>
            <DollarSign size={20} /> Finance
          </Link>
        </nav>
        
        <div className={styles.footer}>
          <Link href="/" className={styles.navLink} style={{ color: 'var(--text-secondary)' }}>
            &larr; Return to App
          </Link>
        </div>
      </div>
      
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}
