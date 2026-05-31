'use client';

import { useState, useEffect } from 'react';
import { Camera, Save, Monitor, Printer, RefreshCw, CheckCircle } from 'lucide-react';
import styles from './page.module.css';

interface DeviceSettings {
  camera: string;
  captureWidth: number;
  captureQuality: number;
  printCopies: number;
  printOrientation: 'portrait' | 'landscape';
  printDpi: number;
}

const LS_KEY = 'photobooth_device_settings';

const DEFAULT_SETTINGS: DeviceSettings = {
  camera: '',
  captureWidth: 1920,
  captureQuality: 85,
  printCopies: 1,
  printOrientation: 'portrait',
  printDpi: 300,
};

function loadSettings(): DeviceSettings {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_SETTINGS };
}

function saveSettings(s: DeviceSettings) {
  localStorage.setItem(LS_KEY, JSON.stringify(s));
}

export default function DevicesPage() {
  const [settings, setSettings] = useState<DeviceSettings>(DEFAULT_SETTINGS);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [saved, setSaved] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    (async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        setCameras(videoDevices);
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

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className="title" style={{ textAlign: 'left', marginBottom: '8px' }}>Device Settings</h1>
          <p className="subtitle" style={{ textAlign: 'left', marginBottom: 0 }}>
            Semua pengaturan disimpan di browser (localStorage) — setiap perangkat punya pengaturannya sendiri.
          </p>
        </div>
      </div>

      <div className={styles.sections}>
        {/* Camera */}
        <div className={`glass-panel ${styles.section}`}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}><Camera size={20} /></span>
            <h2>Camera</h2>
          </div>
          {cameras.length === 0 ? (
            <p className={styles.emptyText}>Mencari kamera atau izin belum diberikan...</p>
          ) : (
            <div className={styles.cameraList}>
              {cameras.map((cam) => (
                <label
                  key={cam.deviceId}
                  className={`${styles.radioCard} ${settings.camera === cam.deviceId ? styles.radioCardActive : ''}`}
                >
                  <input
                    type="radio"
                    name="camera"
                    value={cam.deviceId}
                    checked={settings.camera === cam.deviceId}
                    onChange={() => update('camera', cam.deviceId)}
                  />
                  <Monitor size={18} />
                  <span>{cam.label || `Camera ${cam.deviceId.slice(0, 8)}...`}</span>
                  {settings.camera === cam.deviceId && <CheckCircle size={16} className={styles.checked} />}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Capture */}
        <div className={`glass-panel ${styles.section}`}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}><Camera size={20} /></span>
            <h2>Capture</h2>
          </div>
          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label>Resolution (width)</label>
              <select
                value={settings.captureWidth}
                onChange={(e) => update('captureWidth', Number(e.target.value))}
              >
                <option value="1280">1280 px</option>
                <option value="1920">1920 px</option>
                <option value="2560">2560 px</option>
                <option value="3840">3840 px</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>JPEG Quality</label>
              <div className={styles.rangeRow}>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={settings.captureQuality}
                  onChange={(e) => update('captureQuality', Number(e.target.value))}
                />
                <span className={styles.rangeVal}>{settings.captureQuality}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Print */}
        <div className={`glass-panel ${styles.section}`}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}><Printer size={20} /></span>
            <h2>Print</h2>
          </div>
          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label>Copies</label>
              <input
                type="number"
                min="1"
                max="99"
                value={settings.printCopies}
                onChange={(e) => update('printCopies', Math.max(1, Math.min(99, Number(e.target.value))))}
              />
            </div>
            <div className={styles.field}>
              <label>Orientation</label>
              <select
                value={settings.printOrientation}
                onChange={(e) => update('printOrientation', e.target.value as 'portrait' | 'landscape')}
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>DPI</label>
              <select
                value={settings.printDpi}
                onChange={(e) => update('printDpi', Number(e.target.value))}
              >
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
        {saved && (
          <span className={styles.savedMsg}>
            <CheckCircle size={16} /> Pengaturan tersimpan!
          </span>
        )}
        <span className={styles.storageBadge}>localStorage &mdash; perangkat ini saja</span>
      </div>
    </div>
  );
}
