'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Image, Timer } from 'lucide-react';

interface SettingsData {
  footerText: string;
  primaryColor: string;
  accentColor: string;
  showPreloader: boolean;
  showStrips: boolean;
  slideshowInterval: number;
  sessionTimer: number;
}

const defaults: SettingsData = {
  footerText: 'VelvetSnap Photobooth Platform',
  primaryColor: '#262626',
  accentColor: '#C5D89D',
  showPreloader: true,
  showStrips: true,
  slideshowInterval: 3000,
  sessionTimer: 600,
};

export default function SettingsPage() {
  const router = useRouter();
  const [form, setForm] = useState<SettingsData>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [authErr, setAuthErr] = useState(false);

  const handleAuthFail = () => {
    setAuthErr(true);
    localStorage.removeItem('velvetsnap_admin');
    document.cookie = 'admin_token=;path=/;max-age=0';
    setTimeout(() => router.push('/admin/login'), 1500);
  };

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => {
        if (r.status === 401) { handleAuthFail(); return null; }
        return r.json();
      })
      .then((res) => {
        if (res && res.success && res.data) {
          const d = res.data;
          setForm({
            footerText: d.footerText || defaults.footerText,
            primaryColor: d.primaryColor || defaults.primaryColor,
            accentColor: d.accentColor || defaults.accentColor,
            showPreloader: d.showPreloader ?? defaults.showPreloader,
            showStrips: d.showStrips ?? defaults.showStrips,
            slideshowInterval: d.slideshowInterval || defaults.slideshowInterval,
            sessionTimer: d.sessionTimer ?? defaults.sessionTimer,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const update = (key: keyof SettingsData, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.status === 401) { handleAuthFail(); setSaving(false); return; }
      const json = await res.json();
      if (json.success) setSaved(true);
    } catch {}
    setSaving(false);
  };

  if (authErr) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', flex:1, minHeight:200 }}>
        <div style={{ textAlign:'center' }}>
          <p style={{ color:'#ef4444', fontSize:15, fontWeight:600 }}>Session expired</p>
          <p style={{ color:'#6b7280', fontSize:13, marginTop:4 }}>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', flex:1, minHeight:200 }}>
        <Loader2 className="spin" size={32} />
      </div>
    );
  }

  const card: React.CSSProperties = {
    background:'#fff', borderRadius:16, border:'1px solid #e5e7eb',
    boxShadow:'0 1px 3px rgba(0,0,0,0.06)', overflow:'hidden',
  };

  const cardHeader: React.CSSProperties = {
    padding:'16px 20px', borderBottom:'1px solid #e5e7eb',
    display:'flex', alignItems:'center', gap:10,
    fontSize:15, fontWeight:700, color:'#111',
  };

  const cardBody: React.CSSProperties = {
    padding:'20px',
  };

  const inputStyle: React.CSSProperties = {
    width:'100%', padding:'10px 14px',
    border:'1.5px solid #d1d5db', borderRadius:10,
    fontSize:14, background:'#f9fafb', outline:'none',
    boxSizing:'border-box', fontFamily:'inherit',
    transition:'border-color 0.15s',
  };

  const labelStyle: React.CSSProperties = {
    fontSize:13, fontWeight:600, marginBottom:6, display:'block', color:'#374151',
  };

  const row: React.CSSProperties = {
    display:'grid', gridTemplateColumns:'1fr 1fr', gap:20,
  };

  const focusProps = {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.target.style.borderColor = '#111827'; },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.target.style.borderColor = '#d1d5db'; },
  };

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', gap:20, padding:'0 0 60px', overflowY:'auto', minHeight:0 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 4px 0' }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:700, margin:0, color:'#111' }}>Settings</h1>
          <p style={{ fontSize:14, color:'#6b7280', margin:'4px 0 0' }}>Customize homepage appearance</p>
        </div>
        <button onClick={handleSave} disabled={saving || saved}
          style={{
            display:'inline-flex', alignItems:'center', gap:8,
            padding:'10px 24px', borderRadius:10, border:'none',
            fontSize:14, fontWeight:600, cursor:saving || saved ? 'default' : 'pointer',
            background:saved ? '#10b981' : '#111827', color:'#fff',
            opacity:saving ? 0.6 : 1, transition:'all 0.15s',
          }}>
          {saving ? <Loader2 className="spin" size={16} /> : saved ? null : <Save size={16} />}
          {saving ? 'Menyimpan...' : saved ? 'Tersimpan' : 'Simpan'}
        </button>
      </div>

      {/* Footer */}
      <div style={card}>
        <div style={cardHeader}><Image size={18} /> Footer</div>
        <div style={cardBody}>
          <div>
            <label style={labelStyle}>Footer Text</label>
            <input style={inputStyle} value={form.footerText} onChange={(e) => update('footerText', e.target.value)}
              placeholder="VelvetSnap Photobooth Platform"
              {...focusProps} />
          </div>
        </div>
      </div>

      {/* Timer & Accent */}
      <div style={card}>
        <div style={cardHeader}><Timer size={18} /> Timer &amp; Accent</div>
        <div style={cardBody}>
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div style={row}>
              <div>
                <label style={{ ...labelStyle, display:'flex', alignItems:'center', gap:6 }}>
                  <Timer size={14} /> Session Timer (menit)
                </label>
                <input type="number" value={Math.round(form.sessionTimer / 60)} onChange={(e) => update('sessionTimer', Math.max(1, Number(e.target.value)) * 60)}
                  style={inputStyle} min={1} step={1}
                  {...focusProps} />
              </div>
              <div>
                <label style={labelStyle}>Slideshow Interval (ms)</label>
                <input type="number" value={form.slideshowInterval} onChange={(e) => update('slideshowInterval', Number(e.target.value))}
                  style={inputStyle} min={1000} step={500}
                  {...focusProps} />
              </div>
            </div>
            <div style={{ borderTop:'1px solid #e5e7eb', paddingTop:20 }}>
              <div style={row}>
                <div>
                  <label style={labelStyle}>Primary Color</label>
                  <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                    <input type="color" value={form.primaryColor} onChange={(e) => update('primaryColor', e.target.value)}
                      style={{ width:44, height:44, border:'1.5px solid #d1d5db', borderRadius:10, padding:3, cursor:'pointer', background:'none' }} />
                    <input style={inputStyle} value={form.primaryColor} onChange={(e) => update('primaryColor', e.target.value)}
                      {...focusProps} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Accent Color</label>
                  <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                    <input type="color" value={form.accentColor} onChange={(e) => update('accentColor', e.target.value)}
                      style={{ width:44, height:44, border:'1.5px solid #d1d5db', borderRadius:10, padding:3, cursor:'pointer', background:'none' }} />
                    <input style={inputStyle} value={form.accentColor} onChange={(e) => update('accentColor', e.target.value)}
                      {...focusProps} />
                  </div>
                </div>
              </div>
            </div>
            <div style={{ borderTop:'1px solid #e5e7eb', paddingTop:20, display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <input type="checkbox" checked={form.showPreloader} onChange={(e) => update('showPreloader', e.target.checked)}
                  style={{ width:18, height:18, accentColor:'#111827' }} />
                <span style={{ fontSize:14, color:'#374151' }}>Show Preloader Animation</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <input type="checkbox" checked={form.showStrips} onChange={(e) => update('showStrips', e.target.checked)}
                  style={{ width:18, height:18, accentColor:'#111827' }} />
                <span style={{ fontSize:14, color:'#374151' }}>Show Recent Strips Carousel</span>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
