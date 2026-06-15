'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, ExternalLink } from 'lucide-react';
import styles from './page.module.css';

export default function MobileActions() {
  const router = useRouter();

  return (
    <div className={styles.mobileActions}>
      <Link href="/" className={`card card-sm ${styles.mobileActionBtn}`}>
        <ExternalLink size={18} />
        Go to App
      </Link>
      <button
        onClick={() => {
          sessionStorage.removeItem('admin_session_token');
          sessionStorage.removeItem('admin_is_root');
          sessionStorage.removeItem('admin_account_id');
          sessionStorage.removeItem('admin_username');
          localStorage.removeItem('velvetsnap_account_id');
          fetch('/api/admin/login', { method: 'DELETE' }).then(() => router.push('/admin/login'));
        }}
        className={`card card-sm ${styles.mobileActionBtn}`}
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  );
}
