'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, Palette, Type, ToggleLeft, Image, AlignLeft, AlignCenter, AlignRight, Check, RotateCcw, Timer } from 'lucide-react';
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
  fontFamily: string;
  headingFontFamily: string;
  headingFontSize: number;
  bodyFontSize: number;
  textAlign: string;
  sessionTimer: number;
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
  fontFamily: '',
  headingFontFamily: '',
  headingFontSize: 0,
  bodyFontSize: 0,
  textAlign: '',
  sessionTimer: 600,
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
            fontFamily: d.fontFamily ?? defaults.fontFamily,
            headingFontFamily: d.headingFontFamily ?? defaults.headingFontFamily,
            headingFontSize: d.headingFontSize ?? defaults.headingFontSize,
            bodyFontSize: d.bodyFontSize ?? defaults.bodyFontSize,
            textAlign: d.textAlign ?? defaults.textAlign,
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
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <Timer size={16} />
            <label style={{ fontSize:14, whiteSpace:'nowrap' }}>Session Timer (menit)</label>
            <input type="number" value={Math.round(form.sessionTimer / 60)} onChange={(e) => update('sessionTimer', Math.max(1, Number(e.target.value)) * 60)}
              style={{ ...inputStyle, width:80 }} min={1} step={1} />
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

      <div className="glass-panel" style={{ padding:28 }}>
        <AdminSectionTitle icon={Type} title="Typography" />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginTop:16 }}>
          <div>
            <label style={labelStyle}>Body Font Family</label>
            <input style={inputStyle} value={form.fontFamily} onChange={(e) => update('fontFamily', e.target.value)} placeholder="e.g. Inter, sans-serif" />
          </div>
          <div>
            <label style={labelStyle}>Heading Font Family</label>
            <input style={inputStyle} value={form.headingFontFamily} onChange={(e) => update('headingFontFamily', e.target.value)} placeholder="e.g. Playfair Display, serif" />
          </div>
          <div>
            <label style={labelStyle}>Heading Font Size (px)</label>
            <input type="number" style={inputStyle} value={form.headingFontSize || ''} onChange={(e) => update('headingFontSize', Number(e.target.value))} min={0} placeholder="0 = use default" />
          </div>
          <div>
            <label style={labelStyle}>Body Font Size (px)</label>
            <input type="number" style={inputStyle} value={form.bodyFontSize || ''} onChange={(e) => update('bodyFontSize', Number(e.target.value))} min={0} placeholder="0 = use default" />
          </div>
        </div>
        <div style={{ marginTop:16 }}>
          <label style={labelStyle}>Text Alignment</label>
          <div style={{ display:'flex', gap:8 }}>
            {(['left', 'center', 'right'] as const).map((align) => {
              const Icon = align === 'left' ? AlignLeft : align === 'center' ? AlignCenter : AlignRight;
              const active = form.textAlign === align;
              return (
                <button key={align} onClick={() => update('textAlign', active ? '' : align)}
                  style={{
                    display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                    padding:'10px 18px', borderRadius:10, cursor:'pointer', fontSize:14, fontWeight:500,
                    border: active ? '2px solid var(--accent-color)' : '1.5px solid var(--mn-border)',
                    background: active ? 'color-mix(in srgb, var(--accent-color) 15%, transparent)' : 'var(--clay-bg)',
                    color: active ? 'var(--accent-color)' : 'var(--text-primary)',
                    transition:'all 0.15s', minWidth:90,
                  }}>
                  {active && <Check size={14} />}
                  <Icon size={16} />
                  {align.charAt(0).toUpperCase() + align.slice(1)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ display:'flex', justifyContent:'center', marginTop:8 }}>
        <button onClick={() => { setForm({ ...defaults }); setSaved(false); }}
          style={{
            display:'inline-flex', alignItems:'center', gap:8,
            padding:'10px 24px', borderRadius:10, cursor:'pointer', fontSize:14, fontWeight:500,
            border:'1.5px solid #e74c3c', background:'transparent', color:'#e74c3c',
            transition:'all 0.15s',
          }}>
          <RotateCcw size={16} /> Reset ke Default
        </button>
      </div>
    </div>
  );
}
