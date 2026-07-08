// File: src/app/admin/settings/page.tsx
// Description: Auto-added top comment for easier file identification.

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Image, Timer, Lock, Check, MapPin, Plus, Trash2, CheckCircle, FileText, Upload, Layout } from 'lucide-react';
import { adminFetch } from '@/lib/utils/admin-fetch';
import { STORAGE_KEYS, LOGOUT_REDIRECT_DELAY, SAVED_MSG_TIMEOUT } from '@/lib/utils/constants';
import { AdminConfirmModal, AdminModal, AdminPageHeader } from '@/app/admin/components';
import styles from './page.module.css';

interface NavItem { label: string; url: string; }

interface SettingsData {
  header: { location: string; navItems: string };
  footer: { text: string };
  system: { primaryColor: string; accentColor: string; showPreloader: boolean; showStrips: boolean; slideshowInterval: number; sessionTimer: number };
  heroSubtitle: string;
  appName: string;
  appTagline: string;
  logo: string;
  cardSmallHtml: string;
  cardPromoHtml: string;
  slideshowImages: string[];
  uiTheme: string;
}

const defaults: SettingsData = {
  header: { location: 'Jakarta', navItems: '[{"label":"Instagram","url":"https://instagram.com"},{"label":"WhatsApp","url":"https://wa.me/628123456789"},{"label":"Templates","url":"/templates"},{"label":"Studio","url":"/strips-studio"}]' },
  footer: { text: 'VelvetSnap Photobooth Platform' },
  system: { primaryColor: '#262626', accentColor: '#C5D89D', showPreloader: true, showStrips: true, slideshowInterval: 3000, sessionTimer: 600 },
  heroSubtitle: 'Pilih frame, foto, edit, dan dapatkan hasil cetakan berkualitas tinggi dalam hitungan menit',
  appName: 'VelvetSnap',
  appTagline: 'AI-Powered Photobooth Experience',
  logo: '',
  cardSmallHtml: '',
  cardPromoHtml: '',
  slideshowImages: [],
  uiTheme: 'v1',
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
  const [isRoot, setIsRoot] = useState(true);
  const [newPass, setNewPass] = useState('');
  const [passSaving, setPassSaving] = useState(false);
  const [passSaved, setPassSaved] = useState(false);
  const [passErr, setPassErr] = useState('');
  const slideUrlRef = useRef<HTMLInputElement>(null);
  const slideUploadRef = useRef<HTMLInputElement>(null);

  const addSlideUrl = () => {
    const url = slideUrlRef.current?.value?.trim();
    if (!url) return;
    setForm((prev) => ({ ...prev, slideshowImages: [...prev.slideshowImages, url] }));
    setSaved(false);
    if (slideUrlRef.current) slideUrlRef.current.value = '';
  };

  const handleSlideUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
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
          if (res.success) {
            setForm((prev) => ({ ...prev, slideshowImages: [...prev.slideshowImages, res.url] }));
            setSaved(false);
          }
        })
        .catch((e) => { console.error('settings page fetch failed', e); })
        .finally(() => { if (slideUploadRef.current) slideUploadRef.current.value = ''; });
    };
    reader.readAsDataURL(file);
  };

  const moveSlide = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= form.slideshowImages.length) return;
    setForm((prev) => {
      const arr = [...prev.slideshowImages];
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...prev, slideshowImages: arr };
    });
    setSaved(false);
  };

  const removeSlide = (i: number) => {
    setForm((prev) => ({ ...prev, slideshowImages: prev.slideshowImages.filter((_, idx) => idx !== i) }));
    setSaved(false);
  };

  const handleAuthFail = () => {
    setAuthErr(true);
    adminFetch('/api/admin/login', { method: 'DELETE' });
    setTimeout(() => router.push('/admin/login'), LOGOUT_REDIRECT_DELAY);
  };

  useEffect(() => {
    const root = sessionStorage.getItem(STORAGE_KEYS.ADMIN_IS_ROOT);
    setIsRoot(root === '1');
    setLoading(true);
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
            heroSubtitle: d.heroSubtitle || defaults.heroSubtitle,
            appName: d.appName || defaults.appName,
            appTagline: d.appTagline || defaults.appTagline,
            logo: d.logo || '',
            cardSmallHtml: d.cardSmallHtml || '',
            cardPromoHtml: d.cardPromoHtml || '',
            slideshowImages: Array.isArray(d.slideshowImages) && d.slideshowImages.length ? d.slideshowImages : defaults.slideshowImages,
            uiTheme: d.uiTheme || defaults.uiTheme,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateSection = (section: keyof SettingsData, field: string, value: unknown) => {
    setForm((prev) => ({
      ...prev,
      [section]: { ...(prev[section] as any), [field]: value },
    }));
    setSaved(false);
  };

  const setRootField = (field: keyof Omit<SettingsData, 'header' | 'footer' | 'system'>, value: unknown) => {
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
      if (json.success) { setSaved(true); setSuccessOpen(true); try { new BroadcastChannel('velvetsnap').postMessage('settings-updated'); } catch (e) { console.error('BroadcastChannel postMessage failed', e); } }
      else setSaveErr(json.error || 'Gagal menyimpan');
    } catch (e: unknown) {
      setSaveErr(e instanceof Error ? e.message : String(e));
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
      if (json.success) { setPassSaved(true); setNewPass(''); setTimeout(() => setPassSaved(false), SAVED_MSG_TIMEOUT); }
      else setPassErr(json.error || 'Gagal');
    } catch { setPassErr('Network error'); }
    setPassSaving(false);
  };

  if (authErr) {
    return (
      <div className={`flex-center ${styles.flexCenter}`}>
        <div className={styles.centerBlock}>
          <p className={styles.errorText}>Session expired</p>
          <p className={styles.mutedText}>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`flex-center ${styles.flexCenter}`}>
        <Loader2 className="spin" size={32} />
      </div>
    );
  }

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
        .catch((e) => { console.error('settings page fetch failed', e); });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="page-stack">
        <AdminPageHeader
          title={isRoot ? 'Settings' : 'My Settings'}
          subtitle={isRoot ? 'Customize homepage appearance' : 'Customize your account homepage appearance'}
        />

      <div className={styles.sections}>
        <div className={`card card-md ${styles.section}`}>
          <div className={styles.sectionHeader}>
            <span className="section-icon"><MapPin size={20} /></span>
            <h2>Page Header</h2>
          </div>
          <div className="form-group">
            <label className="form-label">Location Name</label>
            <input className="form-input" value={form.header.location} onChange={(e) => updateSection('header', 'location', e.target.value)} placeholder="Jakarta" />
          </div>
          <div className={styles.divider}>
            <div className={`flex-row ${styles.navHeader}`}>
              <label className={`form-label ${styles.navLabel}`}>Navigation Items</label>
              <button onClick={addNavItem} className={`btn btn-ghost ${styles.addNavBtn}`}><Plus size={14} /> Add Item</button>
            </div>
            <div className="flex-col">
              {navItems.map((item, i) => (
                <div key={i} className={styles.navItem}>
                  <input className="form-input" value={item.label} onChange={(e) => updateNavItem(i, 'label', e.target.value)} placeholder="Label" />
                  <input className="form-input" value={item.url} onChange={(e) => updateNavItem(i, 'url', e.target.value)} placeholder="URL" />
                  <button onClick={() => removeNavItem(i)} className={styles.navDelBtn}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`card card-md ${styles.section}`}>
          <div className={styles.sectionHeader}>
            <span className="section-icon"><FileText size={20} /></span>
            <h2>Page Content</h2>
          </div>
          <div className="form-group">
            <label className="form-label">App Name</label>
            <input className="form-input" value={form.appName} onChange={(e) => setRootField('appName', e.target.value)} placeholder="VelvetSnap" />
          </div>
          <div className="form-group">
            <label className="form-label">Tagline</label>
            <input className="form-input" value={form.appTagline} onChange={(e) => setRootField('appTagline', e.target.value)} placeholder="AI-Powered Photobooth Experience" />
          </div>
          <div className="form-group">
            <label className="form-label">Hero Subtitle</label>
            <input className="form-input" value={form.heroSubtitle} onChange={(e) => setRootField('heroSubtitle', e.target.value)} placeholder="Pilih frame, foto, edit..." />
          </div>
          <div className={styles.divider}>
            <LogoUpload label="Logo" value={form.logo} onChange={(url) => setRootField('logo', url)} uploadImage={uploadImage} />
          </div>
          <div className={styles.divider}>
            <div className="form-group">
              <label className="form-label">Card Small HTML</label>
              <textarea className={styles.textareaField} value={form.cardSmallHtml}
                onChange={(e) => setRootField('cardSmallHtml', e.target.value)}
                placeholder="&lt;div&gt;... custom HTML untuk card kecil (akan ganti default)&lt;/div&gt;" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Card Promo HTML</label>
            <textarea className={styles.textareaField} value={form.cardPromoHtml}
              onChange={(e) => setRootField('cardPromoHtml', e.target.value)}
              placeholder="&lt;div&gt;... custom HTML untuk card promo&lt;/div&gt;" />
          </div>
        </div>

        <div className={`card card-md ${styles.section}`}>
          <div className={styles.sectionHeader}>
            <span className="section-icon"><Image size={20} /></span>
            <h2>Homepage Slideshow</h2>
          </div>
          <div className="form-group">
            <label className="form-label">Add Slide Image</label>
            <div className={`flex-row ${styles.slideRow}`}>
              <input ref={slideUrlRef} className="form-input grow" placeholder="Image URL" />
              <button onClick={addSlideUrl} className={`btn btn-ghost ${styles.slideBtn}`}><Plus size={14} /> URL</button>
              <button onClick={() => slideUploadRef.current?.click()} className={`btn btn-ghost ${styles.slideBtn}`}><Upload size={14} /> Upload</button>
              <input ref={slideUploadRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleSlideUpload} />
            </div>
          </div>
          <div className="flex-col">
            <label className="form-label">Slides ({form.slideshowImages.length})</label>
            {form.slideshowImages.length === 0 && <p className={styles.emptySlides}>No slides yet. Add one above.</p>}
            {form.slideshowImages.map((src, i) => (
              <div key={i} className={styles.slideItem}>
                <img src={src} alt="" className={styles.slideThumb} />
                <span className={`grow text-ellipsis ${styles.slideName}`}>{src}</span>
                <div className={`flex-row ${styles.slideActions}`}>
                  <button onClick={() => moveSlide(i, -1)} disabled={i === 0} className={styles.slideArrow}>↑</button>
                  <button onClick={() => moveSlide(i, 1)} disabled={i === form.slideshowImages.length - 1} className={styles.slideArrow}>↓</button>
                  <button onClick={() => removeSlide(i)} className={`${styles.slideArrow} ${styles.slideDel}`}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`card card-md ${styles.section}`}>
          <div className={styles.sectionHeader}>
            <span className="section-icon"><Layout size={20} /></span>
            <h2>Footer</h2>
          </div>
          <div className="form-group">
            <label className="form-label">Footer Text</label>
            <input className="form-input" value={form.footer.text} onChange={(e) => updateSection('footer', 'text', e.target.value)} placeholder="VelvetSnap Photobooth Platform" />
          </div>
        </div>

        <div className={`card card-md ${styles.section}`}>
          <div className={styles.sectionHeader}>
            <span className="section-icon"><Timer size={20} /></span>
            <h2>System</h2>
          </div>
          <div className={styles.row}>
            <div className="form-group">
              <label className={`form-label ${styles.rowLabel}`}><Timer size={14} /> Session Timer (menit)</label>
              <input type="number" className="form-input" value={Math.round(form.system.sessionTimer / 60)} onChange={(e) => updateSection('system', 'sessionTimer', Math.max(1, Number(e.target.value)) * 60)} min={1} step={1} />
            </div>
            <div className="form-group">
              <label className="form-label">Slideshow Interval (ms)</label>
              <input type="number" className="form-input" value={form.system.slideshowInterval} onChange={(e) => updateSection('system', 'slideshowInterval', Number(e.target.value))} min={1000} step={500} />
            </div>
          </div>
          <div className={styles.divider}>
            <div className={styles.row}>
              <div>
                <label className="form-label">Primary Color</label>
                <div className={`flex-row ${styles.colorRow}`}>
                  <input type="color" value={form.system.primaryColor} onChange={(e) => updateSection('system', 'primaryColor', e.target.value)} className={styles.colorPicker} />
                  <input className={`form-input ${styles.colorInput}`} value={form.system.primaryColor} onChange={(e) => updateSection('system', 'primaryColor', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="form-label">Accent Color</label>
                <div className={`flex-row ${styles.colorRow}`}>
                  <input type="color" value={form.system.accentColor} onChange={(e) => updateSection('system', 'accentColor', e.target.value)} className={styles.colorPicker} />
                  <input className={`form-input ${styles.colorInput}`} value={form.system.accentColor} onChange={(e) => updateSection('system', 'accentColor', e.target.value)} />
            </div>
          </div>
          <div className={styles.divider}>
            <div className="form-group">
              <label className="form-label">UI Theme</label>
              <input className="form-input" value={form.uiTheme} onChange={(e) => setRootField('uiTheme', e.target.value)} placeholder="v1, v2, v3..." />
            </div>
          </div>
        </div>
          </div>
          <div className={styles.divider}>
            <div className="flex-col">
              <label className={`flex-row ${styles.checkRow}`}>
                <input type="checkbox" checked={form.system.showPreloader} onChange={(e) => updateSection('system', 'showPreloader', e.target.checked)} className={styles.checkbox} />
                <span className={styles.checkLabel}>Show Preloader Animation</span>
              </label>
              <label className={`flex-row ${styles.checkRow}`}>
                <input type="checkbox" checked={form.system.showStrips} onChange={(e) => updateSection('system', 'showStrips', e.target.checked)} className={styles.checkbox} />
                <span className={styles.checkLabel}>Show Recent Strips Carousel</span>
              </label>
            </div>
          </div>
        </div>

        {isRoot && (
          <div className={`card card-md ${styles.section}`}>
            <div className={styles.sectionHeader}>
              <span className="section-icon"><Lock size={20} /></span>
              <h2>Security</h2>
            </div>
            <div className="form-group">
              <label className="form-label">New Root Password</label>
              <div className={`flex-row ${styles.passRow}`}>
                <input type="password" className="form-input grow" value={newPass} onChange={(e) => { setNewPass(e.target.value); setPassSaved(false); setPassErr(''); }} placeholder="Minimal 4 karakter" />
                <button onClick={handleSavePass} disabled={passSaving || passSaved || !newPass} className={`mac-button ${passSaved ? styles.saveBtnDone : ''}`}>
                  {passSaving ? <Loader2 className="spin" size={16} /> : passSaved ? <Check size={16} /> : <Save size={16} />}
                  {passSaving ? '...' : passSaved ? 'Tersimpan' : 'Simpan'}
                </button>
              </div>
              {passErr && <p className={styles.passErr}>{passErr}</p>}
            </div>
          </div>
        )}
      </div>

      <div className={styles.saveBar}>
        <button onClick={() => setConfirmSave(true)} disabled={saving || saved} className={`mac-button ${saved ? styles.saveBtnDone : ''}`}>
          {saving ? <Loader2 className="spin" size={16} /> : saved ? null : <Save size={16} />}
          {saving ? 'Menyimpan...' : saved ? 'Tersimpan' : 'Simpan'}
        </button>
        {saved && <span className={styles.savedMsg}><CheckCircle size={16} /> Pengaturan tersimpan!</span>}
        {saveErr && <span className={styles.saveErr}>{saveErr}</span>}
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
        <div className={`flex-col flex-center ${styles.successBlock}`}>
          <CheckCircle size={48} color="#10b981" />
          <p className={styles.successText}>Pengaturan berhasil disimpan.</p>
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
      <label className={`form-label ${styles.logoLabel}`}>{label}</label>
      {value && (
        <div className={styles.logoPreview}>
          <img src={value} alt="" className={styles.logoImg} />
          <button onClick={() => onChange('')} className={styles.logoDel}>&times;</button>
        </div>
      )}
      <button onClick={() => inputRef.current?.click()} className={`btn btn-ghost ${styles.logoBtn}`}>
        <Upload size={14} /> {value ? 'Ganti' : 'Upload'}
      </button>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); }} />
    </div>
  );
}
