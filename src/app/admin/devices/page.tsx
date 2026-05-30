'use client';

import { useState, useEffect } from 'react';
import { Camera, CheckCircle, Save } from 'lucide-react';

export default function DevicesAdmin() {
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const getDevices = async () => {
      try {
        // Minta izin kamera agar label kamera terbaca
        await navigator.mediaDevices.getUserMedia({ video: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        setCameras(videoDevices);
        
        const stored = localStorage.getItem('preferred_camera');
        if (stored && videoDevices.find(d => d.deviceId === stored)) {
          setSelectedDevice(stored);
        } else if (videoDevices.length > 0) {
          setSelectedDevice(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error("Error accessing media devices", err);
      }
    };
    
    getDevices();
  }, []);

  const handleSave = () => {
    localStorage.setItem('preferred_camera', selectedDevice);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="title" style={{ textAlign: 'left', marginBottom: '8px' }}>Camera Setup</h1>
        <p className="subtitle" style={{ textAlign: 'left', marginBottom: 0 }}>Pilih hardware kamera yang akan digunakan di aplikasi Photobooth ini.</p>
      </div>

      <div className={`glass-panel`} style={{ padding: '32px', maxWidth: '600px' }}>
        <h2 style={{ marginBottom: '24px' }}>Kamera Terdeteksi</h2>
        
        {cameras.length === 0 ? (
          <p>Mencari kamera atau izin kamera belum diberikan...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {cameras.map((cam) => (
              <div 
                key={cam.deviceId} 
                onClick={() => setSelectedDevice(cam.deviceId)}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: `2px solid ${selectedDevice === cam.deviceId ? 'var(--accent-color)' : 'var(--glass-border)'}`,
                  background: selectedDevice === cam.deviceId ? 'rgba(0, 122, 255, 0.05)' : 'var(--bg-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'all 0.2s'
                }}
              >
                <Camera color={selectedDevice === cam.deviceId ? 'var(--accent-color)' : 'var(--text-secondary)'} />
                <div style={{ flex: 1, fontWeight: 500 }}>
                  {cam.label || `Camera ${cam.deviceId.substring(0, 5)}...`}
                </div>
                {selectedDevice === cam.deviceId && <CheckCircle color="var(--accent-color)" />}
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="mac-button" onClick={handleSave} disabled={cameras.length === 0}>
            <Save size={20} /> Simpan Pengaturan
          </button>
          {saved && <span style={{ color: '#34c759', fontWeight: 500 }}>Kamera aktif tersimpan!</span>}
        </div>
      </div>
    </div>
  );
}
