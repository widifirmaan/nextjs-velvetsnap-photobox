'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import styles from './page.module.css';
import { STORAGE_KEYS } from '@/lib/constants';
import { adminFetch, syncAdminSession } from '@/lib/admin-fetch';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION_TOKEN)) {
      setLoading(false);
      return;
    }
    adminFetch('/api/admin/session')
      .then((r) => { if (r.status === 200) router.replace('/admin'); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() || 'root', password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Login failed');
        setSubmitting(false);
        return;
      }
      const data = await res.json();
      if (data.token) {
        sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION_TOKEN, data.token);
        syncAdminSession(data);
      }
      router.replace('/admin');
    } catch {
      setError('Network error');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <Loader2 className="spin" size={32} />
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <form onSubmit={handleLogin} className={`card card-lg ${styles.form}`}>
        <div className={styles.brandText}>VelvetSnap</div>
        <div className={styles.subText}>Admin Panel</div>

        <input
          type="text" placeholder="Username (kosongkan untuk root)" autoFocus
          value={username} onChange={(e) => setUsername(e.target.value)}
          className={`form-input ${styles.input}`}
        />

        <input
          type="password" placeholder="Password"
          value={password} onChange={(e) => setPassword(e.target.value)}
          className={`form-input ${styles.input}`}
        />

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" disabled={submitting} className={`mac-button ${styles.submitBtn}`} style={{ opacity: submitting ? 0.5 : 1 }}>
          {submitting ? 'Memeriksa...' : 'Masuk'}
        </button>
      </form>
    </div>
  );
}
