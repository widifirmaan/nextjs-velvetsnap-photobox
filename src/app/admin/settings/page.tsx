'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Image, Timer, Lock, Check, MapPin, Plus, Trash2, CheckCircle, FileText, Upload } from 'lucide-react';
import { adminFetch } from '@/lib/admin-fetch';
import { AdminConfirmModal, AdminModal } from '@/app/admin/components';
import styles from './page.module.css';

interface NavItem { label: string; url: string; }

interface SettingsData {
  header: { location: string; navItems: string };
  footer: { text: string };
  system: { primaryColor: string; accentColor: string; showPreloader: boolean; showStrips: boolean; slideshowInterval: number; sessionTimer: number };
  heroTitle: string;
  heroSubtitle: string;
  appName: string;
  appTagline: string;
  logo: string;
}

const defaults: SettingsData = {
  header: { location: 'Jakarta', navItems: '[{"label":"Instagram","url":"https://instagram.com"},{"label":"WhatsApp","url":"https://wa.me/628123456789"},{"label":"Templates","url":"/templates"},{"label":"Studio","url":"/strips-studio"}]' },
  footer: { text: 'VelvetSnap Photobooth Platform' },
  system: { primaryColor: '#262626', accentColor: '#C5D89D', showPreloader: true, showStrips: true, slideshowInterval: 3000, sessionTimer: 600 },
  heroTitle: 'Abadikan Momen Spesialmu',
  heroSubtitle: 'Pilih frame, foto, edit, dan dapatkan hasil cetakan berkualitas tinggi dalam hitungan menit',
  appName: 'VelvetSnap',
  appTagline: 'AI-Powered Photobooth Experience',
  logo: '',
};

