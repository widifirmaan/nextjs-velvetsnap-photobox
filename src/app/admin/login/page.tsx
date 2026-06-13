'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('velvetsnap_admin');
      if (raw) {
        const data = JSON.parse(raw);
        if (data.u === 'admin') router.replace('/admin');
      }
    } catch {}
    setLoading(false);
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (username !== 'admin' || password !== 'root') {
      setError('Username atau password salah');
      return;
    }
    localStorage.setItem('velvetsnap_admin', JSON.stringify({ u: username, t: Date.now() }));
    document.cookie = 'admin_token=' + btoa('admin:root') + ';path=/;max-age=86400;SameSite=Lax';
    router.replace('/admin');
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
          type="text" placeholder="Username" autoFocus
          value={username} onChange={(e) => setUsername(e.target.value)}
          style={{
            width:'100%', padding:'12px 14px',
            border:'1.5px solid var(--mn-border)', borderRadius:12,
            fontSize:16, marginBottom:12, outline:'none',
            background:'var(--clay-bg)', boxSizing:'border-box',
          }}
        />
        <input
          type="password" placeholder="Password"
          value={password} onChange={(e) => setPassword(e.target.value)}
          style={{
            width:'100%', padding:'12px 14px',
            border:'1.5px solid var(--mn-border)', borderRadius:12,
            fontSize:16, marginBottom:20, outline:'none',
            background:'var(--clay-bg)', boxSizing:'border-box',
          }}
        />

        {error && <p style={{ color:'#e74c3c', fontSize:13, marginBottom:16 }}>{error}</p>}

        <button type="submit" style={{
          width:'100%', padding:'12px', background:'var(--text-primary)',
          color:'#fff', border:'none', borderRadius:12,
          fontSize:16, fontWeight:600, cursor:'pointer',
          transition:'opacity var(--transition-fast)',
        }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          Masuk
        </button>
      </form>
    </div>
  );
}