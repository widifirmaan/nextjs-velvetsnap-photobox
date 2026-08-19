'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface DownloadTx {
  _id?: string;
  finalImage?: string;
  captures?: string[];
  videos?: string[];
  price?: number;
}

interface DownloadSettings {
  uiTheme?: string;
  appName?: string;
  header?: { location?: string; navItems?: string };
}

export function useDownloadData() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [tx, setTx] = useState<DownloadTx | null>(null);
  const [settings, setSettings] = useState<DownloadSettings | null>(null);
  const [host, setHost] = useState('');

  useEffect(() => {
    if (!id) return;
    setHost(window.location.host);
    Promise.all([
      fetch(`/api/transactions/${id}`).then(r => r.json()).catch(() => ({ success: false })),
      fetch('/api/settings').then(r => r.json()).catch(() => ({ success: false, data: { uiTheme: 'v1' } })),
    ]).then(([txRes, settingsRes]) => {
      if (txRes.success) setTx(txRes.data);
      if (settingsRes.success) setSettings(settingsRes.data);
    });
  }, [id]);

  return { id, tx, settings, host };
}