export default function SettingsPage() {
  const router = useRouter();
  const [form, setForm] = useState<SettingsData>(defaults);
  const formRef = useRef(form);
  formRef.current = form;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveErr, setSaveErr] = useState('');
  const [confirmSave, setConfirmSave] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [authErr, setAuthErr] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [passSaving, setPassSaving] = useState(false);
  const [passSaved, setPassSaved] = useState(false);
  const [passErr, setPassErr] = useState('');

  const handleAuthFail = () => {
    setAuthErr(true);
    adminFetch('/api/admin/login', { method: 'DELETE' });
    setTimeout(() => router.push('/admin/login'), 1500);
  };

  useEffect(() => {
    adminFetch('/api/settings')
      .then((r) => {
        if (r.status === 401) { handleAuthFail(); return null; }
        return r.json();
      })
      .then((res) => {
        if (res && res.success && res.data) {
          const d = res.data;
          setForm({
            header: {
              location: d.header?.location || defaults.header.location,
              navItems: d.header?.navItems || defaults.header.navItems,
            },
            footer: {
              text: d.footer?.text || defaults.footer.text,
            },
            system: {
              primaryColor: d.system?.primaryColor || defaults.system.primaryColor,
              accentColor: d.system?.accentColor || defaults.system.accentColor,
              showPreloader: d.system?.showPreloader ?? defaults.system.showPreloader,
              showStrips: d.system?.showStrips ?? defaults.system.showStrips,
              slideshowInterval: d.system?.slideshowInterval || defaults.system.slideshowInterval,
              sessionTimer: d.system?.sessionTimer ?? defaults.system.sessionTimer,
            },
            heroTitle: d.heroTitle || defaults.heroTitle,
            heroSubtitle: d.heroSubtitle || defaults.heroSubtitle,
            appName: d.appName || defaults.appName,
            appTagline: d.appTagline || defaults.appTagline,
            logo: d.logo || '',
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateSection = (section: keyof SettingsData, field: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      [section]: { ...(prev[section] as any), [field]: value },
    }));
    setSaved(false);
  };

  const setRootField = (field: keyof Omit<SettingsData, 'header' | 'footer' | 'system'>, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setConfirmSave(false);
    setSaving(true);
    setSaveErr('');
    try {
      const res = await adminFetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formRef.current),
      });
      if (res.status === 401) { handleAuthFail(); setSaving(false); return; }
      const json = await res.json();
      if (json.success) { setSaved(true); setSuccessOpen(true); try { new BroadcastChannel('velvetsnap').postMessage('settings-updated'); } catch {} }
      else setSaveErr(json.error || 'Gagal menyimpan');
    } catch (e: any) {
      setSaveErr(e?.message || 'Network error');
    }
    setSaving(false);
  };

  const handleSavePass = async () => {
    if (newPass.length < 4) { setPassErr('Minimal 4 karakter'); return; }
    setPassSaving(true);
    setPassErr('');
    try {
      const res = await adminFetch('/api/admin/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPass }),
      });
      if (res.status === 401) { handleAuthFail(); setPassSaving(false); return; }
      const json = await res.json();
      if (json.success) { setPassSaved(true); setNewPass(''); setTimeout(() => setPassSaved(false), 3000); }
      else setPassErr(json.error || 'Gagal');
    } catch { setPassErr('Network error'); }
    setPassSaving(false);
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
    boxShadow:'0 1px 3px rgba(0,0,0,0.06)',
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

  const navItems: NavItem[] = (() => { try { return JSON.parse(form.header.navItems); } catch { return []; } })();

  const updateNavItem = (i: number, field: keyof NavItem, value: string) => {
    const items = [...navItems];
    items[i] = { ...items[i], [field]: value };
    updateSection('header', 'navItems', JSON.stringify(items));
  };

  const addNavItem = () => {
    updateSection('header', 'navItems', JSON.stringify([...navItems, { label: '', url: '' }]));
  };

  const removeNavItem = (i: number) => {
    const items = navItems.filter((_, idx) => idx !== i);
    updateSection('header', 'navItems', JSON.stringify(items));
  };

  const smallInput: React.CSSProperties = {
    ...inputStyle, width: '100%', boxSizing: 'border-box' as const,
  };

  const focusProps = {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.target.style.borderColor = '#111827'; },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.target.style.borderColor = '#d1d5db'; },
  };

  const uploadImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUri = reader.result as string;
      adminFetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUri, folder: 'velvetsnap/settings' }),
      })
        .then((r) => r.json())
        .then((res) => {
          if (res.success) { setRootField('logo', res.url); }
        })
        .catch(() => {});
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', gap:20, padding:'0 0 60px', overflowY:'auto', minHeight:0 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 4px 0' }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:700, margin:0, color:'#111' }}>Settings</h1>
          <p style={{ fontSize:14, color:'#6b7280', margin:'4px 0 0' }}>Customize homepage appearance</p>
        </div>
        <button onClick={() => setConfirmSave(true)} disabled={saving || saved}
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
      {saveErr && <p style={{ color:'#ef4444', fontSize:13, margin:0, textAlign:'right', paddingRight:4 }}>{saveErr}</p>}

      {/* Header */}
      <div style={card}>
        <div style={cardHeader}><MapPin size={18} /> Page Header</div>
        <div style={cardBody}>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <label style={labelStyle}>Location Name</label>
              <input style={inputStyle} value={form.header.location} onChange={(e) => updateSection('header', 'location', e.target.value)}
                placeholder="Jakarta" {...focusProps} />
            </div>
            <div style={{ borderTop:'1px solid #e5e7eb', paddingTop:16 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <label style={{ ...labelStyle, margin:0 }}>Navigation Items</label>
                <button onClick={addNavItem} style={{
                  display:'inline-flex', alignItems:'center', gap:4,
                  padding:'5px 12px', borderRadius:8, border:'1px solid #d1d5db',
                  fontSize:12, fontWeight:600, cursor:'pointer',
                  background:'#f9fafb', color:'#374151',
                }}><Plus size={14} /> Add Item</button>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {navItems.map((item, i) => (
                  <div key={i} className={styles.navItem}>
                    <input style={smallInput} value={item.label} onChange={(e) => updateNavItem(i, 'label', e.target.value)}
                      placeholder="Label" {...focusProps} />
                    <input style={smallInput} value={item.url} onChange={(e) => updateNavItem(i, 'url', e.target.value)}
                      placeholder="URL" {...focusProps} />
                    <button onClick={() => removeNavItem(i)} style={{
                      display:'flex', alignItems:'center', justifyContent:'center',
                      width:36, height:36, border:'1px solid #e5e7eb', borderRadius:8,
                      cursor:'pointer', background:'#fff', color:'#ef4444', flexShrink:0,
                    }}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div style={card}>
        <div style={cardHeader}><FileText size={18} /> Page Content</div>
        <div style={cardBody}>
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div>
              <label style={labelStyle}>App Name</label>
              <input style={inputStyle} value={form.appName} onChange={(e) => setRootField('appName', e.target.value)}
                placeholder="VelvetSnap" {...focusProps} />
            </div>
            <div>
              <label style={labelStyle}>Tagline</label>
              <input style={inputStyle} value={form.appTagline} onChange={(e) => setRootField('appTagline', e.target.value)}
                placeholder="AI-Powered Photobooth Experience" {...focusProps} />
            </div>
            <div>
              <label style={labelStyle}>Hero Title</label>
              <input style={inputStyle} value={form.heroTitle} onChange={(e) => setRootField('heroTitle', e.target.value)}
                placeholder="Abadikan Momen Spesialmu" {...focusProps} />
            </div>
            <div>
              <label style={labelStyle}>Hero Subtitle</label>
              <input style={inputStyle} value={form.heroSubtitle} onChange={(e) => setRootField('heroSubtitle', e.target.value)}
                placeholder="Pilih frame, foto, edit..." {...focusProps} />
            </div>
            <div style={{ borderTop:'1px solid #e5e7eb', paddingTop:20 }}>
              <LogoUpload label="Logo" value={form.logo} onChange={(url) => setRootField('logo', url)} uploadImage={uploadImage} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={card}>
        <div style={cardHeader}><Image size={18} /> Footer</div>
        <div style={cardBody}>
          <div>
            <label style={labelStyle}>Footer Text</label>
            <input style={inputStyle} value={form.footer.text} onChange={(e) => updateSection('footer', 'text', e.target.value)}
              placeholder="VelvetSnap Photobooth Platform"
              {...focusProps} />
          </div>
        </div>
      </div>

      {/* System */}
      <div style={card}>
        <div style={cardHeader}><Timer size={18} /> System</div>
        <div style={cardBody}>
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div className={styles.row}>
              <div>
                <label style={{ ...labelStyle, display:'flex', alignItems:'center', gap:6 }}>
                  <Timer size={14} /> Session Timer (menit)
                </label>
                <input type="number" value={Math.round(form.system.sessionTimer / 60)} onChange={(e) => updateSection('system', 'sessionTimer', Math.max(1, Number(e.target.value)) * 60)}
                  style={inputStyle} min={1} step={1}
                  {...focusProps} />
              </div>
              <div>
                <label style={labelStyle}>Slideshow Interval (ms)</label>
                <input type="number" value={form.system.slideshowInterval} onChange={(e) => updateSection('system', 'slideshowInterval', Number(e.target.value))}
                  style={inputStyle} min={1000} step={500}
                  {...focusProps} />
              </div>
            </div>
            <div style={{ borderTop:'1px solid #e5e7eb', paddingTop:20 }}>
            <div className={styles.row}>
                <div>
                  <label style={labelStyle}>Primary Color</label>
                  <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                    <input type="color" value={form.system.primaryColor} onChange={(e) => updateSection('system', 'primaryColor', e.target.value)}
                      style={{ width:44, height:44, border:'1.5px solid #d1d5db', borderRadius:10, padding:3, cursor:'pointer', background:'none' }} />
                    <input style={{ ...inputStyle, width:'auto', flex:1, minWidth:0 }} value={form.system.primaryColor} onChange={(e) => updateSection('system', 'primaryColor', e.target.value)}
                      {...focusProps} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Accent Color</label>
                  <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                    <input type="color" value={form.system.accentColor} onChange={(e) => updateSection('system', 'accentColor', e.target.value)}
                      style={{ width:44, height:44, border:'1.5px solid #d1d5db', borderRadius:10, padding:3, cursor:'pointer', background:'none' }} />
                    <input style={{ ...inputStyle, width:'auto', flex:1, minWidth:0 }} value={form.system.accentColor} onChange={(e) => updateSection('system', 'accentColor', e.target.value)}
                      {...focusProps} />
                  </div>
                </div>
              </div>
            </div>
            <div style={{ borderTop:'1px solid #e5e7eb', paddingTop:20, display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <input type="checkbox" checked={form.system.showPreloader} onChange={(e) => updateSection('system', 'showPreloader', e.target.checked)}
                  style={{ width:18, height:18, accentColor:'#111827' }} />
                <span style={{ fontSize:14, color:'#374151' }}>Show Preloader Animation</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <input type="checkbox" checked={form.system.showStrips} onChange={(e) => updateSection('system', 'showStrips', e.target.checked)}
                  style={{ width:18, height:18, accentColor:'#111827' }} />
                <span style={{ fontSize:14, color:'#374151' }}>Show Recent Strips Carousel</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security */}
      <div style={card}>
        <div style={cardHeader}><Lock size={18} /> Security</div>
        <div style={cardBody}>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div>
              <label style={labelStyle}>New Password</label>
              <div style={{ display:'flex', gap:10 }}>
                <input type="password" value={newPass} onChange={(e) => { setNewPass(e.target.value); setPassSaved(false); setPassErr(''); }}
                  style={{ ...inputStyle, flex:1 }} placeholder="Minimal 4 karakter"
                  {...focusProps} />
                <button onClick={handleSavePass} disabled={passSaving || passSaved || !newPass}
                  style={{
                    display:'inline-flex', alignItems:'center', gap:6,
                    padding:'10px 20px', borderRadius:10, border:'none',
                    fontSize:14, fontWeight:600, cursor:passSaving || passSaved || !newPass ? 'default' : 'pointer',
                    background:passSaved ? '#10b981' : '#111827', color:'#fff',
                    opacity:passSaving ? 0.6 : 1, whiteSpace:'nowrap', transition:'all 0.15s',
                  }}>
                  {passSaving ? <Loader2 className="spin" size={16} /> : passSaved ? <Check size={16} /> : <Save size={16} />}
                  {passSaving ? '...' : passSaved ? 'Tersimpan' : 'Simpan'}
                </button>
              </div>
              {passErr && <p style={{ color:'#ef4444', fontSize:12, marginTop:4 }}>{passErr}</p>}
            </div>
          </div>
        </div>
      </div>

      <AdminConfirmModal
        open={confirmSave}
        onClose={() => setConfirmSave(false)}
        onConfirm={handleSave}
        title="Simpan Pengaturan?"
        message="Apakah anda yakin ingin menyimpan perubahan pengaturan?"
        confirmLabel="Simpan"
        loading={saving}
        variant="primary"
      />

      <AdminModal open={successOpen} onClose={() => setSuccessOpen(false)} title="Berhasil">
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, padding:'20px 0' }}>
          <CheckCircle size={48} color="#10b981" />
          <p style={{ color:'var(--text-secondary)', fontSize:14, margin:0 }}>Pengaturan berhasil disimpan.</p>
        </div>
      </AdminModal>

    </div>
  );
}

function LogoUpload({ label, value, onChange, uploadImage }: {
  label: string; value: string; onChange: (url: string) => void;
  uploadImage: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <label style={{ fontSize:13, fontWeight:600, marginBottom:8, display:'block', color:'#374151' }}>{label}</label>
      {value && (
        <div style={{ position:'relative', marginBottom:8, borderRadius:10, overflow:'hidden', border:'1px solid #e5e7eb', maxWidth:200 }}>
          <img src={value} alt="" style={{ width:'100%', height:100, objectFit:'cover', display:'block' }} />
          <button onClick={() => onChange('')} style={{
            position:'absolute', top:4, right:4, width:24, height:24, borderRadius:'50%', border:'none',
            background:'rgba(0,0,0,0.5)', color:'#fff', fontSize:14, lineHeight:'24px', textAlign:'center',
            cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', padding:0,
          }}>&times;</button>
        </div>
      )}
      <button onClick={() => inputRef.current?.click()} style={{
        display:'inline-flex', alignItems:'center', gap:6,
        padding:'8px 16px', borderRadius:8, border:'1px solid #d1d5db',
        fontSize:13, fontWeight:600, cursor:'pointer',
        background:'#f9fafb', color:'#374151',
      }}>
        <Upload size={14} /> {value ? 'Ganti' : 'Upload'}
      </button>
      <input ref={inputRef} type="file" accept="image/*" style={{ display:'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); }} />
    </div>
  );
}
