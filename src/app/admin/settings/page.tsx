'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, Palette, Type, ToggleLeft, Image, Settings2 } from 'lucide-react';
import { AdminPageHeader, AdminSectionTitle } from '@/app/admin/components';

interface SettingsData {
  appName: string;
  appTagline: string;
  heroTitle: string;
  heroSubtitle: string;
  footerText: string;
  primaryColor: string;
  accentColor: string;
  showPreloader: boolean;
  showStrips: boolean;
  slideshowInterval: number;
}

const defaults: SettingsData = {
  appName: 'VelvetSnap',
  appTagline: 'AI-Powered Photobooth Experience',
  heroTitle: 'Abadikan Momen Spesialmu',
  heroSubtitle: 'Pilih frame, foto, edit, dan dapatkan hasil cetakan berkualitas tinggi dalam hitungan menit',
  footerText: 'VelvetSnap Photobooth Platform',
  primaryColor: '#262626',
  accentColor: '#C5D89D',
  showPreloader: true,
  showStrips: true,
  slideshowInterval: 3000,
};

export default function SettingsPage() {
  const [form, setForm] = useState<SettingsData>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          const d = res.data;
          setForm({
            appName: d.appName || defaults.appName,
            appTagline: d.appTagline || defaults.appTagline,
            heroTitle: d.heroTitle || defaults.heroTitle,
            heroSubtitle: d.heroSubtitle || defaults.heroSubtitle,
            footerText: d.footerText || defaults.footerText,
            primaryColor: d.primaryColor || defaults.primaryColor,
            accentColor: d.accentColor || defaults.accentColor,
            showPreloader: d.showPreloader ?? defaults.showPreloader,
            showStrips: d.showStrips ?? defaults.showStrips,
            slideshowInterval: d.slideshowInterval || defaults.slideshowInterval,
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
      const json = await res.json();
      if (json.success) setSaved(true);
    } catch {}
    setSaving(false);
  };

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', flex:1, minHeight:200 }}>
        <Loader2 className="spin" size={32} />
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width:'100%', padding:'10px 14px',
    border:'1.5px solid var(--mn-border)', borderRadius:12,
    fontSize:14, background:'var(--clay-bg)', outline:'none',
    boxSizing:'border-box', fontFamily:'inherit',
  };

  const labelStyle: React.CSSProperties = {
    fontSize:13, fontWeight:600, marginBottom:6, display:'block', color:'var(--text-primary)',
  };

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', gap:24, paddingBottom:40 }}>
      <AdminPageHeader
        title="Settings"
        subtitle="Customize branding and homepage appearance"
        action={{ label: saved ? 'Tersimpan' : 'Simpan', icon: saved ? undefined : Save, onClick: handleSave, disabled: saving || saved }}
      />

      <div className="glass-panel" style={{ padding:28 }}>
        <AdminSectionTitle icon={Type} title="Branding" />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginTop:16 }}>
          <div>
            <label style={labelStyle}>App Name</label>
            <input style={inputStyle} value={form.appName} onChange={(e) => update('appName', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Tagline</label>
            <input style={inputStyle} value={form.appTagline} onChange={(e) => update('appTagline', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding:28 }}>
        <AdminSectionTitle icon={Palette} title="Homepage Hero" />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginTop:16 }}>
          <div style={{ gridColumn:'1 / -1' }}>
            <label style={labelStyle}>Hero Title</label>
            <input style={inputStyle} value={form.heroTitle} onChange={(e) => update('heroTitle', e.target.value)} />
          </div>
          <div style={{ gridColumn:'1 / -1' }}>
            <label style={labelStyle}>Hero Subtitle</label>
            <textarea style={{ ...inputStyle, minHeight:72, resize:'vertical' }} value={form.heroSubtitle} onChange={(e) => update('heroSubtitle', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding:28 }}>
        <AdminSectionTitle icon={Palette} title="Colors" />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginTop:16 }}>
          <div>
            <label style={labelStyle}>Primary Color</label>
            <div style={{ display:'flex', gap:12, alignItems:'center' }}>
              <input type="color" value={form.primaryColor} onChange={(e) => update('primaryColor', e.target.value)}
                style={{ width:44, height:44, border:'1.5px solid var(--mn-border)', borderRadius:12, padding:3, cursor:'pointer', background:'none' }} />
              <input style={inputStyle} value={form.primaryColor} onChange={(e) => update('primaryColor', e.target.value)} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Accent Color</label>
            <div style={{ display:'flex', gap:12, alignItems:'center' }}>
              <input type="color" value={form.accentColor} onChange={(e) => update('accentColor', e.target.value)}
                style={{ width:44, height:44, border:'1.5px solid var(--mn-border)', borderRadius:12, padding:3, cursor:'pointer', background:'none' }} />
              <input style={inputStyle} value={form.accentColor} onChange={(e) => update('accentColor', e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding:28 }}>
        <AdminSectionTitle icon={ToggleLeft} title="Toggles" />
        <div style={{ display:'flex', gap:32, marginTop:16, flexWrap:'wrap' }}>
          <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', fontSize:14 }}>
            <input type="checkbox" checked={form.showPreloader} onChange={(e) => update('showPreloader', e.target.checked)}
              style={{ width:18, height:18, accentColor:'var(--accent-color)' }} />
            Show Preloader Animation
          </label>
          <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', fontSize:14 }}>
            <input type="checkbox" checked={form.showStrips} onChange={(e) => update('showStrips', e.target.checked)}
              style={{ width:18, height:18, accentColor:'var(--accent-color)' }} />
            Show Recent Strips Carousel
          </label>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <label style={{ fontSize:14, whiteSpace:'nowrap' }}>Slideshow Interval (ms)</label>
            <input type="number" value={form.slideshowInterval} onChange={(e) => update('slideshowInterval', Number(e.target.value))}
              style={{ ...inputStyle, width:120 }} min={1000} step={500} />
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding:28 }}>
        <AdminSectionTitle icon={Image} title="Footer" />
        <div style={{ marginTop:16 }}>
          <label style={labelStyle}>Footer Text</label>
          <input style={inputStyle} value={form.footerText} onChange={(e) => update('footerText', e.target.value)} />
        </div>
      </div>
    </div>
  );
}
