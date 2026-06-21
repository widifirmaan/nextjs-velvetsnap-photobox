'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, ExternalLink } from 'lucide-react';
import { STORAGE_KEYS } from '@/lib/constants';
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
          sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION_TOKEN);
          sessionStorage.removeItem(STORAGE_KEYS.ADMIN_IS_ROOT);
          sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
          sessionStorage.removeItem(STORAGE_KEYS.ADMIN_USERNAME);
          localStorage.removeItem(STORAGE_KEYS.ACCOUNT);
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
