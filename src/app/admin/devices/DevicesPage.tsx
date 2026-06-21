'use client';

import { useState, useEffect } from 'react';
import { Camera, Save, Monitor, Printer, RefreshCw, CheckCircle, Usb } from 'lucide-react';
import AdminPageHeader from '@/app/admin/components/AdminPageHeader';
import styles from './page.module.css';
import { STORAGE_KEYS } from '@/lib/constants';

interface DeviceSettings {
  cameraType: 'webcam' | 'dslr';
  camera: string;
  captureWidth: number;
  captureQuality: number;
  printCopies: number;
  printOrientation: 'portrait' | 'landscape';
  printDpi: number;
}

const DEFAULT_SETTINGS: DeviceSettings = {
  cameraType: 'webcam',
  camera: '',
  captureWidth: 1920,
  captureQuality: 100,
  printCopies: 1,
  printOrientation: 'portrait',
  printDpi: 300,
};

function loadSettings(): DeviceSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DEVICE_SETTINGS);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_SETTINGS };
}

function saveSettings(s: DeviceSettings) {
  localStorage.setItem(STORAGE_KEYS.DEVICE_SETTINGS, JSON.stringify(s));
}

export default function DevicesPage() {
  const [settings, setSettings] = useState<DeviceSettings>(DEFAULT_SETTINGS);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [saved, setSaved] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [dslrTesting, setDslrTesting] = useState(false);
  const [dslrStatus, setDslrStatus] = useState<string | null>(null);

  useEffect(() => { setSettings(loadSettings()); setInitialized(true); }, []);

  useEffect(() => {
    if (!initialized) return;
    (async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        const sorted = [...videoDevices].sort((a, b) => {
          const score = (label: string) => {
            const l = label.toLowerCase();
            if (l.includes('front') || l.includes('facetime') || l.includes('built-in')) return 0;
            if (l.includes('back') || l.includes('rear') || l.includes('external')) return 1;
            return 2;
          };
          return score(a.label) - score(b.label);
        });
        setCameras(sorted);
        if (sorted.length > 0) {
          setSettings((prev) => {
            const matches = prev.camera && sorted.some((d) => d.deviceId === prev.camera);
            if (!matches) {
              const next = { ...prev, camera: sorted[0].deviceId };
              saveSettings(next);
              return next;
            }
            return prev;
          });
        }
      } catch {}
    })();
  }, [initialized]);

  const update = <K extends keyof DeviceSettings>(key: K, value: DeviceSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const testDslr = async () => {
    setDslrTesting(true);
    setDslrStatus(null);
    try {
      const res = await fetch('/api/camera/list');
      const data = await res.json();
      if (data.cameras?.length > 0) {
        setDslrStatus(`✅ Terdeteksi: ${data.cameras.map((c: any) => c.name).join(', ')}`);
      } else {
        setDslrStatus('❌ Tidak ada kamera USB terdeteksi. Pastikan driver (gphoto2 / DigiCamControl) terinstall.');
      }
    } catch {
      setDslrStatus('❌ Gagal menghubungi server.');
    } finally {
      setDslrTesting(false);
    }
  };

  return (
    <div className="page-stack">
      <AdminPageHeader
        title="Device Settings"
        subtitle="Semua pengaturan disimpan di browser (localStorage) — setiap perangkat punya pengaturannya sendiri."
      />

      <div className={styles.sections}>
        <div className={`card card-md ${styles.section}`}>
          <div className={styles.sectionHeader}>
            <span className="section-icon"><Camera size={20} /></span>
            <h2>Camera Type</h2>
          </div>
          <div className={styles.cameraTypeRow}>
            <label className={`${styles.typeCard} ${settings.cameraType === 'webcam' ? styles.typeCardActive : ''}`}>
              <input type="radio" name="cameraType" value="webcam" checked={settings.cameraType === 'webcam'} onChange={() => update('cameraType', 'webcam')} />
              <Monitor size={22} />
              <span className={styles.typeLabel}>Webcam</span>
              <span className={styles.typeDesc}>Browser built-in camera</span>
            </label>
            <label className={`${styles.typeCard} ${settings.cameraType === 'dslr' ? styles.typeCardActive : ''}`}>
              <input type="radio" name="cameraType" value="dslr" checked={settings.cameraType === 'dslr'} onChange={() => update('cameraType', 'dslr')} />
              <Usb size={22} />
              <span className={styles.typeLabel}>DSLR / Mirrorless</span>
              <span className={styles.typeDesc}>Canon, Sony, Nikon via USB</span>
            </label>
          </div>

          {settings.cameraType === 'webcam' && (
            <div className={styles.sectionBody}>
              {cameras.length === 0 ? (
                <p className={styles.emptyText}>Mencari kamera atau izin belum diberikan...</p>
              ) : (
                <div className={styles.cameraList}>
                  {cameras.map((cam) => (
                    <label key={cam.deviceId} className={`${styles.radioCard} ${settings.camera === cam.deviceId ? styles.radioCardActive : ''}`}>
                      <input type="radio" name="camera" value={cam.deviceId} checked={settings.camera === cam.deviceId} onChange={() => update('camera', cam.deviceId)} />
                      <Monitor size={18} />
                      <span>{cam.label || `Camera ${cam.deviceId.slice(0, 8)}...`}</span>
                      {settings.camera === cam.deviceId && <CheckCircle size={16} className={styles.checked} />}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {settings.cameraType === 'dslr' && (
            <div className={styles.sectionBody}>
              <p className={`${styles.emptyText} ${styles.sectionBodyMb}`}>
                Gunakan kamera DSLR/mirrorless yang terhubung via USB. Membutuhkan <strong>gphoto2</strong> (Linux/macOS) atau <strong>DigiCamControl</strong> (Windows) di server.
              </p>
              <button className={`mac-button secondary ${styles.macBtnSm}`} onClick={testDslr} disabled={dslrTesting}>
                <RefreshCw size={16} className={dslrTesting ? 'spin' : ''} /> {dslrTesting ? 'Memeriksa...' : 'Deteksi Kamera USB'}
              </button>
              {dslrStatus && <p className={styles.dslrStatus}>{dslrStatus}</p>}
            </div>
          )}
        </div>

        <div className={`card card-md ${styles.section}`}>
          <div className={styles.sectionHeader}>
            <span className="section-icon"><Camera size={20} /></span>
            <h2>Capture</h2>
          </div>
          <div className={styles.fieldGroup}>
            <div className="form-group">
              <label className="form-label">Resolution (width)</label>
              <select className="form-input" value={settings.captureWidth} onChange={(e) => update('captureWidth', Number(e.target.value))}>
                <option value="1280">1280 px</option>
                <option value="1920">1920 px</option>
                <option value="2560">2560 px</option>
                <option value="3840">3840 px</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">JPEG Quality</label>
              <div className={styles.rangeRow}>
                <input type="range" min="50" max="100" value={settings.captureQuality} onChange={(e) => update('captureQuality', Number(e.target.value))} />
                <span className={styles.rangeVal}>{settings.captureQuality}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className={`card card-md ${styles.section}`}>
          <div className={styles.sectionHeader}>
            <span className="section-icon"><Printer size={20} /></span>
            <h2>Print</h2>
          </div>
          <div className={styles.fieldGroup}>
            <div className="form-group">
              <label className="form-label">Copies</label>
              <input className="form-input" type="number" min="1" max="99" value={settings.printCopies} onChange={(e) => update('printCopies', Math.max(1, Math.min(99, Number(e.target.value))))} />
            </div>
            <div className="form-group">
              <label className="form-label">Orientation</label>
              <select className="form-input" value={settings.printOrientation} onChange={(e) => update('printOrientation', e.target.value as 'portrait' | 'landscape')}>
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">DPI</label>
              <select className="form-input" value={settings.printDpi} onChange={(e) => update('printDpi', Number(e.target.value))}>
                <option value="150">150 DPI</option>
                <option value="300">300 DPI</option>
                <option value="600">600 DPI</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.saveBar}>
        <button className="mac-button" onClick={handleSave}>
          <Save size={18} /> Simpan Pengaturan
        </button>
        {saved && <span className={styles.savedMsg}><CheckCircle size={16} /> Pengaturan tersimpan!</span>}
        <span className={styles.storageBadge}>localStorage &mdash; perangkat ini saja</span>
      </div>
    </div>
  );
}
