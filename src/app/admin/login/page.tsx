'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

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
      if (res.ok) {
        const data = await res.json();
        if (data.token) sessionStorage.setItem('admin_session_token', data.token);
        router.replace('/admin');
      } else {
        const data = await res.json();
        setError(data.error || 'Invalid password');
      }
    } catch {
      setError('Network error');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100dvh', background:'var(--clay-bg)' }}>
        <Loader2 className="spin" size={32} />
      </div>
    );
  }

  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'center',
      minHeight:'100dvh', background:'var(--clay-bg)', padding:24,
    }}>
      <form onSubmit={handleLogin} style={{
        background:'#fff', padding:40, borderRadius:'var(--clay-radius)',
        width:'100%', maxWidth:380,
        boxShadow:'var(--clay-shadow-elevated, 0 12px 40px rgba(0,0,0,0.08))',
      }}>
        <div style={{ fontSize:22, fontWeight:700, marginBottom:2, letterSpacing:'-0.03em' }}>VelvetSnap</div>
        <div style={{ color:'var(--text-secondary)', marginBottom:28, fontSize:14 }}>Admin Panel</div>

        <input
          type="password" placeholder="Password" autoFocus
          value={password} onChange={(e) => setPassword(e.target.value)}
          style={{
            width:'100%', padding:'12px 14px',
            border:'1.5px solid var(--mn-border)', borderRadius:12,
            fontSize:16, marginBottom:20, outline:'none',
            background:'var(--clay-bg)', boxSizing:'border-box',
          }}
        />

        {error && <p style={{ color:'#e74c3c', fontSize:13, marginBottom:16 }}>{error}</p>}

        <button type="submit" disabled={submitting} style={{
          width:'100%', padding:'12px', background:submitting ? '#9ca3af' : 'var(--text-primary)',
          color:'#fff', border:'none', borderRadius:12,
          fontSize:16, fontWeight:600, cursor:submitting ? 'default' : 'pointer',
          transition:'opacity var(--transition-fast)',
        }}>
          {submitting ? 'Memeriksa...' : 'Masuk'}
        </button>
      </form>
    </div>
  );
}
