'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import styles from './page.module.css';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const t = sessionStorage.getItem('admin_session_token');
    fetch('/api/admin/session', { headers: t ? { 'Authorization': 'Bearer ' + t } : {} })
      .then((r) => {
        if (r.status === 200) router.replace('/admin');
      })
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
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Invalid password');
        setSubmitting(false);
        return;
      }
      const data = await res.json();
      if (data.token) sessionStorage.setItem('admin_session_token', data.token);
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
          type="password" placeholder="Password" autoFocus
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
